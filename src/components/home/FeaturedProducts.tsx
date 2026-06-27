import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { Container } from '@/components/ui/Container'
import { buttonClass } from '@/components/ui/button-styles'
import { ProductCard } from '@/components/home/ProductCard'
import { useStore } from '@/context/StoreContext'

export function FeaturedProducts() {
  const { products } = useStore()
  const featured = products.filter((p) => p.active && p.featured).slice(0, 8)

  if (featured.length === 0) return null

  return (
    <section className="bg-white py-20 sm:py-28">
      <Container>
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-lime-600">Destaques</p>
            <h2 className="mt-2 text-balance text-3xl font-bold text-ink-950 sm:text-4xl">
              As elétricas que mais saem
            </h2>
          </div>
          <Link to="/catalogo" className={buttonClass('outline', 'md', 'hidden sm:inline-flex')}>
            Ver catálogo completo <ArrowRight size={16} />
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
          {featured.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        <div className="mt-8 sm:hidden">
          <Link to="/catalogo" className={buttonClass('outline', 'md', 'w-full')}>
            Ver catálogo completo <ArrowRight size={16} />
          </Link>
        </div>
      </Container>
    </section>
  )
}
