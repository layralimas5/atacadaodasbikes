import { Minus, Plus } from 'lucide-react'
import { useStore } from '@/context/StoreContext'
import { SmartImage } from '@/components/ui/SmartImage'
import { CATEGORIES } from '@/data/seed'

const catName = (slug: string) => CATEGORIES.find((c) => c.slug === slug)?.name ?? slug

export function StockAdmin() {
  const { products, adjustStock, updateProduct } = useStore()
  const sorted = [...products].sort((a, b) => a.stock - b.stock)

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-ink-950">Estoque</h1>
      <p className="mt-1 text-sm text-ink-700/60">
        Ajuste rápido das quantidades. Ordenado pelos mais baixos primeiro.
      </p>

      <div className="mt-6 space-y-3">
        {sorted.map((p) => (
          <div
            key={p.id}
            className="flex flex-wrap items-center gap-3 rounded-2xl border border-ink-900/8 bg-white p-3 shadow-soft sm:flex-nowrap"
          >
            <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-sand-100">
              <SmartImage src={p.image} alt={p.name} className="h-full w-full object-cover" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold text-ink-950">{p.name}</p>
              <p className="text-xs text-ink-700/60">{catName(p.category)}</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => adjustStock(p.id, -1)}
                disabled={p.stock <= 0}
                className="grid h-9 w-9 place-items-center rounded-lg border border-ink-900/12 hover:bg-ink-900/5 disabled:opacity-40"
                aria-label={`Diminuir estoque de ${p.name}`}
              >
                <Minus size={16} />
              </button>
              <input
                type="number"
                min={0}
                value={p.stock}
                onChange={(e) => updateProduct(p.id, { stock: Math.max(0, Number(e.target.value)) })}
                className={`w-16 rounded-lg border px-2 py-1.5 text-center text-sm font-bold focus:outline-none ${
                  p.stock <= 0
                    ? 'border-red-300 bg-red-50 text-red-600'
                    : p.stock <= 5
                      ? 'border-amber-300 bg-amber-50 text-amber-700'
                      : 'border-ink-900/12 text-ink-950'
                }`}
                aria-label={`Estoque de ${p.name}`}
              />
              <button
                onClick={() => adjustStock(p.id, 1)}
                className="grid h-9 w-9 place-items-center rounded-lg border border-ink-900/12 hover:bg-ink-900/5"
                aria-label={`Aumentar estoque de ${p.name}`}
              >
                <Plus size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
