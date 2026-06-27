import { Gauge, Zap, Leaf, CreditCard } from 'lucide-react'

interface Stat {
  icon: typeof Gauge
  value: string
  label: string
}

const STATS: Stat[] = [
  { icon: Gauge, value: 'até 100 km', label: 'de autonomia por carga' },
  { icon: Zap, value: '1000W', label: 'de potência nos topos de linha' },
  { icon: Leaf, value: 'R$ 0', label: 'de gasto com combustível' },
  { icon: CreditCard, value: '12x', label: 'parcelamento sem juros' },
  { icon: Gauge, value: '45 km/h', label: 'de velocidade máxima' },
]

function Card({ icon: Icon, value, label }: Stat) {
  // mr-6 (em vez de gap no flex) garante que o loop do carrossel seja
  // perfeitamente contínuo, sem salto a cada volta.
  return (
    <div className="mr-6 flex w-72 shrink-0 items-center gap-4 rounded-2xl border border-ink-900/10 bg-white px-6 py-5 shadow-soft">
      <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-lime-400/15 text-lime-600">
        <Icon size={24} />
      </span>
      <div>
        <p className="font-display text-2xl font-bold text-ink-950">{value}</p>
        <p className="mt-0.5 text-sm leading-snug text-ink-700/60">{label}</p>
      </div>
    </div>
  )
}

/** Métricas em cards deslizando lateralmente, em loop infinito e sem fundo. */
export function Stats() {
  const row = [...STATS, ...STATS]
  return (
    <section className="overflow-hidden bg-white py-12 sm:py-14">
      <div className="group relative">
        {/* Fades nas bordas (mesma cor do fundo) */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-white to-transparent sm:w-28"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-white to-transparent sm:w-28"
        />
        <div className="flex w-max animate-[marquee_40s_linear_infinite] py-1 group-hover:[animation-play-state:paused] motion-reduce:animate-none">
          {row.map((stat, i) => (
            <Card key={i} {...stat} />
          ))}
        </div>
      </div>
    </section>
  )
}
