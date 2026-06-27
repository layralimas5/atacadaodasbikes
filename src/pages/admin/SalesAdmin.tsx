import { useState } from 'react'
import { Receipt, Plus, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '@/context/StoreContext'
import { buttonClass } from '@/components/ui/button-styles'
import { formatBRL, formatDate } from '@/lib/format'
import type { SaleChannel } from '@/lib/types'

const channelLabel: Record<SaleChannel, string> = {
  site: 'Site',
  whatsapp: 'WhatsApp',
  loja: 'Loja física',
}

export function SalesAdmin() {
  const { sales, products, recordSale } = useStore()
  const [showForm, setShowForm] = useState(false)

  const revenue = sales.reduce((s, sale) => s + sale.total, 0)

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink-950">Vendas</h1>
          <p className="mt-1 text-sm text-ink-700/60">
            {sales.length} venda(s) · {formatBRL(revenue)} em faturamento.
          </p>
        </div>
        <button onClick={() => setShowForm(true)} className={buttonClass('primary', 'md')}>
          <Plus size={18} /> Registrar venda
        </button>
      </div>

      {sales.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-ink-900/15 bg-white py-16 text-center">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-sand-100 text-ink-700/40">
            <Receipt size={26} />
          </span>
          <p className="mt-3 font-display font-semibold text-ink-950">Nenhuma venda ainda</p>
          <p className="mt-1 text-sm text-ink-700/55">
            Pedidos do carrinho do site e vendas manuais aparecem aqui.
          </p>
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {sales.map((sale) => (
            <div key={sale.id} className="rounded-2xl border border-ink-900/8 bg-white p-4 shadow-soft">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs text-ink-700/50">{formatDate(sale.createdAt)}</p>
                  {sale.customer && (
                    <p className="text-sm font-semibold text-ink-950">{sale.customer}</p>
                  )}
                </div>
                <div className="text-right">
                  <span className="rounded-full bg-ink-900/6 px-2.5 py-1 text-xs font-semibold text-ink-700">
                    {channelLabel[sale.channel]}
                  </span>
                  <p className="mt-1 font-display text-lg font-bold text-ink-950">
                    {formatBRL(sale.total)}
                  </p>
                </div>
              </div>
              <ul className="mt-3 space-y-1 border-t border-ink-900/8 pt-3 text-sm text-ink-700">
                {sale.items.map((item) => (
                  <li key={item.productId} className="flex justify-between">
                    <span>
                      {item.quantity}× {item.name}
                    </span>
                    <span>{formatBRL(item.unitPrice * item.quantity)}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {showForm && (
          <ManualSaleForm
            products={products}
            onClose={() => setShowForm(false)}
            onSubmit={(productId, quantity, customer) => {
              const p = products.find((pr) => pr.id === productId)
              if (!p) return
              recordSale(
                [{ productId: p.id, name: p.name, unitPrice: p.price, quantity }],
                { channel: 'loja', customer: customer || undefined },
              )
              setShowForm(false)
            }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

function ManualSaleForm({
  products,
  onClose,
  onSubmit,
}: {
  products: { id: string; name: string }[]
  onClose: () => void
  onSubmit: (productId: string, quantity: number, customer: string) => void
}) {
  const [productId, setProductId] = useState(products[0]?.id ?? '')
  const [quantity, setQuantity] = useState(1)
  const [customer, setCustomer] = useState('')

  const field = 'w-full rounded-xl border border-ink-900/12 bg-white px-3.5 py-2.5 text-sm focus:border-ink-900/35 focus:outline-none'

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-ink-950/50 p-5 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md rounded-2xl bg-white shadow-2xl"
        role="dialog"
        aria-label="Registrar venda manual"
      >
        <header className="flex items-center justify-between border-b border-ink-900/10 px-5 py-4">
          <h2 className="font-display text-lg font-bold text-ink-950">Registrar venda</h2>
          <button onClick={onClose} className="text-ink-700/50 hover:text-ink-950" aria-label="Fechar">
            <X size={20} />
          </button>
        </header>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            onSubmit(productId, quantity, customer)
          }}
          className="space-y-4 p-5"
        >
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-ink-700/60">Produto</label>
            <select
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              className={`mt-1.5 ${field}`}
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-ink-700/60">
                Quantidade
              </label>
              <input
                type="number"
                min={1}
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                className={`mt-1.5 ${field}`}
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-ink-700/60">
                Cliente
              </label>
              <input
                value={customer}
                onChange={(e) => setCustomer(e.target.value)}
                placeholder="Opcional"
                className={`mt-1.5 ${field}`}
              />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className={buttonClass('outline', 'md', 'flex-1')}>
              Cancelar
            </button>
            <button type="submit" className={buttonClass('primary', 'md', 'flex-1')}>
              Registrar
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}
