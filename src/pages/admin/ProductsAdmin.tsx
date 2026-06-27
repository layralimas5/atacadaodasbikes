import { useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { Plus, Pencil, Trash2, Star } from 'lucide-react'
import { useStore } from '@/context/StoreContext'
import { SmartImage } from '@/components/ui/SmartImage'
import { buttonClass } from '@/components/ui/button-styles'
import { formatBRL } from '@/lib/format'
import { CATEGORIES } from '@/data/seed'
import type { Product } from '@/lib/types'
import { ProductForm, type ProductDraft } from '@/pages/admin/ProductForm'

const catName = (slug: string) => CATEGORIES.find((c) => c.slug === slug)?.name ?? slug

export function ProductsAdmin() {
  const { products, addProduct, updateProduct, deleteProduct } = useStore()
  const [editing, setEditing] = useState<Product | null>(null)
  const [creating, setCreating] = useState(false)

  const save = (draft: ProductDraft) => {
    if (editing) updateProduct(editing.id, draft)
    else addProduct(draft)
    setEditing(null)
    setCreating(false)
  }

  const confirmDelete = (p: Product) => {
    if (window.confirm(`Excluir "${p.name}"? Essa ação não pode ser desfeita.`)) {
      deleteProduct(p.id)
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink-950">Produtos</h1>
          <p className="mt-1 text-sm text-ink-700/60">{products.length} produto(s) cadastrado(s).</p>
        </div>
        <button onClick={() => setCreating(true)} className={buttonClass('primary', 'md')}>
          <Plus size={18} /> Novo produto
        </button>
      </div>

      {/* Tabela (desktop) */}
      <div className="mt-6 hidden overflow-hidden rounded-2xl border border-ink-900/8 bg-white shadow-soft lg:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-ink-900/8 text-left text-xs uppercase tracking-wide text-ink-700/50">
              <th className="px-5 py-3 font-semibold">Produto</th>
              <th className="px-5 py-3 font-semibold">Categoria</th>
              <th className="px-5 py-3 font-semibold">Preço</th>
              <th className="px-5 py-3 font-semibold">Estoque</th>
              <th className="px-5 py-3 font-semibold">Status</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-900/8">
            {products.map((p) => (
              <tr key={p.id} className="hover:bg-sand-50">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div className="h-11 w-11 overflow-hidden rounded-lg bg-sand-100">
                      <SmartImage src={p.image} alt={p.name} className="h-full w-full object-cover" />
                    </div>
                    <div className="flex items-center gap-1.5 font-semibold text-ink-950">
                      {p.name}
                      {p.featured && <Star size={13} className="fill-lime-400 text-lime-400" />}
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3 text-ink-700">{catName(p.category)}</td>
                <td className="px-5 py-3 font-semibold text-ink-950">{formatBRL(p.price)}</td>
                <td className="px-5 py-3">
                  <StockBadge stock={p.stock} />
                </td>
                <td className="px-5 py-3">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                      p.active ? 'bg-lime-400/15 text-lime-700' : 'bg-ink-900/8 text-ink-700/60'
                    }`}
                  >
                    {p.active ? 'Ativo' : 'Inativo'}
                  </span>
                </td>
                <td className="px-5 py-3">
                  <div className="flex justify-end gap-1">
                    <button
                      onClick={() => setEditing(p)}
                      className="grid h-8 w-8 place-items-center rounded-lg text-ink-700 hover:bg-ink-900/5"
                      aria-label={`Editar ${p.name}`}
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => confirmDelete(p)}
                      className="grid h-8 w-8 place-items-center rounded-lg text-ink-700 hover:bg-red-50 hover:text-red-600"
                      aria-label={`Excluir ${p.name}`}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Cards (mobile) */}
      <div className="mt-6 grid gap-3 lg:hidden">
        {products.map((p) => (
          <div
            key={p.id}
            className="flex gap-3 rounded-2xl border border-ink-900/8 bg-white p-3 shadow-soft"
          >
            <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-sand-100">
              <SmartImage src={p.image} alt={p.name} className="h-full w-full object-cover" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold text-ink-950">{p.name}</p>
              <p className="text-xs text-ink-700/60">{catName(p.category)}</p>
              <div className="mt-1 flex items-center gap-2">
                <span className="font-bold text-ink-950">{formatBRL(p.price)}</span>
                <StockBadge stock={p.stock} />
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <button
                onClick={() => setEditing(p)}
                className="grid h-8 w-8 place-items-center rounded-lg text-ink-700 hover:bg-ink-900/5"
                aria-label={`Editar ${p.name}`}
              >
                <Pencil size={16} />
              </button>
              <button
                onClick={() => confirmDelete(p)}
                className="grid h-8 w-8 place-items-center rounded-lg text-ink-700 hover:bg-red-50 hover:text-red-600"
                aria-label={`Excluir ${p.name}`}
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {(creating || editing) && (
          <ProductForm
            initial={editing ?? undefined}
            onClose={() => {
              setCreating(false)
              setEditing(null)
            }}
            onSave={save}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

function StockBadge({ stock }: { stock: number }) {
  if (stock <= 0)
    return <span className="rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-600">Esgotado</span>
  if (stock <= 5)
    return (
      <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
        Baixo · {stock}
      </span>
    )
  return <span className="text-ink-700">{stock} un.</span>
}
