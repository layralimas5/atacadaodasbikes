import type { CartLine, StoreInfo } from '@/lib/types'
import { formatBRL } from '@/lib/format'

/** Link wa.me com mensagem pré-preenchida (quando temos só o número). */
function waMe(whatsapp: string, message: string): string {
  const digits = whatsapp.replace(/\D/g, '')
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`
}

/**
 * Resolve o link de WhatsApp da loja. Se houver um link direto configurado
 * (`whatsappUrl`, ex.: api.whatsapp.com/message/...), ele tem prioridade — esse
 * tipo de link já carrega a mensagem/atendimento configurados no WhatsApp
 * Business, então a mensagem personalizada é ignorada. Caso contrário, monta um
 * link wa.me a partir do número com a mensagem.
 */
export function whatsappHref(store: StoreInfo, message: string): string {
  if (store.whatsappUrl) return store.whatsappUrl
  return waMe(store.whatsapp, message)
}

export function productInquiryLink(store: StoreInfo, productName: string): string {
  return whatsappHref(
    store,
    `Olá! Tenho interesse na *${productName}* que vi no site. Pode me passar mais informações?`,
  )
}

export function cartCheckoutLink(store: StoreInfo, lines: CartLine[], subtotal: number): string {
  const items = lines
    .map((l) => `• ${l.quantity}x ${l.product.name} — ${formatBRL(l.product.price * l.quantity)}`)
    .join('\n')
  const message = `Olá! Quero finalizar meu pedido no Atacadão das Bikes:\n\n${items}\n\n*Total: ${formatBRL(
    subtotal,
  )}*`
  return whatsappHref(store, message)
}
