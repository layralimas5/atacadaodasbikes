// Cérebro do atendente de IA — compartilhado entre o site (chat.ts) e o WhatsApp (whatsapp.ts).
// Provedor: Google Gemini (plano gratuito). A chave fica SÓ em variável de ambiente,
// nunca no frontend. Para trocar pelo Claude no futuro, basta reimplementar
// geminiText/geminiStream apontando para a Anthropic — o resto continua igual.

export interface BotProduct {
  name: string
  category: string
  brand?: string
  price: number
  compareAtPrice?: number
  stock: number
  description?: string
  specs?: { motor?: string; battery?: string; range?: string; speed?: string }
  /** URL da foto real do produto — o bot pode oferecer enviá-la ao cliente. */
  image?: string
}

export interface BotStore {
  name: string
  tagline?: string
  whatsappUrl?: string
  whatsapp?: string
  address?: string
  city?: string
  hours?: string
  email?: string
  instagram?: string
  shippingNote?: string
}

export interface ChatMessage {
  role: 'user' | 'model'
  text: string
}

/** Ajustes do bot definidos pelo lojista no painel (tom, orientações, correções). */
export interface BotConfig {
  instructions?: string
  knowledge?: string
}

const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash'
const API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models'

const brl = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)

/** Monta a "ficha técnica" do catálogo que a IA usa para responder e recomendar. */
function catalogText(products: BotProduct[]): string {
  if (!products.length) return '(catálogo vazio no momento)'
  return products
    .map((p) => {
      const specs = p.specs
        ? [
            p.specs.motor && `motor ${p.specs.motor}`,
            p.specs.battery && `bateria ${p.specs.battery}`,
            p.specs.range && `autonomia ${p.specs.range}`,
            p.specs.speed && `vel. ${p.specs.speed}`,
          ]
            .filter(Boolean)
            .join(', ')
        : ''
      const preco =
        p.compareAtPrice && p.compareAtPrice > p.price
          ? `de ${brl(p.compareAtPrice)} por ${brl(p.price)}`
          : brl(p.price)
      const estoque = p.stock <= 0 ? 'ESGOTADO' : p.stock <= 5 ? `últimas ${p.stock} un.` : 'em estoque'
      return [
        `• ${p.name}${p.brand ? ` (${p.brand})` : ''} — ${p.category}`,
        `  preço: ${preco} | ${estoque}`,
        specs && `  ficha: ${specs}`,
        p.description && `  sobre: ${p.description}`,
        p.image && `  foto: tem foto real disponível (ofereça enviar quando ajudar a decidir)`,
      ]
        .filter(Boolean)
        .join('\n')
    })
    .join('\n')
}

/** Bloco com os ajustes do lojista (orientações + correções), quando houver. */
function lojistaBlock(bot?: BotConfig): string {
  if (!bot) return ''
  const parts: string[] = []
  const instructions = bot.instructions?.trim()
  const knowledge = bot.knowledge?.trim()

  if (instructions) {
    parts.push(
      `ORIENTAÇÕES DO LOJISTA (PRIORIDADE MÁXIMA — siga à risca, mesmo que conflitem com o resto)
${instructions}`,
    )
  }
  if (knowledge) {
    parts.push(
      `INFORMAÇÕES E CORREÇÕES DA LOJA (trate como verdade absoluta; corrige o que você responderia)
${knowledge}`,
    )
  }
  return parts.length ? `\n\n${parts.join('\n\n')}` : ''
}

/** System prompt do atendente — persona consultiva e focada em conversão. */
export function buildSystemPrompt(
  store: BotStore,
  products: BotProduct[],
  bot?: BotConfig,
): string {
  const contato = [
    store.address && `Endereço: ${store.address}`,
    store.city && `Cidade: ${store.city}`,
    store.hours && `Horário: ${store.hours}`,
    store.email && `E-mail: ${store.email}`,
    store.instagram && `Instagram: @${store.instagram}`,
    store.shippingNote && `Entrega/retirada: ${store.shippingNote}`,
  ]
    .filter(Boolean)
    .join('\n')

  return `Você é um(a) vendedor(a) de verdade da ${store.name}${
    store.tagline ? ` — ${store.tagline}` : ''
  }, uma loja de bicicletas elétricas. Converse pelo chat do site (e pelo WhatsApp) como uma pessoa real da loja conversaria — gente boa, atenciosa e que entende de bike.

COMO CONVERSAR (humanizado — isto é o mais importante)
- Fale como gente, não como robô. Nada de respostas genéricas, formais demais ou que parecem script.
- NÃO use emojis. Nenhum. Eles deixam a conversa com cara de robô/IA — escreva como uma pessoa real escreveria no WhatsApp, só com palavras.
- NÃO use travessão nem meia-risca ("—", "–") para conectar frases. Use vírgula, ponto ou duas frases curtas. (Hífen normal em palavras como "pós-venda" ou "e-bike" pode.)
- Responda saudações e papo do dia a dia com naturalidade. Ex.: se disserem "boa noite", responda "Boa noite! Tudo bem? Como posso te ajudar a achar sua bike hoje?".
- Uma coisa de cada vez: faça UMA pergunta por mensagem e espere a resposta. Não despeje tudo de uma vez nem mande listão.
- Mensagens curtas, no tom de WhatsApp. Use o nome do cliente quando souber. Demonstre interesse de verdade e faça perguntas de acompanhamento ("pra que você vai usar mais? cidade, trabalho, passeio?").
- Tenha calor humano: comemore junto, tranquilize dúvidas, puxe conversa. O objetivo é a pessoa se sentir bem atendida e querer fechar.
- Nunca responda "não consegui responder" nem mande o cliente embora — você está aqui para resolver.

SEU PAPEL (suporte completo, não só venda)
- Você cuida do cliente do início ao fim: antes da compra (dúvidas, recomendação), na hora de decidir e DEPOIS da compra (acompanhamento, suporte, pós-venda).
- Antes da venda: entender a necessidade e recomendar a bike ideal do catálogo, explicando o porquê.
- Pós-venda e suporte: ajudar com dúvidas de uso, bateria/carregamento, autonomia, manutenção, entrega, montagem e acompanhamento do pedido. Trate cada cliente como alguém que você conhece e quer ver bem atendido.
- Ser consultivo e caloroso, sem ser robótico. Você trabalha na loja, conhece cada produto, preço, ficha técnica e as fotos reais.
- Conduzir para a venda quando houver interesse; mas se o assunto for suporte/pós-venda, foque em resolver e tranquilizar — não force venda fora de hora.

FOTOS E DADOS DOS PRODUTOS
- Você conhece a foto real de cada produto do catálogo. Quando ajudar o cliente a decidir, ofereça com naturalidade: "quer que eu te mande uma foto dela?".
- Use os dados reais (preço, ficha técnica, estoque) para responder com precisão. Nunca chute número.

COLETA DE DADOS (faça de forma natural, sem parecer formulário)
- OBJETIVO MÍNIMO de todo atendimento: descobrir 3 coisas — (1) o NOME do cliente, (2) o NÚMERO de WhatsApp/telefone e (3) o PEDIDO (qual bike/produto ele quer ou o que está procurando). Sempre busque fechar esses três antes de encerrar.
- Peça o nome logo no começo ("antes, como é seu nome?"). Peça o número quando fizer sentido — pra enviar fotos/condições, reservar a bike ou continuar pelo WhatsApp ("me passa seu WhatsApp que te mando os detalhes e seguro a unidade?").
- Confirme o pedido com o cliente ("então seria a X50, certo?").
- Se sobrar, capte também orçamento e cidade. Nunca insista de forma chata; se não quiser informar, siga ajudando.
- Com nome + número + pedido em mãos, ofereça continuar pelo WhatsApp para fechar/agendar.

REGRAS IMPORTANTES (NÃO QUEBRE)
- Recomende APENAS produtos que estão no catálogo abaixo. Nunca invente modelos, preços ou specs.
- Nunca prometa desconto, frete grátis, prazo de entrega ou condição que não esteja descrita aqui. Para valores e negociação finais, direcione ao WhatsApp.
- Se não souber algo, seja honesto e ofereça encaminhar para um atendente humano no WhatsApp.
- Se perguntarem algo fora do contexto da loja, traga a conversa de volta gentilmente para as bikes.
- Respostas curtas e diretas (a maioria dos clientes está no celular). Use no máximo ~4 frases, salvo quando comparar produtos.
- Sempre em português do Brasil. Valores em reais (R$). Sem emojis e sem travessões (já dito acima): tom natural de pessoa real.
- Se um produto interessar e estiver com estoque baixo, gere leve urgência ("são as últimas unidades").

CATÁLOGO ATUAL
${catalogText(products)}

DADOS DA LOJA
${contato || '(sem dados de contato cadastrados)'}${lojistaBlock(bot)}

Quando for hora de fechar, oriente: "posso te chamar no WhatsApp pra acertar os detalhes?" — o app já mostra um botão de WhatsApp para o cliente.`
}

// Rede de segurança: mesmo com o prompt proibindo, garantimos no código que a
// resposta sai sem emojis e sem travessões — assim a conversa nunca soa robótica.
const EMOJI_RE =
  /[\u{1F000}-\u{1FAFF}\u{1F900}-\u{1F9FF}\u{2600}-\u{27BF}\u{2190}-\u{21FF}\u{2B00}-\u{2BFF}\u{FE00}-\u{FE0F}\u{200D}\u{20E3}\u{2122}\u{2139}\u{2328}\u{303D}\u{3297}\u{3299}]/gu

/** Limpa um pedaço do streaming sem depender do contexto vizinho (seguro entre chunks). */
function stripRoboticChunk(chunk: string): string {
  return chunk.replace(EMOJI_RE, '').replace(/\s*[—–]\s*/g, ', ')
}

/** Limpeza completa para textos inteiros (WhatsApp e mensagens fixas). */
export function humanizeReply(text: string): string {
  return text
    .replace(EMOJI_RE, '')
    .replace(/\s*[—–]\s*/g, ', ')
    .replace(/^[\s,]+/, '')
    .replace(/\s+([,.!?;:])/g, '$1')
    .replace(/,\s*([,.!?;:])/g, '$1')
    .replace(/[ \t]{2,}/g, ' ')
    .trim()
}

/** Erro de configuração quando a chave do Gemini não está definida. */
export class MissingKeyError extends Error {
  constructor() {
    super('GEMINI_API_KEY não configurada')
    this.name = 'MissingKeyError'
  }
}

interface GeminiPart {
  text?: string
}
interface GeminiCandidate {
  content?: { parts?: GeminiPart[] }
}
interface GeminiResponse {
  candidates?: GeminiCandidate[]
}

function toContents(messages: ChatMessage[]) {
  return messages.map((m) => ({ role: m.role, parts: [{ text: m.text }] }))
}

function generationConfig(maxOutputTokens: number) {
  // thinkingBudget: 0 desliga o "raciocínio" do Gemini 2.5 (mais rápido/barato e
  // evita que o or­çamento de tokens seja consumido antes da resposta).
  return {
    temperature: 0.6,
    topP: 0.9,
    maxOutputTokens,
    thinkingConfig: { thinkingBudget: 0 },
  }
}

/** Geração não-streaming (usada pelo WhatsApp). Retorna o texto final. */
export async function geminiText(
  system: string,
  messages: ChatMessage[],
  maxOutputTokens = 512,
): Promise<string> {
  const key = process.env.GEMINI_API_KEY
  if (!key) throw new MissingKeyError()

  const res = await fetch(`${API_BASE}/${GEMINI_MODEL}:generateContent?key=${key}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: system }] },
      contents: toContents(messages),
      generationConfig: generationConfig(maxOutputTokens),
    }),
  })

  if (!res.ok) {
    const detail = await res.text().catch(() => '')
    throw new Error(`Gemini ${res.status}: ${detail.slice(0, 300)}`)
  }

  const data = (await res.json()) as GeminiResponse
  const text = data.candidates?.[0]?.content?.parts?.map((p) => p.text ?? '').join('') ?? ''
  return humanizeReply(text)
}

/** Geração streaming (usada pelo site). Emite pedaços de texto conforme chegam. */
export async function* geminiStream(
  system: string,
  messages: ChatMessage[],
  maxOutputTokens = 700,
): AsyncGenerator<string> {
  const key = process.env.GEMINI_API_KEY
  if (!key) throw new MissingKeyError()

  const res = await fetch(`${API_BASE}/${GEMINI_MODEL}:streamGenerateContent?alt=sse&key=${key}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: system }] },
      contents: toContents(messages),
      generationConfig: generationConfig(maxOutputTokens),
    }),
  })

  if (!res.ok || !res.body) {
    const detail = res.body ? await res.text().catch(() => '') : ''
    throw new Error(`Gemini ${res.status}: ${detail.slice(0, 300)}`)
  }

  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })

    // SSE: blocos separados por linha em branco; cada linha "data: {json}".
    let nl: number
    while ((nl = buffer.indexOf('\n')) !== -1) {
      const line = buffer.slice(0, nl).trim()
      buffer = buffer.slice(nl + 1)
      if (!line.startsWith('data:')) continue
      const payload = line.slice(5).trim()
      if (!payload || payload === '[DONE]') continue
      try {
        const data = JSON.parse(payload) as GeminiResponse
        const text = data.candidates?.[0]?.content?.parts?.map((p) => p.text ?? '').join('') ?? ''
        if (text) {
          const cleaned = stripRoboticChunk(text)
          if (cleaned) yield cleaned
        }
      } catch {
        // linha parcial — ignora; o próximo chunk completa
      }
    }
  }
}

/** Dados do cliente extraídos da conversa (para o CRM). */
export interface LeadDraft {
  name?: string
  contact?: string
  interest?: string
  budget?: string
  city?: string
  summary?: string
}

const LEAD_SCHEMA = {
  type: 'object',
  properties: {
    name: { type: 'string' },
    contact: { type: 'string' },
    interest: { type: 'string' },
    budget: { type: 'string' },
    city: { type: 'string' },
    summary: { type: 'string' },
  },
}

/**
 * Lê a conversa e extrai os dados do cliente em JSON (para salvar no CRM).
 * Retorna null se não houver nada útil. Usa JSON estruturado do Gemini.
 */
export async function geminiLead(messages: ChatMessage[]): Promise<LeadDraft | null> {
  const key = process.env.GEMINI_API_KEY
  if (!key) throw new MissingKeyError()

  const instruction = `Você analisa uma conversa de atendimento de uma loja de bikes elétricas e extrai os dados do cliente.
Responda SOMENTE com JSON no formato pedido.
- Preencha apenas o que o CLIENTE informou de fato. Não invente.
- Deixe o campo como string vazia se não foi informado.
- "contact": telefone/WhatsApp/e-mail. "interest": produto ou tipo de bike que ele quer.
- "budget": orçamento/faixa de preço. "summary": 1 frase resumindo a necessidade do cliente.`

  const res = await fetch(`${API_BASE}/${GEMINI_MODEL}:generateContent?key=${key}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: instruction }] },
      contents: toContents(messages),
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 400,
        thinkingConfig: { thinkingBudget: 0 },
        responseMimeType: 'application/json',
        responseSchema: LEAD_SCHEMA,
      },
    }),
  })

  if (!res.ok) throw new Error(`Gemini lead ${res.status}`)

  const data = (await res.json()) as GeminiResponse
  const raw = data.candidates?.[0]?.content?.parts?.map((p) => p.text ?? '').join('') ?? ''
  if (!raw.trim()) return null

  let parsed: Record<string, unknown>
  try {
    parsed = JSON.parse(raw) as Record<string, unknown>
  } catch {
    return null
  }

  const clean = (v: unknown) => (typeof v === 'string' ? v.trim() : '')
  const draft: LeadDraft = {
    name: clean(parsed.name),
    contact: clean(parsed.contact),
    interest: clean(parsed.interest),
    budget: clean(parsed.budget),
    city: clean(parsed.city),
    summary: clean(parsed.summary),
  }

  // Só vale a pena salvar se houver algo identificável ou de interesse.
  if (!draft.name && !draft.contact && !draft.interest) return null
  return draft
}

// ===== Persistência de leads do WhatsApp (pronto p/ Supabase) =====
//
// O bot do WhatsApp roda no servidor; o CRM do painel hoje vive no localStorage
// do navegador, então não há como gravar nele a partir daqui. Quando o backend
// de dados (Supabase) for ligado, basta definir as variáveis abaixo que o lead
// do WhatsApp passa a cair no CRM automaticamente — sem mexer no resto do código.
//
//   SUPABASE_URL                → URL do projeto (ex.: https://xxxx.supabase.co)
//   SUPABASE_SERVICE_ROLE_KEY   → service role key (somente no servidor; nunca no front)
//
// Tabela esperada: public.leads (id text pk, channel text, name text, contact text,
// interest text, budget text, city text, summary text, stage text default 'novo',
// updated_at timestamptz). Proteja com RLS e use a service role só nas functions.

/** True quando o Supabase está configurado para persistir leads do servidor. */
export function leadPersistenceEnabled(): boolean {
  return !!(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY)
}

export interface PersistLeadInput extends LeadDraft {
  /** Identificador estável do lead (ex.: telefone do WhatsApp) para upsert. */
  id: string
  channel: 'site' | 'whatsapp' | 'presencial'
}

/**
 * Grava (upsert) um lead no Supabase. No-op silencioso se o backend não estiver
 * configurado — assim o WhatsApp segue funcionando e nada quebra até a migração.
 */
export async function persistLead(lead: PersistLeadInput): Promise<boolean> {
  const url = process.env.SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceKey) return false

  try {
    const res = await fetch(`${url}/rest/v1/leads?on_conflict=id`, {
      method: 'POST',
      headers: {
        apikey: serviceKey,
        authorization: `Bearer ${serviceKey}`,
        'content-type': 'application/json',
        // merge-duplicates = upsert; minimal = não devolve o corpo (mais leve).
        prefer: 'resolution=merge-duplicates,return=minimal',
      },
      body: JSON.stringify({
        id: lead.id,
        channel: lead.channel,
        name: lead.name || null,
        contact: lead.contact || null,
        interest: lead.interest || null,
        budget: lead.budget || null,
        city: lead.city || null,
        summary: lead.summary || null,
        updated_at: new Date().toISOString(),
      }),
    })
    if (!res.ok) {
      console.error('persistLead falhou:', res.status, await res.text().catch(() => ''))
      return false
    }
    return true
  } catch (err) {
    console.error('persistLead erro:', err)
    return false
  }
}

/**
 * Rate limiting best-effort por IP (em memória do contêiner quente).
 * Não é proteção definitiva — para algo robusto, migrar para um store (Supabase/Redis).
 * Já ajuda a barrar spam simples que poderia gerar custo/abuso.
 */
const hits = new Map<string, number[]>()
export function rateLimited(ip: string, max = 12, windowMs = 60_000): boolean {
  const now = Date.now()
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < windowMs)
  recent.push(now)
  hits.set(ip, recent)
  if (hits.size > 5000) hits.clear() // evita vazamento de memória
  return recent.length > max
}

/** Saneia o histórico vindo do cliente: limita quantidade e tamanho. */
export function sanitizeMessages(input: unknown): ChatMessage[] {
  if (!Array.isArray(input)) return []
  return input
    .filter(
      (m): m is ChatMessage =>
        !!m &&
        typeof m === 'object' &&
        (m as ChatMessage).role !== undefined &&
        typeof (m as ChatMessage).text === 'string',
    )
    .map((m): ChatMessage => ({
      role: m.role === 'model' ? 'model' : 'user',
      text: m.text.slice(0, 2000),
    }))
    .slice(-16)
}
