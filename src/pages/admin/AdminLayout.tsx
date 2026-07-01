import { useState } from 'react'
import { Link, NavLink, Outlet } from 'react-router-dom'
import {
  LayoutDashboard,
  Package,
  Boxes,
  Receipt,
  Contact,
  Users,
  Bot,
  MessagesSquare,
  Settings,
  LogOut,
  Bike,
  ExternalLink,
  Menu,
  X,
} from 'lucide-react'
import { useStore } from '@/context/StoreContext'
import { Login } from '@/pages/admin/Login'

const NAV = [
  { to: '/admin', label: 'Visão geral', icon: LayoutDashboard, end: true },
  { to: '/admin/produtos', label: 'Produtos', icon: Package, end: false },
  { to: '/admin/estoque', label: 'Estoque', icon: Boxes, end: false },
  { to: '/admin/vendas', label: 'Vendas', icon: Receipt, end: false },
  { to: '/admin/clientes', label: 'Clientes', icon: Contact, end: false },
  { to: '/admin/crm', label: 'CRM', icon: Users, end: false },
  { to: '/admin/bot-site', label: 'Bot do site', icon: MessagesSquare, end: false },
  { to: '/admin/bot', label: 'Bot WhatsApp', icon: Bot, end: false },
  // Item "API" oculto do menu — a página continua acessível por /admin/api.
  { to: '/admin/config', label: 'Configurações', icon: Settings, end: false },
]

export function AdminLayout() {
  const { isAdmin, logout } = useStore()
  const [mobileNav, setMobileNav] = useState(false)

  if (!isAdmin) return <Login />

  return (
    <div className="min-h-svh bg-sand-100 lg:grid lg:grid-cols-[260px_1fr]">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 flex-col border-r border-ink-900/10 bg-ink-950 text-white transition-transform lg:static lg:flex lg:translate-x-0 ${
          mobileNav ? 'flex translate-x-0' : 'hidden -translate-x-full lg:flex'
        }`}
      >
        <div className="flex items-center justify-between px-5 py-5">
          <Link to="/admin" className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-lime-400 text-ink-950">
              <Bike size={19} strokeWidth={2.2} />
            </span>
            <span className="font-display text-sm font-bold leading-tight">
              Painel
              <span className="block text-[11px] font-normal text-white/40">Atacadão das Bikes</span>
            </span>
          </Link>
          <button
            onClick={() => setMobileNav(false)}
            className="text-white/60 hover:text-white lg:hidden"
            aria-label="Fechar menu"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-2">
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={() => setMobileNav(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive ? 'bg-lime-400 text-ink-950' : 'text-white/70 hover:bg-white/5 hover:text-white'
                }`
              }
            >
              <Icon size={18} /> {label}
            </NavLink>
          ))}
        </nav>

        <div className="space-y-1 border-t border-white/10 p-3">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-white/70 hover:bg-white/5 hover:text-white"
          >
            <ExternalLink size={18} /> Ver a loja
          </a>
          <button
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-white/70 hover:bg-white/5 hover:text-white"
          >
            <LogOut size={18} /> Sair
          </button>
        </div>
      </aside>

      {mobileNav && (
        <div
          className="fixed inset-0 z-40 bg-ink-950/50 lg:hidden"
          onClick={() => setMobileNav(false)}
          aria-hidden
        />
      )}

      {/* Conteúdo */}
      <div className="flex min-w-0 flex-col">
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-ink-900/10 bg-white/80 px-5 py-3.5 backdrop-blur lg:hidden">
          <button
            onClick={() => setMobileNav(true)}
            className="grid h-9 w-9 place-items-center rounded-lg hover:bg-ink-900/5"
            aria-label="Abrir menu"
          >
            <Menu size={20} />
          </button>
          <span className="font-display text-sm font-bold text-ink-950">Painel administrativo</span>
        </header>
        <main className="flex-1 p-5 sm:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
