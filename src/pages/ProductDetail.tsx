import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Check, MessageCircle, ShoppingBag, Truck, Zap, BatteryCharging, Gauge, Wind } from 'lucide-react'
import { Container } from '@/components/ui/Container'
import { SmartImage } from '@/components/ui/SmartImage'
import { ProductCard } from '@/components/home/ProductCard'
import { buttonClass } from '@/components/ui/button-styles'
import { useStore } from '@/context/StoreContext'
import { useCart } from '@/context/CartContext'
import { formatBRL, discountPercent } from '@/lib/format'
import { productInquiryLink } from '@/lib/whatsapp'
import { CATEGORIES } from '@/data/seed'

export function ProductDetail() {
  const { id } = useParams()
  const { products, storeInfo } = useStore()
  const { add } = useCart()
  const product = products.find((p) => p.id === id)

  if (!product) {
    return (
      <Container className="py-24 text-center">
        <h1 className="font-display text-2xl font-bold text-ink-950">Produto não encontrado</h1>
        <Link to="/catalogo" className={buttonClass('dark', 'md', 'mt-6')}>
          Voltar ao catálogo
        </Link>
      </Container>
    )
  }

  const discount = discountPercent(product.price, product.compareAtPrice)
  const soldOut = product.stock <= 0
  const category = CATEGORIES.find((c) => c.slug === product.category)
  const related = products
    .filter((p) => p.active && p.category === product.category && p.id !== product.id)
    .slice(0, 4)

  return (
    <div className="bg-white">
      <Container className="py-8 sm:py-12">
        <Link
          to="/catalogo"
          className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-ink-700 hover:text-ink-950"
        >
          <ArrowLeft size={16} /> Voltar ao catálogo
        </Link>

        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
          <div className="relative overflow-hidden rounded-[1.75rem] border border-ink-900/8 bg-white">
            <SmartImage
              src={product.image}
              alt={product.name}
              className="aspect-square w-full object-contain p-6"
              loading="eager"
            />
            {discount && (
              <span className="absolute left-4 top-4 rounded-full bg-lime-400 px-3 py-1.5 text-sm font-bold text-ink-950">
                -{discount}% OFF
              </span>
            )}
          </div>

          <div className="flex flex-col">
            {category && (
              <Link
                to={`/catalogo?cat=${category.slug}`}
                className="text-sm font-semibold uppercase tracking-wide text-lime-600 hover:underline"
              >
                {category.name}
              </Link>
            )}
            <h1 className="mt-2 text-balance font-display text-3xl font-bold leading-tight text-ink-950 sm:text-4xl">
              {product.name}
            </h1>
            {product.brand && <p className="mt-1 text-ink-700/70">{product.brand}</p>}

            <div className="mt-5 flex items-end gap-3">
              {product.compareAtPrice && product.compareAtPrice > product.price && (
                <span className="text-lg text-ink-700/40 line-through">
                  {formatBRL(product.compareAtPrice)}
                </span>
              )}
              <span className="font-display text-4xl font-bold text-ink-950">
                {formatBRL(product.price)}
              </span>
            </div>
            <p className="mt-1 text-sm text-ink-700/60">à vista ou parcelado — consulte no WhatsApp</p>

            <p className="mt-6 text-pretty leading-relaxed text-ink-800">{product.description}</p>

            {product.specs &&
              (product.specs.motor ||
                product.specs.battery ||
                product.specs.range ||
                product.specs.speed) && (
                <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {[
                    { icon: Zap, label: 'Motor', value: product.specs.motor },
                    { icon: BatteryCharging, label: 'Bateria', value: product.specs.battery },
                    { icon: Gauge, label: 'Autonomia', value: product.specs.range },
                    { icon: Wind, label: 'Velocidade', value: product.specs.speed },
                  ]
                    .filter((s) => s.value)
                    .map(({ icon: Icon, label, value }) => (
                      <div
                        key={label}
                        className="rounded-2xl border border-ink-900/8 bg-sand-50 p-3 text-center"
                      >
                        <Icon size={18} className="mx-auto text-lime-600" />
                        <p className="mt-1.5 text-[11px] font-semibold uppercase tracking-wide text-ink-700/50">
                          {label}
                        </p>
                        <p className="font-display text-sm font-bold text-ink-950">{value}</p>
                      </div>
                    ))}
                </div>
              )}

            <div className="mt-6 flex items-center gap-2 text-sm">
              {soldOut ? (
                <span className="font-semibold text-red-600">Esgotado no momento</span>
              ) : (
                <span className="inline-flex items-center gap-1.5 font-semibold text-lime-700">
                  <Check size={16} /> Em estoque
                  {product.stock <= 5 && (
                    <span className="font-medium text-ink-700/60">
                      — últimas {product.stock} unidades
                    </span>
                  )}
                </span>
              )}
            </div>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <button
                onClick={() => add(product)}
                disabled={soldOut}
                className={buttonClass('primary', 'lg', 'flex-1')}
              >
                <ShoppingBag size={18} /> Adicionar ao carrinho
              </button>
              <a
                href={productInquiryLink(storeInfo, product.name)}
                target="_blank"
                rel="noopener noreferrer"
                className={buttonClass('whatsapp', 'lg', 'flex-1')}
              >
                <MessageCircle size={18} /> Tirar dúvida
              </a>
            </div>

            <div className="mt-6 flex items-center gap-2 rounded-xl bg-sand-100 px-4 py-3 text-sm text-ink-700">
              <Truck size={18} className="text-ink-900" />
              {storeInfo.shippingNote}
            </div>
          </div>
        </div>

        {related.length > 0 && (
          <section className="mt-20">
            <h2 className="mb-6 font-display text-2xl font-bold text-ink-950">Você também vai gostar</h2>
            <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </Container>
    </div>
  )
}
