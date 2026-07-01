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

// ===== Integrações / APIs do sistema =====

/**
 * Configuração das integrações externas do sistema. Aqui ficam apenas valores
 * NÃO-secretos (model, IDs públicos) e rascunhos de referência. As CHAVES
 * SECRETAS de produção devem viver em variáveis de ambiente da Netlify — nunca
 * no navegador. Ver aviso na tela de API.
 */
export interface ApiIntegrations {
  // IA (cérebro do bot)
  geminiApiKey: string
  geminiModel: string
  // WhatsApp Cloud API (Meta)
  whatsappToken: string
  whatsappPhoneNumberId: string
  whatsappVerifyToken: string
}

// ===== Bot do site (atendimento por IA) =====

/**
 * Configuração editável do atendente do site, ajustável pelo lojista no painel.
 * Permite orientar o tom, corrigir respostas erradas e atualizar o que o bot
 * sabe — sem mexer no código. É somada ao "cérebro" base do bot.
 */
export interface BotConfig {
  /** Saudação inicial exibida no chat do site. */
  greeting: string
  /** Orientações de tom e conduta (têm prioridade no comportamento do bot). */
  instructions: string
  /** Fatos e correções que o bot deve tratar como verdade da loja. */
  knowledge: string
}

// ===== CRM / Leads do atendimento =====

export type LeadStage = 'novo' | 'em_atendimento' | 'qualificado' | 'fechado' | 'perdido'

/** Canal de origem do cliente. `presencial` = ficha aberta na loja física. */
export type LeadChannel = 'site' | 'whatsapp' | 'presencial'

/** Tipo de atendimento, derivado do canal — usado para separar no CRM. */
export type LeadAttendance = 'presencial' | 'online'

export interface LeadMessage {
  role: 'user' | 'model'
  text: string
}

/**
 * Ficha única do cliente — fonte da verdade compartilhada por duas telas:
 * "Clientes" (cadastro/ficha) e "CRM" (funil por estágio). É criada manualmente
 * no atendimento presencial ou automaticamente pelo atendente de IA (site/WhatsApp).
 */
export interface Lead {
  id: string
  createdAt: string // ISO 8601
  updatedAt: string // ISO 8601
  name?: string
  contact?: string // telefone, WhatsApp ou e-mail
  interest?: string // produto/categoria de interesse (texto livre)
  /** Produto do catálogo escolhido pelo cliente (presencial ou recomendado). */
  productId?: string
  /** Nome do produto no momento da escolha (snapshot — sobrevive a edição/exclusão). */
  productName?: string
  budget?: string // orçamento informado
  city?: string
  summary: string // resumo da necessidade/conversa
  stage: LeadStage
  channel: LeadChannel
  transcript?: LeadMessage[]
}

/** Online = site ou WhatsApp; presencial = ficha aberta na loja. */
export function leadAttendance(lead: Pick<Lead, 'channel'>): LeadAttendance {
  return lead.channel === 'presencial' ? 'presencial' : 'online'
}
