import { useMemo, useState, type ReactNode } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, LayoutGrid } from 'lucide-react'
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

  /** Quantidade de produtos ativos por categoria — exibida ao lado de cada
   *  item do menu lateral, como nos e-commerces. */
  const counts = useMemo(() => {
    const map = new Map<CategorySlug, number>()
    let total = 0
    for (const p of products) {
      if (!p.active) continue
      total++
      map.set(p.category, (map.get(p.category) ?? 0) + 1)
    }
    return { map, total }
  }, [products])

  /** Quando "Tudo" está ativo, separamos os produtos por categoria (na ordem
   *  oficial). Cada seção só aparece se tiver produtos no resultado atual. */
  const groups = useMemo(
    () =>
      CATEGORIES.map((c) => ({
        category: c,
        items: filtered.filter((p) => p.category === c.slug),
      })).filter((g) => g.items.length > 0),
    [filtered],
  )

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

        <div className="lg:grid lg:grid-cols-[240px_1fr] lg:gap-8 xl:gap-10">
          {/* Menu lateral de categorias (desktop) */}
          <aside className="hidden lg:block">
            <div className="sticky top-24 rounded-card border border-ink-900/8 bg-white p-3 shadow-soft">
              <p className="px-2 pb-2 pt-1 text-xs font-semibold uppercase tracking-wider text-ink-700/50">
                Categorias
              </p>
              <nav className="space-y-0.5" aria-label="Filtrar por categoria">
                <CatItem
                  label="Todas as bikes"
                  icon={<LayoutGrid size={16} />}
                  count={counts.total}
                  active={cat === 'all'}
                  onClick={() => setCat('all')}
                />
                {CATEGORIES.map((c) => (
                  <CatItem
                    key={c.slug}
                    label={c.name}
                    count={counts.map.get(c.slug) ?? 0}
                    active={cat === c.slug}
                    onClick={() => setCat(c.slug)}
                  />
                ))}
              </nav>
            </div>
          </aside>

          {/* Coluna de conteúdo */}
          <div className="min-w-0">
            {/* Busca + chips de categoria (mobile) */}
            <div className="mb-6 space-y-4">
              <div className="relative w-full">
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

              <div
                className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1 lg:hidden"
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
            </div>

            {filtered.length === 0 ? (
              <div className="rounded-card border border-dashed border-ink-900/15 bg-white py-20 text-center">
                <p className="font-display text-lg font-semibold text-ink-950">Nada encontrado</p>
                <p className="mt-1 text-sm text-ink-700/60">
                  Tente outra categoria ou ajuste a busca.
                </p>
              </div>
            ) : cat === 'all' ? (
              // "Tudo": produtos separados por categoria
              <div className="space-y-12 sm:space-y-16">
                {groups.map(({ category, items }) => (
                  <section key={category.slug} aria-labelledby={`cat-${category.slug}`}>
                    <div className="mb-5 flex items-end justify-between gap-4">
                      <div>
                        <h2
                          id={`cat-${category.slug}`}
                          className="font-display text-xl font-bold text-ink-950 sm:text-2xl"
                        >
                          {category.name}
                        </h2>
                        <p className="mt-0.5 text-sm text-ink-700/60">{category.short}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setCat(category.slug)}
                        className="shrink-0 text-sm font-semibold text-lime-600 underline-offset-4 hover:underline"
                      >
                        Ver só esta
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
                      {items.map((product) => (
                        <ProductCard key={product.id} product={product} />
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            ) : (
              // Categoria específica: grade única
              <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
                {filtered.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </Container>
    </div>
  )
}

function CatItem({
  label,
  count,
  active,
  onClick,
  icon,
}: {
  label: string
  count: number
  active: boolean
  onClick: () => void
  icon?: ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? 'true' : undefined}
      className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-colors ${
        active
          ? 'bg-ink-950 text-white'
          : 'text-ink-700 hover:bg-ink-900/5 hover:text-ink-950'
      }`}
    >
      {icon && <span className={active ? 'text-lime-400' : 'text-ink-700/50'}>{icon}</span>}
      <span className="flex-1">{label}</span>
      <span
        className={`text-xs font-semibold tabular-nums ${
          active ? 'text-white/60' : 'text-ink-700/40'
        }`}
      >
        {count}
      </span>
    </button>
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
