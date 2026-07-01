import type { BotConfig, Product, StoreInfo } from '@/lib/types'
import { CATEGORIES } from '@/data/seed'

export interface ChatTurn {
  role: 'user' | 'model'
  text: string
}

/** Forma enxuta do produto enviada ao backend (só o que a IA precisa saber). */
interface WireProduct {
  name: string
  category: string
  brand?: string
  price: number
  compareAtPrice?: number
  stock: number
  description?: string
  specs?: Product['specs']
  image?: string
}

const catName = (slug: string) => CATEGORIES.find((c) => c.slug === slug)?.name ?? slug

/** Catálogo vivo da loja (apenas produtos ativos), pronto para o backend. */
export function toWireProducts(products: Product[]): WireProduct[] {
  return products
    .filter((p) => p.active)
    .map((p) => ({
      name: p.name,
      category: catName(p.category),
      brand: p.brand,
      price: p.price,
      compareAtPrice: p.compareAtPrice,
      stock: p.stock,
      description: p.description,
      specs: p.specs,
      image: p.image,
    }))
}

export function toWireStore(store: StoreInfo) {
  return {
    name: store.name,
    tagline: store.tagline,
    whatsappUrl: store.whatsappUrl,
    whatsapp: store.whatsapp,
    address: store.address,
    city: store.city,
    hours: store.hours,
    email: store.email,
    instagram: store.instagram,
    shippingNote: store.shippingNote,
  }
}

/**
 * Conversa com o atendente de IA via Netlify Function, em streaming.
 * Emite pedaços de texto conforme a IA responde.
 */
export async function* streamChat(
  messages: ChatTurn[],
  products: Product[],
  store: StoreInfo,
  bot: BotConfig,
  signal: AbortSignal,
): AsyncGenerator<string> {
  const res = await fetch('/.netlify/functions/chat', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      messages,
      products: toWireProducts(products),
      store: toWireStore(store),
      bot: { instructions: bot.instructions, knowledge: bot.knowledge },
    }),
    signal,
  })

  if (!res.ok || !res.body) {
    throw new Error(`chat falhou (${res.status})`)
  }

  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    const chunk = decoder.decode(value, { stream: true })
    if (chunk) yield chunk
  }
}

export interface LeadDraft {
  name?: string
  contact?: string
  interest?: string
  budget?: string
  city?: string
  summary?: string
}

/**
 * Pede ao backend para extrair os dados do cliente da conversa (para o CRM).
 * Nunca lança — se falhar, retorna null e o chat segue normal.
 */
export async function extractLead(messages: ChatTurn[]): Promise<LeadDraft | null> {
  try {
    const res = await fetch('/.netlify/functions/lead', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ messages }),
    })
    if (!res.ok) return null
    const data = (await res.json()) as LeadDraft
    if (!data || (!data.name && !data.contact && !data.interest)) return null
    return data
  } catch {
    return null
  }
}
