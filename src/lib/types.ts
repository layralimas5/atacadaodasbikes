// Tipos de domínio — fronteira da aplicação totalmente tipada.

export type CategorySlug = 'fat' | 'retro' | 'duplo' | 'baterias' | 'acessorios'

/** Ficha técnica resumida da e-bike (premium / conversão). */
export interface ProductSpecs {
  motor?: string
  battery?: string
  range?: string
  speed?: string
}

export interface Category {
  slug: CategorySlug
  name: string
  short: string
  description: string
  image: string
}

export interface Product {
  id: string
  name: string
  category: CategorySlug
  brand?: string
  price: number
  /** Preço "de" (antes), para evidenciar a economia do atacado. */
  compareAtPrice?: number
  stock: number
  image: string
  description: string
  specs?: ProductSpecs
  featured: boolean
  active: boolean
}

export type SaleChannel = 'whatsapp' | 'loja' | 'site'

export interface SaleItem {
  productId: string
  name: string
  unitPrice: number
  quantity: number
}

export interface Sale {
  id: string
  createdAt: string // ISO 8601
  items: SaleItem[]
  total: number
  customer?: string
  channel: SaleChannel
}

export interface StoreInfo {
  name: string
  tagline: string
  /** Apenas dígitos com DDI/DDD para o link wa.me — ex.: 5527999999999. */
  whatsapp: string
  /** Link direto do WhatsApp (ex.: api.whatsapp.com/message/...). Tem prioridade
   *  sobre `whatsapp` quando preenchido. */
  whatsappUrl?: string
  whatsappLabel: string
  phone: string
  email: string
  instagram: string
  address: string
  city: string
  hours: string
  heroTitle: string
  heroSubtitle: string
  heroImage: string
  /** Vídeo de fundo do banner (opcional). Se preenchido, toca por cima da
   *  imagem. Ex.: /video/hero.mp4 ou uma URL .mp4/.webm. */
  heroVideo?: string
  shippingNote: string
  /** Marca como dados ainda a confirmar com o lojista. */
  contactConfirmed: boolean
}

export interface CartLine {
  product: Product
  quantity: number
}
