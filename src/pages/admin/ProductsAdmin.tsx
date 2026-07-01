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

      {/* Cards — todos os produtos */}
      {products.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-ink-900/15 bg-white py-16 text-center">
          <p className="font-display text-lg font-semibold text-ink-950">Nenhum produto ainda</p>
          <p className="mt-1 text-sm text-ink-700/60">
            Clique em “Novo produto” para cadastrar o primeiro — ele aparece no site na hora.
          </p>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {products.map((p) => (
            <article
              key={p.id}
              className="group flex flex-col rounded-card border border-ink-900/8 bg-white p-2.5 shadow-soft transition-shadow hover:shadow-lift"
            >
              <div className="relative aspect-4/3 overflow-hidden rounded-2xl border border-ink-900/8 bg-white">
                <SmartImage
                  src={p.image}
                  alt={p.name}
                  className="h-full w-full object-contain p-3 transition-transform duration-500 group-hover:scale-105"
                />
                <span className="absolute left-2 top-2 rounded-full bg-ink-950/80 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur">
                  {catName(p.category)}
                </span>
                {p.featured && (
                  <span className="absolute right-2 top-2 grid h-6 w-6 place-items-center rounded-full bg-lime-400 text-ink-950">
                    <Star size={12} className="fill-ink-950" />
                  </span>
                )}
              </div>

              <div className="flex flex-1 flex-col px-1 pt-2.5">
                <div className="flex items-start justify-between gap-1.5">
                  <h3 className="truncate text-sm font-semibold leading-tight text-ink-950">
                    {p.name}
                  </h3>
                  <span
                    className={`shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
                      p.active ? 'bg-lime-400/15 text-lime-700' : 'bg-ink-900/8 text-ink-700/60'
                    }`}
                  >
                    {p.active ? 'Ativo' : 'Inativo'}
                  </span>
                </div>

                <div className="mt-1.5 flex items-center justify-between gap-2">
                  <span className="font-display text-sm font-bold text-ink-950">
                    {formatBRL(p.price)}
                  </span>
                  <StockBadge stock={p.stock} />
                </div>

                <div className="mt-2.5 flex gap-1.5 border-t border-ink-900/8 pt-2.5">
                  <button
                    onClick={() => setEditing(p)}
                    className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-ink-900/5 py-1.5 text-xs font-medium text-ink-800 hover:bg-ink-900/10"
                  >
                    <Pencil size={13} /> Editar
                  </button>
                  <button
                    onClick={() => confirmDelete(p)}
                    className="grid h-7 w-7 shrink-0 place-items-center rounded-lg text-ink-700 hover:bg-red-50 hover:text-red-600"
                    aria-label={`Excluir ${p.name}`}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

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
