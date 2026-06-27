import { useState, type FormEvent } from 'react'
import { motion } from 'framer-motion'
import { X } from 'lucide-react'
import type { CategorySlug, Product } from '@/lib/types'
import { CATEGORIES, PLACEHOLDER_IMAGE } from '@/data/seed'
import { SmartImage } from '@/components/ui/SmartImage'
import { buttonClass } from '@/components/ui/button-styles'

export type ProductDraft = Omit<Product, 'id'>

const EMPTY: ProductDraft = {
  name: '',
  category: 'fat',
  brand: '',
  price: 0,
  compareAtPrice: undefined,
  stock: 0,
  image: '',
  description: '',
  specs: {},
  featured: false,
  active: true,
}

const field = 'w-full rounded-xl border border-ink-900/12 bg-white px-3.5 py-2.5 text-sm text-ink-950 focus:border-ink-900/35 focus:outline-none'
const label = 'text-xs font-semibold uppercase tracking-wide text-ink-700/60'

export function ProductForm({
  initial,
  onClose,
  onSave,
}: {
  initial?: Product
  onClose: () => void
  onSave: (draft: ProductDraft) => void
}) {
  const [draft, setDraft] = useState<ProductDraft>(initial ? { ...initial } : EMPTY)

  const set = <K extends keyof ProductDraft>(key: K, value: ProductDraft[K]) =>
    setDraft((d) => ({ ...d, [key]: value }))

  const setSpec = (key: keyof NonNullable<ProductDraft['specs']>, value: string) =>
    setDraft((d) => ({ ...d, specs: { ...d.specs, [key]: value } }))

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const specs = draft.specs ?? {}
    const hasSpecs = Object.values(specs).some((v) => v && v.trim())
    onSave({
      ...draft,
      name: draft.name.trim(),
      brand: draft.brand?.trim() || undefined,
      compareAtPrice: draft.compareAtPrice || undefined,
      specs: hasSpecs ? specs : undefined,
    })
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center bg-ink-950/50 p-0 backdrop-blur-sm sm:items-center sm:p-5">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex max-h-[92svh] w-full max-w-lg flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl"
        role="dialog"
        aria-label={initial ? 'Editar produto' : 'Novo produto'}
      >
        <header className="flex items-center justify-between border-b border-ink-900/10 px-5 py-4">
          <h2 className="font-display text-lg font-bold text-ink-950">
            {initial ? 'Editar produto' : 'Novo produto'}
          </h2>
          <button onClick={onClose} className="text-ink-700/50 hover:text-ink-950" aria-label="Fechar">
            <X size={20} />
          </button>
        </header>

        <form onSubmit={submit} className="flex flex-1 flex-col gap-4 overflow-y-auto p-5">
          <div>
            <label className={label} htmlFor="pf-name">
              Nome*
            </label>
            <input
              id="pf-name"
              required
              value={draft.name}
              onChange={(e) => set('name', e.target.value)}
              className={`mt-1.5 ${field}`}
              placeholder="MTB Aro 29 Pro 21v"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={label} htmlFor="pf-cat">
                Categoria*
              </label>
              <select
                id="pf-cat"
                value={draft.category}
                onChange={(e) => set('category', e.target.value as CategorySlug)}
                className={`mt-1.5 ${field}`}
              >
                {CATEGORIES.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={label} htmlFor="pf-brand">
                Marca
              </label>
              <input
                id="pf-brand"
                value={draft.brand ?? ''}
                onChange={(e) => set('brand', e.target.value)}
                className={`mt-1.5 ${field}`}
                placeholder="Opcional"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className={label} htmlFor="pf-price">
                Preço (R$)*
              </label>
              <input
                id="pf-price"
                type="number"
                min={0}
                step="0.01"
                required
                value={draft.price || ''}
                onChange={(e) => set('price', Number(e.target.value))}
                className={`mt-1.5 ${field}`}
              />
            </div>
            <div>
              <label className={label} htmlFor="pf-compare">
                Preço "de"
              </label>
              <input
                id="pf-compare"
                type="number"
                min={0}
                step="0.01"
                value={draft.compareAtPrice ?? ''}
                onChange={(e) =>
                  set('compareAtPrice', e.target.value ? Number(e.target.value) : undefined)
                }
                className={`mt-1.5 ${field}`}
              />
            </div>
            <div>
              <label className={label} htmlFor="pf-stock">
                Estoque*
              </label>
              <input
                id="pf-stock"
                type="number"
                min={0}
                required
                value={draft.stock || ''}
                onChange={(e) => set('stock', Number(e.target.value))}
                className={`mt-1.5 ${field}`}
              />
            </div>
          </div>

          <div>
            <label className={label} htmlFor="pf-image">
              URL da imagem
            </label>
            <div className="mt-1.5 flex gap-3">
              <input
                id="pf-image"
                value={draft.image}
                onChange={(e) => set('image', e.target.value)}
                className={field}
                placeholder="https://..."
              />
              <div className="h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-sand-100">
                <SmartImage
                  src={draft.image || PLACEHOLDER_IMAGE}
                  alt="Prévia"
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
          </div>

          <div>
            <label className={label} htmlFor="pf-desc">
              Descrição
            </label>
            <textarea
              id="pf-desc"
              rows={3}
              value={draft.description}
              onChange={(e) => set('description', e.target.value)}
              className={`mt-1.5 resize-none ${field}`}
              placeholder="Detalhes da bike..."
            />
          </div>

          <div>
            <p className={label}>Ficha técnica (e-bike)</p>
            <div className="mt-1.5 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <input
                value={draft.specs?.motor ?? ''}
                onChange={(e) => setSpec('motor', e.target.value)}
                className={field}
                placeholder="Motor (500W)"
                aria-label="Motor"
              />
              <input
                value={draft.specs?.battery ?? ''}
                onChange={(e) => setSpec('battery', e.target.value)}
                className={field}
                placeholder="Bateria"
                aria-label="Bateria"
              />
              <input
                value={draft.specs?.range ?? ''}
                onChange={(e) => setSpec('range', e.target.value)}
                className={field}
                placeholder="Autonomia"
                aria-label="Autonomia"
              />
              <input
                value={draft.specs?.speed ?? ''}
                onChange={(e) => setSpec('speed', e.target.value)}
                className={field}
                placeholder="Velocidade"
                aria-label="Velocidade"
              />
            </div>
          </div>

          <div className="flex gap-6">
            <label className="flex items-center gap-2 text-sm text-ink-800">
              <input
                type="checkbox"
                checked={draft.featured}
                onChange={(e) => set('featured', e.target.checked)}
                className="h-4 w-4 accent-lime-500"
              />
              Destaque na home
            </label>
            <label className="flex items-center gap-2 text-sm text-ink-800">
              <input
                type="checkbox"
                checked={draft.active}
                onChange={(e) => set('active', e.target.checked)}
                className="h-4 w-4 accent-lime-500"
              />
              Ativo (visível no site)
            </label>
          </div>
        </form>

        <footer className="flex gap-3 border-t border-ink-900/10 p-4">
          <button onClick={onClose} className={buttonClass('outline', 'md', 'flex-1')}>
            Cancelar
          </button>
          <button onClick={submit} className={buttonClass('primary', 'md', 'flex-1')}>
            {initial ? 'Salvar alterações' : 'Cadastrar produto'}
          </button>
        </footer>
      </motion.div>
    </div>
  )
}
