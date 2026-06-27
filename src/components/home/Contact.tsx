import { motion } from 'framer-motion'
import { MapPin, Clock, MessageCircle } from 'lucide-react'
import { InstagramIcon } from '@/components/ui/InstagramIcon'
import { Container } from '@/components/ui/Container'
import { buttonClass } from '@/components/ui/button-styles'
import { useStore } from '@/context/StoreContext'
import { whatsappHref } from '@/lib/whatsapp'

export function Contact() {
  const { storeInfo } = useStore()
  const waLink = whatsappHref(storeInfo, 'Olá! Vim pelo site do Atacadão das Bikes e quero atendimento.')
  const mapsEmbed = `https://www.google.com/maps?q=${encodeURIComponent(storeInfo.address)}&output=embed`
  const mapsLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(storeInfo.address)}`

  const info = [
    { icon: MapPin, label: 'Endereço', value: storeInfo.address },
    { icon: Clock, label: 'Horário', value: storeInfo.hours },
  ].filter((i) => i.value)

  return (
    <section id="contato" className="scroll-mt-20 bg-sand-50 py-20 sm:py-28">
      <Container>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5 }}
          className="overflow-hidden rounded-[2rem] bg-ink-950 text-white shadow-lift"
        >
          <div className="grid lg:grid-cols-2">
            <div className="flex flex-col justify-center gap-6 p-8 sm:p-12">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wider text-lime-400">
                  Bora pedalar
                </p>
                <h2 className="mt-2 text-balance font-display text-3xl font-bold sm:text-4xl">
                  Venha conhecer ou chame no WhatsApp
                </h2>
                <p className="mt-3 max-w-md text-pretty text-white/60">
                  Loja física em Jardim Camburi, atendimento rápido, foto real do estoque e o melhor
                  preço de Vitória. Sem enrolação.
                </p>
              </div>

              <dl className="grid gap-5 sm:grid-cols-2">
                {info.map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex gap-3">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-lime-400/10 text-lime-400">
                      <Icon size={18} />
                    </span>
                    <div>
                      <dt className="text-xs font-semibold uppercase tracking-wide text-white/40">
                        {label}
                      </dt>
                      <dd className="mt-0.5 text-sm text-white/80">{value}</dd>
                    </div>
                  </div>
                ))}
              </dl>

              <div className="flex flex-wrap gap-3">
                <a
                  href={waLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={buttonClass('whatsapp', 'lg')}
                >
                  <MessageCircle size={18} /> Falar agora
                </a>
                <a
                  href={`https://instagram.com/${storeInfo.instagram}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={buttonClass(
                    'outline',
                    'lg',
                    'border-white/20 bg-white/5 text-white hover:bg-white/10',
                  )}
                >
                  <InstagramIcon size={18} /> Instagram
                </a>
              </div>
            </div>

            {/* Mapa */}
            <a
              href={mapsLink}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative block min-h-[280px] border-t border-white/10 lg:min-h-0 lg:border-l lg:border-t-0"
              aria-label="Abrir endereço no Google Maps"
            >
              <iframe
                title="Mapa da loja Atacadão das Bikes Camburi"
                src={mapsEmbed}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="h-full w-full grayscale transition-all duration-500 group-hover:grayscale-0"
                style={{ border: 0, minHeight: 280 }}
              />
              <span className="pointer-events-none absolute bottom-4 left-4 inline-flex items-center gap-1.5 rounded-full bg-ink-950/85 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur">
                <MapPin size={14} className="text-lime-400" /> Como chegar
              </span>
            </a>
          </div>
        </motion.div>
      </Container>
    </section>
  )
}
