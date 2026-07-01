// Webhook do WhatsApp (Meta Cloud API) — mesmo cérebro do site.
//
// GET  → verificação do webhook (a Meta chama uma vez ao configurar).
// POST → mensagens recebidas; responde com a IA pela Graph API.
//
// Variáveis de ambiente necessárias (configurar na Netlify quando ligar a Fase 2):
//   WHATSAPP_VERIFY_TOKEN     → token que você inventa e cola também no painel da Meta
//   WHATSAPP_TOKEN            → access token da Cloud API (Meta)
//   WHATSAPP_PHONE_NUMBER_ID  → ID do número remetente (Cloud API)
//   GEMINI_API_KEY            → chave do cérebro de IA
//
// Memória de conversa: em memória do contêiner (best-effort). Para histórico
// persistente entre reinícios, migrar para Supabase/Redis.

import {
  buildSystemPrompt,
  geminiText,
  geminiLead,
  leadPersistenceEnabled,
  persistLead,
  type ChatMessage,
} from '../lib/shared'
import { PRODUCTS, STORE } from '../lib/catalog'

const GRAPH = 'https://graph.facebook.com/v21.0'
const HISTORY_LIMIT = 12

const conversations = new Map<string, ChatMessage[]>()
// Quem já teve o lead extraído nesta instância — evita gastar IA a cada mensagem.
const captured = new Set<string>()

function remember(from: string, role: ChatMessage['role'], text: string) {
  const history = conversations.get(from) ?? []
  history.push({ role, text })
  conversations.set(from, history.slice(-HISTORY_LIMIT))
  if (conversations.size > 2000) conversations.clear()
}

/**
 * Quando há interesse real, extrai os dados do cliente e atualiza o CRM (ficha
 * em Clientes + funil). Só roda se o backend (Supabase) estiver configurado —
 * caso contrário não há onde gravar e nem gastamos IA. Uma vez por conversa.
 */
async function captureLead(from: string): Promise<void> {
  if (!leadPersistenceEnabled() || captured.has(from)) return
  const history = conversations.get(from) ?? []
  // Precisa de troca real (cliente + bot) para valer a extração.
  if (history.filter((m) => m.role === 'user').length < 1 || history.length < 2) return

  captured.add(from)
  try {
    const draft = await geminiLead(history)
    if (!draft) return // sem interesse identificável ainda
    await persistLead({ ...draft, id: from, channel: 'whatsapp' })
  } catch (err) {
    console.error('WhatsApp captureLead erro:', err)
    captured.delete(from) // permite tentar de novo na próxima mensagem
  }
}

async function sendWhatsApp(to: string, text: string): Promise<void> {
  const token = process.env.WHATSAPP_TOKEN
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID
  if (!token || !phoneId) {
    console.error('WhatsApp: WHATSAPP_TOKEN ou WHATSAPP_PHONE_NUMBER_ID ausente')
    return
  }
  const res = await fetch(`${GRAPH}/${phoneId}/messages`, {
    method: 'POST',
    headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to,
      text: { body: text.slice(0, 4096) },
    }),
  })
  if (!res.ok) console.error('WhatsApp send falhou:', res.status, await res.text().catch(() => ''))
}

// Tipagem mínima do payload de entrada da Cloud API.
interface IncomingMessage {
  from?: string
  text?: { body?: string }
  type?: string
}
interface WebhookBody {
  entry?: { changes?: { value?: { messages?: IncomingMessage[] } }[] }[]
}

export default async (request: Request): Promise<Response> => {
  const url = new URL(request.url)

  // 1) Verificação do webhook (Meta)
  if (request.method === 'GET') {
    const mode = url.searchParams.get('hub.mode')
    const token = url.searchParams.get('hub.verify_token')
    const challenge = url.searchParams.get('hub.challenge')
    if (mode === 'subscribe' && token && token === process.env.WHATSAPP_VERIFY_TOKEN) {
      return new Response(challenge ?? '', { status: 200 })
    }
    return new Response('Forbidden', { status: 403 })
  }

  if (request.method !== 'POST') return new Response('Method not allowed', { status: 405 })

  let body: WebhookBody
  try {
    body = (await request.json()) as WebhookBody
  } catch {
    return new Response('OK', { status: 200 }) // sempre 200 para a Meta não reenviar
  }

  const msg = body.entry?.[0]?.changes?.[0]?.value?.messages?.[0]
  const from = msg?.from
  const text = msg?.text?.body?.trim()

  // Só tratamos mensagens de texto; o resto é confirmado com 200 e ignorado.
  if (!from || !text || msg?.type !== 'text') return new Response('OK', { status: 200 })

  // Responde de forma assíncrona; a Meta exige 200 rápido.
  ;(async () => {
    try {
      remember(from, 'user', text)
      const system = buildSystemPrompt(STORE, PRODUCTS)
      const reply = await geminiText(system, conversations.get(from) ?? [], 512)
      const finalReply =
        reply || 'Posso te ajudar a escolher sua bike elétrica! O que você procura?'
      remember(from, 'model', finalReply)
      await sendWhatsApp(from, finalReply)
      // Atualiza o CRM em segundo plano (se o backend estiver ligado).
      await captureLead(from)
    } catch (err) {
      console.error('WhatsApp handler erro:', err)
      await sendWhatsApp(
        from,
        'Tive um probleminha agora. Um atendente já te responde por aqui!',
      )
    }
  })()

  return new Response('OK', { status: 200 })
}
