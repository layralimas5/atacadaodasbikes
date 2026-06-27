import { motion } from 'framer-motion'
import { Tag, BatteryCharging, Truck, ShieldCheck } from 'lucide-react'
import { Container } from '@/components/ui/Container'

const BENEFITS = [
  {
    icon: Tag,
    title: 'Preço de atacadão',
    text: 'Importamos e compramos em volume. A elétrica que você quer, bem mais em conta que na concorrência.',
  },
  {
    icon: BatteryCharging,
    title: 'Oficina de e-bikes',
    text: 'Motor, bateria, controlador e display: manutenção feita por quem é especialista em elétricas.',
  },
  {
    icon: Truck,
    title: 'Entrega na Grande Vitória',
    text: 'Retire em Camburi ou receba em casa — com a bike montada, configurada e já carregada.',
  },
  {
    icon: ShieldCheck,
    title: 'Garantia e suporte',
    text: 'Loja física, garantia de verdade e suporte de bateria e motor depois da compra.',
  },
]

export function Benefits() {
  return (
    <section className="bg-ink-950 py-20 text-white sm:py-24">
      <Container>
        <div className="mb-10 max-w-xl">
          <p className="text-sm font-semibold uppercase tracking-wider text-lime-400">
            Por que comprar aqui
          </p>
          <h2 className="mt-2 text-balance font-display text-3xl font-bold sm:text-4xl">
            Mais que uma loja de bikes
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {BENEFITS.map(({ icon: Icon, title, text }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
              className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 transition-colors hover:border-lime-400/30 hover:bg-white/[0.06]"
            >
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-lime-400/10 text-lime-400">
                <Icon size={24} />
              </span>
              <h3 className="mt-4 font-display text-lg font-semibold">{title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-white/60">{text}</p>
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  )
}
