import { Zap } from 'lucide-react'

const ITEMS = [
  'Bikes elétricas premium',
  'Preço de atacadão',
  'Oficina especializada em e-bikes',
  'Bateria removível de lítio',
  'Entrega na Grande Vitória',
  'Até 100 km de autonomia',
  'Garantia de loja física',
]

/** Faixa animada infinita (CSS) com os destaques da loja. */
export function Marquee() {
  const row = [...ITEMS, ...ITEMS]
  return (
    <div className="overflow-hidden border-y border-white/10 bg-ink-900 py-4">
      <div className="flex w-max animate-[marquee_32s_linear_infinite] gap-8 pr-8 motion-reduce:animate-none">
        {row.map((item, i) => (
          <span key={i} className="flex items-center gap-3 whitespace-nowrap text-sm font-medium text-white/70">
            <Zap size={15} className="fill-lime-400 text-lime-400" />
            {item}
          </span>
        ))}
      </div>
    </div>
  )
}
