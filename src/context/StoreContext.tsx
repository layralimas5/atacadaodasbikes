import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type {
  ApiIntegrations,
  BotConfig,
  Lead,
  Product,
  Sale,
  SaleItem,
  StoreInfo,
} from '@/lib/types'
import { read, write } from '@/lib/storage'
import { newId } from '@/lib/format'
import { PRODUCTS, STORE_INFO } from '@/data/seed'

/**
 * IMPORTANTE: esta é uma autenticação de PROTÓTIPO (frontend, localStorage).
 * Não é segurança real. Ao migrar pro Supabase, troque por Supabase Auth + RLS.
 */
const DEFAULT_PASSWORD = 'atacadao123'

const DEFAULT_INTEGRATIONS: ApiIntegrations = {
  geminiApiKey: '',
  geminiModel: 'gemini-2.5-flash',
  whatsappToken: '',
  whatsappPhoneNumberId: '',
  whatsappVerifyToken: '',
}

const DEFAULT_BOT_CONFIG: BotConfig = {
  greeting:
    'Oi! Sou o atendente do Atacadão das Bikes. Me conta o que você procura que eu te ajudo a achar a bike elétrica ideal, e fico com você até o final.',
  instructions: '',
  knowledge: '',
}

interface StoreContextValue {
  products: Product[]
  storeInfo: StoreInfo
  sales: Sale[]
  leads: Lead[]

  // Produtos
  addProduct: (data: Omit<Product, 'id'>) => Product
  updateProduct: (id: string, data: Partial<Product>) => void
  deleteProduct: (id: string) => void
  adjustStock: (id: string, delta: number) => void

  // Vendas
  recordSale: (items: SaleItem[], opts?: { customer?: string; channel?: Sale['channel'] }) => Sale

  // CRM / Leads
  upsertLead: (data: { id: string } & Partial<Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>>) => void
  /** Cria uma ficha de cliente (presencial por padrão) e devolve o registro. */
  addCustomer: (data: Partial<Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>>) => Lead
  updateLead: (id: string, data: Partial<Lead>) => void
  deleteLead: (id: string) => void

  // Atendimento (bot/IA)
  chatEnabled: boolean
  setChatEnabled: (value: boolean) => void

  // Configuração do bot do site (tom, orientações, correções)
  botConfig: BotConfig
  updateBotConfig: (data: Partial<BotConfig>) => void
  resetBotConfig: () => void

  // Conteúdo do site / configurações
  updateStoreInfo: (data: Partial<StoreInfo>) => void

  // Integrações / APIs do sistema
  integrations: ApiIntegrations
  updateIntegrations: (data: Partial<ApiIntegrations>) => void

  // Admin (protótipo)
  isAdmin: boolean
  login: (password: string) => boolean
  logout: () => void
  changePassword: (current: string, next: string) => boolean

  resetData: () => void
}

const StoreContext = createContext<StoreContextValue | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>(() => read('products', PRODUCTS))
  const [storeInfo, setStoreInfo] = useState<StoreInfo>(() => read('storeInfo', STORE_INFO))
  const [sales, setSales] = useState<Sale[]>(() => read('sales', []))
  const [leads, setLeads] = useState<Lead[]>(() => read('leads', []))
  const [chatEnabled, setChatEnabled] = useState<boolean>(() => read('chatEnabled', true))
  const [integrations, setIntegrations] = useState<ApiIntegrations>(() =>
    read('integrations', DEFAULT_INTEGRATIONS),
  )
  const [botConfig, setBotConfig] = useState<BotConfig>(() =>
    // Mescla com o default para tolerar configs salvas antes de novos campos.
    ({ ...DEFAULT_BOT_CONFIG, ...read('botConfig', DEFAULT_BOT_CONFIG) }),
  )
  const [isAdmin, setIsAdmin] = useState<boolean>(
    () => typeof window !== 'undefined' && window.sessionStorage.getItem('adb:admin') === '1',
  )

  useEffect(() => write('products', products), [products])
  useEffect(() => write('storeInfo', storeInfo), [storeInfo])
  useEffect(() => write('sales', sales), [sales])
  useEffect(() => write('leads', leads), [leads])
  useEffect(() => write('chatEnabled', chatEnabled), [chatEnabled])
  useEffect(() => write('integrations', integrations), [integrations])
  useEffect(() => write('botConfig', botConfig), [botConfig])

  const addProduct = useCallback((data: Omit<Product, 'id'>) => {
    const product: Product = { ...data, id: `p-${newId()}` }
    setProducts((prev) => [product, ...prev])
    return product
  }, [])

  const updateProduct = useCallback((id: string, data: Partial<Product>) => {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...data } : p)))
  }, [])

  const deleteProduct = useCallback((id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id))
  }, [])

  const adjustStock = useCallback((id: string, delta: number) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, stock: Math.max(0, p.stock + delta) } : p)),
    )
  }, [])

  const recordSale = useCallback<StoreContextValue['recordSale']>((items, opts) => {
    const total = items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0)
    const sale: Sale = {
      id: `s-${newId()}`,
      createdAt: new Date().toISOString(),
      items,
      total,
      customer: opts?.customer,
      channel: opts?.channel ?? 'site',
    }
    setSales((prev) => [sale, ...prev])
    // Baixa de estoque
    setProducts((prev) =>
      prev.map((p) => {
        const line = items.find((i) => i.productId === p.id)
        return line ? { ...p, stock: Math.max(0, p.stock - line.quantity) } : p
      }),
    )
    return sale
  }, [])

  const updateStoreInfo = useCallback((data: Partial<StoreInfo>) => {
    setStoreInfo((prev) => ({ ...prev, ...data }))
  }, [])

  const updateIntegrations = useCallback((data: Partial<ApiIntegrations>) => {
    setIntegrations((prev) => ({ ...prev, ...data }))
  }, [])

  const updateBotConfig = useCallback((data: Partial<BotConfig>) => {
    setBotConfig((prev) => ({ ...prev, ...data }))
  }, [])

  const resetBotConfig = useCallback(() => {
    setBotConfig(DEFAULT_BOT_CONFIG)
  }, [])

  const upsertLead = useCallback<StoreContextValue['upsertLead']>((data) => {
    const now = new Date().toISOString()
    setLeads((prev) => {
      const existing = prev.find((l) => l.id === data.id)
      if (existing) {
        // Atualiza só os campos enviados (preserva o estágio definido pelo admin).
        return prev.map((l) => (l.id === data.id ? { ...l, ...data, updatedAt: now } : l))
      }
      const created: Lead = {
        stage: 'novo',
        channel: 'site',
        summary: '',
        ...data,
        createdAt: now,
        updatedAt: now,
      }
      return [created, ...prev]
    })
  }, [])

  const addCustomer = useCallback<StoreContextValue['addCustomer']>((data) => {
    const now = new Date().toISOString()
    const customer: Lead = {
      stage: 'novo',
      channel: 'presencial',
      summary: '',
      ...data,
      id: `c-${newId()}`,
      createdAt: now,
      updatedAt: now,
    }
    setLeads((prev) => [customer, ...prev])
    return customer
  }, [])

  const updateLead = useCallback((id: string, data: Partial<Lead>) => {
    setLeads((prev) =>
      prev.map((l) => (l.id === id ? { ...l, ...data, updatedAt: new Date().toISOString() } : l)),
    )
  }, [])

  const deleteLead = useCallback((id: string) => {
    setLeads((prev) => prev.filter((l) => l.id !== id))
  }, [])

  const login = useCallback((password: string) => {
    const stored = read('adminPassword', DEFAULT_PASSWORD)
    if (password === stored) {
      setIsAdmin(true)
      window.sessionStorage.setItem('adb:admin', '1')
      return true
    }
    return false
  }, [])

  const logout = useCallback(() => {
    setIsAdmin(false)
    window.sessionStorage.removeItem('adb:admin')
  }, [])

  const changePassword = useCallback((current: string, next: string) => {
    const stored = read('adminPassword', DEFAULT_PASSWORD)
    if (current !== stored || next.trim().length < 4) return false
    write('adminPassword', next)
    return true
  }, [])

  const resetData = useCallback(() => {
    setProducts(PRODUCTS)
    setStoreInfo(STORE_INFO)
    setSales([])
    setLeads([])
  }, [])

  const value = useMemo<StoreContextValue>(
    () => ({
      products,
      storeInfo,
      sales,
      leads,
      addProduct,
      updateProduct,
      deleteProduct,
      adjustStock,
      recordSale,
      upsertLead,
      addCustomer,
      updateLead,
      deleteLead,
      chatEnabled,
      setChatEnabled,
      botConfig,
      updateBotConfig,
      resetBotConfig,
      updateStoreInfo,
      integrations,
      updateIntegrations,
      isAdmin,
      login,
      logout,
      changePassword,
      resetData,
    }),
    [
      products,
      storeInfo,
      sales,
      leads,
      addProduct,
      updateProduct,
      deleteProduct,
      adjustStock,
      recordSale,
      upsertLead,
      addCustomer,
      updateLead,
      deleteLead,
      chatEnabled,
      botConfig,
      updateBotConfig,
      resetBotConfig,
      updateStoreInfo,
      integrations,
      updateIntegrations,
      isAdmin,
      login,
      logout,
      changePassword,
      resetData,
    ],
  )

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useStore(): StoreContextValue {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore deve ser usado dentro de <StoreProvider>')
  return ctx
}
