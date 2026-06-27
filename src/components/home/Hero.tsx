import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion'
import { ArrowRight, MessageCircle } from 'lucide-react'
import { Container } from '@/components/ui/Container'
import { SmartImage } from '@/components/ui/SmartImage'
import { buttonClass } from '@/components/ui/button-styles'
import { useStore } from '@/context/StoreContext'
import { whatsappHref } from '@/lib/whatsapp'

/**
 * Hero full-bleed e cinematográfico: a foto da e-bike ocupa a tela inteira,
 * fundo escuro/moody, com título e CTA no canto inferior esquerdo.
 * A imagem de fundo é editável (storeInfo.heroImage / painel).
 */
export function Hero() {
  const { storeInfo } = useStore()
  const reduce = useReducedMotion()
  const ref = useRef<HTMLElement>(null)

  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const imageY = useTransform(scrollYProgress, [0, 1], ['0%', reduce ? '0%' : '12%'])
  const contentY = useTransform(scrollYProgress, [0, 1], ['0%', reduce ? '0%' : '-8%'])
  const contentOpacity = useTransform(scrollYProgress, [0, 0.8], [1, reduce ? 1 : 0])

  const waLink = whatsappHref(storeInfo, 'Olá! Vim pelo site e quero conhecer as bikes elétricas.')

  return (
    <section
      ref={ref}
      className="relative -mt-16 h-[100svh] min-h-[600px] overflow-hidden bg-ink-950 sm:-mt-18"
    >
      {/* Fundo full-bleed: vídeo (se houver) ou imagem, com leve zoom/parallax */}
      <motion.div style={{ y: imageY }} className="absolute inset-0 scale-110">
        {storeInfo.heroVideo && !reduce ? (
          <video
            key={storeInfo.heroVideo}
            className="h-full w-full object-cover"
            poster={storeInfo.heroImage}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
          >
            <source src={storeInfo.heroVideo} />
          </video>
        ) : (
          <SmartImage
            src={storeInfo.heroImage}
            alt="Bicicleta elétrica em destaque no Atacadão das Bikes Camburi"
            className="h-full w-full object-cover animate-kenburns"
            loading="eager"
          />
        )}
      </motion.div>

      {/* Sombreamento cinematográfico para leitura e clima */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/30 to-ink-950/20"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-r from-ink-950/80 via-transparent to-transparent"
      />
      {/* Degradê preto suave na base do banner */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-ink-950 via-ink-950/55 to-transparent"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 [box-shadow:inset_0_0_180px_60px_rgba(8,9,12,0.7)]"
      />

      {/* Conteúdo no canto inferior esquerdo */}
      <Container className="relative z-10 flex h-full flex-col justify-end pb-16 sm:pb-20">
        <motion.div style={{ y: contentY, opacity: contentOpacity }} className="max-w-2xl text-white">
          <motion.span
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-lime-300 backdrop-blur-sm"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-lime-400" /> Camburi · Vitória/ES
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.05 }}
            className="mt-5 text-balance font-display text-4xl font-bold leading-[1.04] drop-shadow-[0_2px_20px_rgba(0,0,0,0.5)] sm:text-6xl"
          >
            {storeInfo.heroTitle}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.12 }}
            className="mt-4 max-w-lg text-pretty text-sm leading-relaxed text-white/75 drop-shadow-[0_1px_10px_rgba(0,0,0,0.6)] sm:text-base"
          >
            {storeInfo.heroSubtitle}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.18 }}
            className="mt-7 flex flex-wrap items-center gap-3"
          >
            <Link to="/catalogo" className={buttonClass('primary', 'lg')}>
              Comprar agora <ArrowRight size={18} />
            </Link>
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonClass(
                'outline',
                'lg',
                'border-white/25 bg-white/5 text-white backdrop-blur-sm hover:bg-white/10 hover:border-white/45',
              )}
            >
              <MessageCircle size={18} /> WhatsApp
            </a>
          </motion.div>
        </motion.div>
      </Container>

      {/* Indicador de scroll */}
      <motion.div
        aria-hidden
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute bottom-6 left-1/2 z-10 hidden -translate-x-1/2 sm:block"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
          className="flex h-9 w-5 items-start justify-center rounded-full border border-white/25 p-1"
        >
          <span className="h-1.5 w-1 rounded-full bg-lime-400" />
        </motion.div>
      </motion.div>
    </section>
  )
}
