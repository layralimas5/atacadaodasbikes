import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search } from 'lucide-react'
import { Container } from '@/components/ui/Container'
import { ProductCard } from '@/components/home/ProductCard'
import { CATEGORIES } from '@/data/seed'
import { useStore } from '@/context/StoreContext'
import type { CategorySlug } from '@/lib/types'

export function Catalog() {
  const { products } = useStore()
  const [searchParams, setSearchParams] = useSearchParams()
  const cat = (searchParams.get('cat') as CategorySlug | null) ?? 'all'
  const [query, setQuery] = useState('')

  const setCat = (value: string) => {
    const next = new URLSearchParams(searchParams)
    if (value === 'all') next.delete('cat')
    else next.set('cat', value)
    setSearchParams(next, { replace: true })
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return products
      .filter((p) => p.active)
      .filter((p) => cat === 'all' || p.category === cat)
      .filter(
        (p) =>
          !q ||
          p.name.toLowerCase().includes(q) ||
          (p.brand?.toLowerCase().includes(q) ?? false),
      )
  }, [products, cat, query])

  const activeCat = CATEGORIES.find((c) => c.slug === cat)

  return (
    <div className="bg-sand-50">
      <Container className="py-10 sm:py-14">
        <header className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-wider text-lime-600">Catálogo</p>
          <h1 className="mt-2 font-display text-3xl font-bold text-ink-950 sm:text-4xl">
            {activeCat ? activeCat.name : 'Todas as bikes'}
          </h1>
          <p className="mt-2 max-w-xl text-ink-700/70">
            {activeCat?.description ??
              'Bikes, peças e acessórios com preço de atacadão. Adicione ao carrinho e finalize pelo WhatsApp.'}
          </p>
        </header>

        {/* Filtros */}
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div
            className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1 lg:mx-0 lg:flex-wrap lg:px-0"
            role="tablist"
            aria-label="Filtrar por categoria"
          >
            <CatChip label="Tudo" active={cat === 'all'} onClick={() => setCat('all')} />
            {CATEGORIES.map((c) => (
              <CatChip
                key={c.slug}
                label={c.name}
                active={cat === c.slug}
                onClick={() => setCat(c.slug)}
              />
            ))}
          </div>

          <div className="relative w-full lg:w-72">
            <Search
              size={18}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-700/40"
            />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar bike ou marca..."
              className="w-full rounded-full border border-ink-900/12 bg-white py-2.5 pl-11 pr-4 text-sm text-ink-950 placeholder:text-ink-700/40 focus:border-ink-900/30 focus:outline-none"
              aria-label="Buscar produtos"
            />
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-card border border-dashed border-ink-900/15 bg-white py-20 text-center">
            <p className="font-display text-lg font-semibold text-ink-950">Nada encontrado</p>
            <p className="mt-1 text-sm text-ink-700/60">
              Tente outra categoria ou ajuste a busca.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </Container>
    </div>
  )
}

function CatChip({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      role="tab"
      aria-selected={active}
      className={`shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
        active
          ? 'bg-ink-950 text-white'
          : 'border border-ink-900/12 bg-white text-ink-700 hover:border-ink-900/25'
      }`}
    >
      {label}
    </button>
  )
}
