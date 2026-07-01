// Endpoint do chat do site: POST /.netlify/functions/chat
// Recebe { messages, products, store } do widget e devolve a resposta da IA em streaming.

import {
  buildSystemPrompt,
  geminiStream,
  rateLimited,
  sanitizeMessages,
  MissingKeyError,
  type BotConfig,
  type BotProduct,
  type BotStore,
} from '../lib/shared'

/** Saneia a config do bot vinda do cliente: só strings, com limite de tamanho. */
function sanitizeBotConfig(input: unknown): BotConfig | undefined {
  if (!input || typeof input !== 'object') return undefined
  const raw = input as Record<string, unknown>
  const str = (v: unknown) => (typeof v === 'string' ? v.slice(0, 4000) : '')
  const bot: BotConfig = { instructions: str(raw.instructions), knowledge: str(raw.knowledge) }
  return bot.instructions || bot.knowledge ? bot : undefined
}

function clientIp(request: Request): string {
  return (
    request.headers.get('x-nf-client-connection-ip') ||
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    'unknown'
  )
}

function jsonError(message: string, status: number): Response {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { 'content-type': 'application/json' },
  })
}

export default async (request: Request): Promise<Response> => {
  if (request.method !== 'POST') return jsonError('Método não permitido', 405)

  if (rateLimited(clientIp(request))) {
    return jsonError('Muitas mensagens em pouco tempo. Aguarde um instante.', 429)
  }

  let body: { messages?: unknown; products?: unknown; store?: unknown; bot?: unknown }
  try {
    body = await request.json()
  } catch {
    return jsonError('Corpo inválido', 400)
  }

  const messages = sanitizeMessages(body.messages)
  if (!messages.length) return jsonError('Nenhuma mensagem enviada', 400)

  const products = (Array.isArray(body.products) ? body.products : []) as BotProduct[]
  const store = (body.store && typeof body.store === 'object' ? body.store : {}) as BotStore
  const bot = sanitizeBotConfig(body.bot)
  const system = buildSystemPrompt(store, products.slice(0, 80), bot)

  const encoder = new TextEncoder()
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const chunk of geminiStream(system, messages)) {
          controller.enqueue(encoder.encode(chunk))
        }
      } catch (err) {
        const fallback =
          err instanceof MissingKeyError
            ? 'O atendimento por IA ainda não foi ativado (falta configurar a chave). Fale com a gente no WhatsApp!'
            : 'Tive um probleminha agora. Pode tentar de novo ou falar direto no WhatsApp.'
        controller.enqueue(encoder.encode(fallback))
      } finally {
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'content-type': 'text/plain; charset=utf-8',
      'cache-control': 'no-store',
    },
  })
}
