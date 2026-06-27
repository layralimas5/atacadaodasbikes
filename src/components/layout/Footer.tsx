import { Link } from 'react-router-dom'
import { Bike, MessageCircle, Lock } from 'lucide-react'
import { InstagramIcon } from '@/components/ui/InstagramIcon'
import { Container } from '@/components/ui/Container'
import { CATEGORIES } from '@/data/seed'
import { useStore } from '@/context/StoreContext'
import { whatsappHref } from '@/lib/whatsapp'

export function Footer() {
  const { storeInfo } = useStore()
  const year = new Date().getFullYear()
  const waLink = whatsappHref(storeInfo, 'Olá! Vim pelo site.')

  return (
    <footer className="border-t border-ink-900/10 bg-white">
      <Container className="grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div className="lg:col-span-1">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-ink-950 text-lime-400">
              <Bike size={20} strokeWidth={2.2} />
            </span>
            <span className="font-display text-[15px] font-bold text-ink-950">
              Atacadão das Bikes
            </span>
          </Link>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-ink-700/70">
            {storeInfo.tagline}. {storeInfo.shippingNote}
          </p>
          <div className="mt-4 flex gap-2">
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="grid h-9 w-9 place-items-center rounded-full bg-ink-900/5 text-ink-800 hover:bg-ink-900/10"
              aria-label="WhatsApp"
            >
              <MessageCircle size={17} />
            </a>
            <a
              href={`https://instagram.com/${storeInfo.instagram}`}
              target="_blank"
              rel="noopener noreferrer"
              className="grid h-9 w-9 place-items-center rounded-full bg-ink-900/5 text-ink-800 hover:bg-ink-900/10"
              aria-label="Instagram"
            >
              <InstagramIcon size={17} />
            </a>
          </div>
        </div>

        <nav aria-label="Categorias">
          <h3 className="text-xs font-bold uppercase tracking-wider text-ink-700/50">Categorias</h3>
          <ul className="mt-4 space-y-2.5">
            {CATEGORIES.slice(0, 5).map((cat) => (
              <li key={cat.slug}>
                <Link
                  to={`/catalogo?cat=${cat.slug}`}
                  className="text-sm text-ink-700 hover:text-ink-950"
                >
                  {cat.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Institucional">
          <h3 className="text-xs font-bold uppercase tracking-wider text-ink-700/50">A loja</h3>
          <ul className="mt-4 space-y-2.5">
            <li>
              <Link to="/catalogo" className="text-sm text-ink-700 hover:text-ink-950">
                Catálogo
              </Link>
            </li>
            <li>
              <Link to="/#categorias" className="text-sm text-ink-700 hover:text-ink-950">
                Categorias
              </Link>
            </li>
            <li>
              <Link to="/#contato" className="text-sm text-ink-700 hover:text-ink-950">
                Contato
              </Link>
            </li>
            <li>
              <Link
                to="/admin"
                className="inline-flex items-center gap-1.5 text-sm text-ink-700 hover:text-ink-950"
              >
                <Lock size={13} /> Área administrativa
              </Link>
            </li>
          </ul>
        </nav>

        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-ink-700/50">Contato</h3>
          <ul className="mt-4 space-y-2.5 text-sm text-ink-700">
            <li>{storeInfo.address}</li>
            <li>{storeInfo.hours}</li>
            {storeInfo.phone && <li>{storeInfo.phone}</li>}
            <li>{storeInfo.email}</li>
          </ul>
        </div>
      </Container>

      <div className="border-t border-ink-900/10">
        <Container className="flex flex-col items-center justify-between gap-2 py-5 text-xs text-ink-700/60 sm:flex-row">
          <p>
            © {year} {storeInfo.name}. Todos os direitos reservados.
          </p>
          <p>
            Feito com energia por <span className="font-semibold text-ink-800">Layra Lima</span>.
          </p>
        </Container>
      </div>
    </footer>
  )
}
