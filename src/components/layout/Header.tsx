import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Bike, ShoppingBag, Menu, X, Lock } from 'lucide-react'
import { Container } from '@/components/ui/Container'
import { buttonClass } from '@/components/ui/button-styles'
import { useCart } from '@/context/CartContext'
import { useStore } from '@/context/StoreContext'

const NAV = [
  { label: 'Início', to: '/' },
  { label: 'Bikes', to: '/catalogo' },
  { label: 'Categorias', to: '/#categorias' },
  { label: 'Contato', to: '/#contato' },
]

export function Header() {
  const { count, open } = useCart()
  const { storeInfo } = useStore()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => setMenuOpen(false), [location])

  // Sobre o banner da home (topo, sem scroll) os ícones e textos ficam brancos.
  // Ao rolar — ou em outras páginas (fundo claro) — o conteúdo volta ao escuro.
  const onDark = !scrolled && location.pathname === '/'

  const iconBtn = `relative grid h-10 w-10 place-items-center rounded-full transition-colors ${
    onDark ? 'text-white hover:bg-white/10' : 'text-ink-900 hover:bg-ink-900/5'
  }`

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/85 backdrop-blur-xl border-b border-ink-900/10 shadow-soft'
          : 'bg-transparent border-b border-transparent'
      }`}
    >
      <Container className="flex h-16 items-center justify-between gap-4 sm:h-18">
        <Link to="/" className="flex items-center gap-2.5" aria-label={storeInfo.name}>
          <span
            className={`grid h-9 w-9 place-items-center rounded-xl transition-colors ${
              onDark ? 'border border-white/20 bg-white/10 text-white backdrop-blur' : 'bg-ink-950 text-lime-400'
            }`}
          >
            <Bike size={20} strokeWidth={2.2} />
          </span>
          <span
            className={`font-display text-[15px] font-bold leading-tight transition-colors ${
              onDark ? 'text-white' : 'text-ink-950'
            }`}
          >
            Atacadão <span className={onDark ? 'text-lime-300' : 'text-lime-600'}>das Bikes</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Navegação principal">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`rounded-full px-3.5 py-2 text-sm font-medium transition-colors ${
                onDark
                  ? 'text-white/85 hover:bg-white/10 hover:text-white'
                  : 'text-ink-700 hover:bg-ink-900/5 hover:text-ink-950'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={open}
            className={iconBtn}
            aria-label={`Abrir carrinho (${count} ${count === 1 ? 'item' : 'itens'})`}
          >
            <ShoppingBag size={20} />
            {count > 0 && (
              <span className="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-lime-400 px-1 text-[11px] font-bold text-ink-950">
                {count}
              </span>
            )}
          </button>

          {/* Botão do sistema administrativo — canto superior */}
          <Link
            to="/admin"
            className={
              onDark
                ? 'hidden items-center justify-center gap-2 rounded-full border border-white/30 bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur transition-all hover:bg-white/20 sm:inline-flex'
                : buttonClass('outline', 'sm', 'hidden sm:inline-flex')
            }
            title="Acessar o sistema administrativo (estoque, vendas, conteúdo)"
          >
            <Lock size={15} />
            <span>Admin</span>
          </Link>

          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            className={`${iconBtn} lg:hidden`}
            aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </Container>

      <AnimatePresence>
        {menuOpen && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="overflow-hidden border-t border-ink-900/10 bg-white lg:hidden"
            aria-label="Navegação móvel"
          >
            <Container className="flex flex-col py-3">
              {NAV.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className="rounded-xl px-3 py-3 text-base font-medium text-ink-800 hover:bg-ink-900/5"
                >
                  {item.label}
                </Link>
              ))}
              <Link to="/admin" className={buttonClass('dark', 'md', 'mt-2')}>
                <Lock size={16} /> Sistema administrativo
              </Link>
            </Container>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  )
}
