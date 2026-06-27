import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'
import { Container } from '@/components/ui/Container'
import { SmartImage } from '@/components/ui/SmartImage'
import { CATEGORIES } from '@/data/seed'

export function Categories() {
  return (
    <section id="categorias" className="scroll-mt-20 bg-sand-50 py-20 sm:py-28">
      <Container>
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-lime-600">Categorias</p>
            <h2 className="mt-2 text-balance text-3xl font-bold text-ink-950 sm:text-4xl">
              Pra cada tipo de pedal
            </h2>
          </div>
          <Link
            to="/catalogo"
            className="text-sm font-semibold text-ink-700 underline-offset-4 hover:text-ink-950 hover:underline"
          >
            Ver tudo
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {CATEGORIES.map((cat, i) => (
            <motion.div
              key={cat.slug}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.4, delay: (i % 4) * 0.05 }}
            >
              <Link
                to={`/catalogo?cat=${cat.slug}`}
                className="group relative flex aspect-3/4 flex-col justify-end overflow-hidden rounded-card border border-ink-900/8 p-4 shadow-soft transition-shadow hover:shadow-lift sm:aspect-4/5"
              >
                <div className="absolute inset-0 transition-transform duration-700 group-hover:scale-105">
                  <SmartImage
                    src={cat.image}
                    alt={cat.name}
                    className="h-full w-full object-cover animate-kenburns"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-ink-950/85 via-ink-950/25 to-transparent" />
                <div className="relative text-white">
                  <p className="text-[11px] font-medium uppercase tracking-wider text-lime-300">
                    {cat.short}
                  </p>
                  <h3 className="mt-0.5 flex items-center gap-1 font-display text-lg font-semibold">
                    {cat.name}
                    <ArrowUpRight
                      size={18}
                      className="opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100"
                    />
                  </h3>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  )
}
