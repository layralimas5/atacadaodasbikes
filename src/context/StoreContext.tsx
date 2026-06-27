import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { Product, Sale, SaleItem, StoreInfo } from '@/lib/types'
import { read, write } from '@/lib/storage'
import { newId } from '@/lib/format'
import { PRODUCTS, STORE_INFO } from '@/data/seed'

/**
 * IMPORTANTE: esta é uma autenticação de PROTÓTIPO (frontend, localStorage).
 * Não é segurança real. Ao migrar pro Supabase, troque por Supabase Auth + RLS.
 */
const DEFAULT_PASSWORD = 'atacadao123'

interface StoreContextValue {
  products: Product[]
  storeInfo: StoreInfo
  sales: Sale[]

  // Produtos
  addProduct: (data: Omit<Product, 'id'>) => Product
  updateProduct: (id: string, data: Partial<Product>) => void
  deleteProduct: (id: string) => void
  adjustStock: (id: string, delta: number) => void

  // Vendas
  recordSale: (items: SaleItem[], opts?: { customer?: string; channel?: Sale['channel'] }) => Sale

  // Conteúdo do site
  updateStoreInfo: (data: Partial<StoreInfo>) => void

  // Admin (protótipo)
  isAdmin: boolean
  login: (password: string) => boolean
  logout: () => void

  resetData: () => void
}

const StoreContext = createContext<StoreContextValue | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>(() => read('products', PRODUCTS))
  const [storeInfo, setStoreInfo] = useState<StoreInfo>(() => read('storeInfo', STORE_INFO))
  const [sales, setSales] = useState<Sale[]>(() => read('sales', []))
  const [isAdmin, setIsAdmin] = useState<boolean>(
    () => typeof window !== 'undefined' && window.sessionStorage.getItem('adb:admin') === '1',
  )

  useEffect(() => write('products', products), [products])
  useEffect(() => write('storeInfo', storeInfo), [storeInfo])
  useEffect(() => write('sales', sales), [sales])

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

  const resetData = useCallback(() => {
    setProducts(PRODUCTS)
    setStoreInfo(STORE_INFO)
    setSales([])
  }, [])

  const value = useMemo<StoreContextValue>(
    () => ({
      products,
      storeInfo,
      sales,
      addProduct,
      updateProduct,
      deleteProduct,
      adjustStock,
      recordSale,
      updateStoreInfo,
      isAdmin,
      login,
      logout,
      resetData,
    }),
    [
      products,
      storeInfo,
      sales,
      addProduct,
      updateProduct,
      deleteProduct,
      adjustStock,
      recordSale,
      updateStoreInfo,
      isAdmin,
      login,
      logout,
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
