import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Plus, Zap, Gauge } from 'lucide-react'
import type { Product } from '@/lib/types'
import { SmartImage } from '@/components/ui/SmartImage'
import { formatBRL, discountPercent } from '@/lib/format'
import { useCart } from '@/context/CartContext'

export function ProductCard({ product }: { product: Product }) {
  const { add } = useCart()
  const discount = discountPercent(product.price, product.compareAtPrice)
  const soldOut = product.stock <= 0

  return (
    <motion.article
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.4 }}
      className="group relative flex flex-col rounded-card border border-ink-900/8 bg-white p-3 shadow-soft transition-shadow duration-300 hover:shadow-lift"
    >
      <Link
        to={`/produto/${product.id}`}
        className="relative block aspect-4/3 overflow-hidden rounded-2xl border border-ink-900/8 bg-white"
      >
        <SmartImage
          src={product.image}
          alt={product.name}
          className="h-full w-full object-contain p-3 transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute left-3 top-3 flex flex-col gap-1.5">
          {discount && (
            <span className="rounded-full bg-lime-400 px-2.5 py-1 text-xs font-bold text-ink-950">
              -{discount}%
            </span>
          )}
          {soldOut && (
            <span className="rounded-full bg-ink-950/85 px-2.5 py-1 text-xs font-semibold text-white">
              Esgotado
            </span>
          )}
        </div>
      </Link>

      <div className="flex flex-1 flex-col gap-3 p-2 pt-3">
        <div className="flex-1">
          {product.brand && (
            <p className="text-xs font-medium uppercase tracking-wide text-ink-700/60">{product.brand}</p>
          )}
          <h3 className="mt-0.5 text-pretty font-display text-base font-semibold leading-snug text-ink-950">
            <Link to={`/produto/${product.id}`} className="hover:text-lime-600">
              {product.name}
            </Link>
          </h3>

          {(product.specs?.motor || product.specs?.range) && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {product.specs?.motor && (
                <span className="inline-flex items-center gap-1 rounded-full bg-lime-400/15 px-2 py-0.5 text-[11px] font-semibold text-lime-700">
                  <Zap size={11} /> {product.specs.motor}
                </span>
              )}
              {product.specs?.range && (
                <span className="inline-flex items-center gap-1 rounded-full bg-ink-900/6 px-2 py-0.5 text-[11px] font-medium text-ink-700">
                  <Gauge size={11} /> {product.specs.range}
                </span>
              )}
            </div>
          )}
        </div>

        <div className="flex items-end justify-between gap-2">
          <div>
            {product.compareAtPrice && product.compareAtPrice > product.price && (
              <p className="text-xs text-ink-700/50 line-through">{formatBRL(product.compareAtPrice)}</p>
            )}
            <p className="font-display text-lg font-bold text-ink-950">{formatBRL(product.price)}</p>
          </div>
          <button
            type="button"
            onClick={() => add(product)}
            disabled={soldOut}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-ink-950 text-lime-400 transition-all hover:scale-105 hover:bg-ink-800 disabled:opacity-40 disabled:hover:scale-100"
            aria-label={`Adicionar ${product.name} ao carrinho`}
          >
            <Plus size={18} />
          </button>
        </div>
      </div>
    </motion.article>
  )
}
