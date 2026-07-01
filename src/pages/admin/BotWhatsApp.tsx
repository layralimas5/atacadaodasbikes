import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Bot,
  Search,
  ArrowLeft,
  Trash2,
  CheckCheck,
  Phone,
  Tag,
  Wallet,
  MapPin,
  User,
  QrCode,
  Smartphone,
  ShieldCheck,
  Power,
  ExternalLink,
  MessageCircle,
} from 'lucide-react'
import { useStore } from '@/context/StoreContext'
import type { Lead, LeadStage } from '@/lib/types'

const STAGE_LABEL: Record<LeadStage, string> = {
  novo: 'Novo',
  em_atendimento: 'Em atendimento',
  qualificado: 'Qualificado',
  fechado: 'Fechado',
  perdido: 'Perdido',
}

/** Hora curta (HH:mm) para os balões e a lista, no estilo WhatsApp. */
function shortTime(iso: string): string {
  return new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' }).format(
    new Date(iso),
  )
}

/** Data legível para o separador centralizado da conversa. */
function dayLabel(iso: string): string {
  const d = new Date(iso)
  const today = new Date()
  const sameDay = d.toDateString() === today.toDateString()
  if (sameDay) return 'Hoje'
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(d)
}

/** Iniciais para o avatar. */
function initials(name?: string, contact?: string): string {
  const base = (name || contact || 'V').trim()
  const parts = base.split(/\s+/)
  return ((parts[0]?.[0] ?? 'V') + (parts[1]?.[0] ?? '')).toUpperCase()
}

/** Link de WhatsApp direto para o número do cliente (quando há telefone). */
function customerWhatsApp(lead: Lead): string | null {
  const digits = (lead.contact ?? '').replace(/\D/g, '')
  if (digits.length < 8) return null
  const full = digits.length <= 11 ? `55${digits}` : digits
  return `https://wa.me/${full}`
}

export function BotWhatsApp() {
  const { leads, chatEnabled, setChatEnabled, deleteLead } = useStore()
  const [activeId, setActiveId] = useState<string | null>(null)
  const [query, setQuery] = useState('')

  // Conversas = leads que já trocaram mensagens, da mais recente para a mais antiga.
  const conversations = useMemo(
    () =>
      [...leads]
        .filter((l) => l.transcript && l.transcript.length > 0)
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
    [leads],
  )

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return conversations
    return conversations.filter((c) =>
      `${c.name ?? ''} ${c.contact ?? ''} ${c.interest ?? ''}`.toLowerCase().includes(q),
    )
  }, [conversations, query])

  const active = useMemo(
    () => conversations.find((c) => c.id === activeId) ?? null,
    [conversations, activeId],
  )

  const lastMsg = (l: Lead) => l.transcript?.[l.transcript.length - 1]

  const confirmDelete = (l: Lead) => {
    if (window.confirm('Excluir esta conversa? Essa ação não pode ser desfeita.')) {
      if (activeId === l.id) setActiveId(null)
      deleteLead(l.id)
    }
  }

  return (
    <div className="flex h-[calc(100svh-7rem)] flex-col lg:h-[calc(100svh-5rem)]">
      {/* Cabeçalho + status da conexão */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#25D366] text-white shadow-soft">
            <Bot size={22} />
          </span>
          <div>
            <h1 className="font-display text-2xl font-bold leading-tight text-ink-950">Bot do WhatsApp</h1>
            <p className="text-sm text-ink-700/60">
              Atendimento automático que vira ficha de cliente no CRM.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <ConnectionBadge connected={false} />
          <button
            onClick={() => setChatEnabled(!chatEnabled)}
            role="switch"
            aria-checked={chatEnabled}
            aria-label="Ativar ou pausar o bot"
            className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
              chatEnabled ? 'bg-lime-400/20 text-lime-700' : 'bg-ink-900/8 text-ink-700/60'
            }`}
          >
            <Power size={14} />
            {chatEnabled ? 'Bot ativo' : 'Bot pausado'}
            <span
              className={`relative inline-flex h-4 w-7 items-center rounded-full transition-colors ${
                chatEnabled ? 'bg-lime-500' : 'bg-ink-900/20'
              }`}
            >
              <span
                className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                  chatEnabled ? 'translate-x-3.5' : 'translate-x-0.5'
                }`}
              />
            </span>
          </button>
        </div>
      </div>

      {/* "Tela do WhatsApp" — ocupa toda a área */}
      <div className="grid min-h-0 flex-1 overflow-hidden rounded-2xl border border-ink-900/10 bg-white shadow-soft lg:grid-cols-[20rem_1fr] xl:grid-cols-[20rem_1fr_18rem]">
        {/* Coluna 1 — lista de conversas */}
        <aside
          className={`flex min-h-0 flex-col border-r border-ink-900/8 ${
            active ? 'hidden lg:flex' : 'flex'
          }`}
        >
          <div className="flex items-center gap-2 bg-[#075E54] px-3 py-3 text-white">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-white/15">
              <Bot size={18} />
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">Atacadão das Bikes</p>
              <p className="text-[11px] text-white/70">
                {conversations.length} conversa(s)
              </p>
            </div>
          </div>

          <div className="border-b border-ink-900/8 p-2">
            <div className="flex items-center gap-2 rounded-lg bg-sand-100 px-3 py-2">
              <Search size={15} className="text-ink-700/40" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar conversa"
                className="w-full bg-transparent text-sm text-ink-900 placeholder:text-ink-700/40 focus:outline-none"
                aria-label="Buscar conversa"
              />
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto">
            {filtered.length === 0 ? (
              <p className="px-4 py-10 text-center text-sm text-ink-700/50">
                {conversations.length === 0
                  ? 'Nenhuma conversa ainda.'
                  : 'Nada encontrado para a busca.'}
              </p>
            ) : (
              filtered.map((c) => {
                const last = lastMsg(c)
                const isActive = activeId === c.id
                return (
                  <button
                    key={c.id}
                    onClick={() => setActiveId(c.id)}
                    className={`flex w-full items-center gap-3 border-b border-ink-900/5 px-3 py-3 text-left transition-colors hover:bg-sand-50 ${
                      isActive ? 'bg-sand-100' : ''
                    }`}
                  >
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#25D366]/15 text-sm font-bold text-[#075E54]">
                      {initials(c.name, c.contact)}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center justify-between gap-2">
                        <span className="truncate font-semibold text-ink-950">
                          {c.name || c.contact || 'Visitante'}
                        </span>
                        <span className="shrink-0 text-[11px] text-ink-700/45">
                          {shortTime(c.updatedAt)}
                        </span>
                      </span>
                      <span className="mt-0.5 flex items-center gap-1 text-xs text-ink-700/60">
                        {last?.role === 'model' && (
                          <CheckCheck size={13} className="shrink-0 text-[#53bdeb]" />
                        )}
                        <span className="truncate">{last?.text || '—'}</span>
                      </span>
                    </span>
                  </button>
                )
              })
            )}
          </div>
        </aside>

        {/* Coluna 2 — conversa */}
        <section className={`flex min-h-0 flex-col ${active ? 'flex' : 'hidden lg:flex'}`}>
          {active ? (
            <ConversationView
              lead={active}
              onBack={() => setActiveId(null)}
              onDelete={() => confirmDelete(active)}
            />
          ) : (
            <ConnectScreen />
          )}
        </section>

        {/* Coluna 3 — ficha do cliente */}
        <aside className="hidden min-h-0 flex-col border-l border-ink-900/8 bg-sand-50 xl:flex">
          {active ? (
            <ClientCard lead={active} />
          ) : (
            <div className="grid flex-1 place-items-center px-6 text-center">
              <div>
                <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-ink-900/5 text-ink-700/40">
                  <User size={22} />
                </span>
                <p className="mt-3 text-sm font-semibold text-ink-900">Ficha do cliente</p>
                <p className="mt-1 text-xs text-ink-700/55">
                  Selecione uma conversa para ver os dados que o bot já capturou.
                </p>
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}

/* ---------- Conversa (estilo WhatsApp) ---------- */

function ConversationView({
  lead,
  onBack,
  onDelete,
}: {
  lead: Lead
  onBack: () => void
  onDelete: () => void
}) {
  return (
    <>
      {/* Header da conversa */}
      <header className="flex items-center gap-3 bg-[#075E54] px-3 py-2.5 text-white">
        <button
          onClick={onBack}
          className="grid h-9 w-9 place-items-center rounded-full hover:bg-white/10 lg:hidden"
          aria-label="Voltar à lista"
        >
          <ArrowLeft size={20} />
        </button>
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/15 text-sm font-bold">
          {initials(lead.name, lead.contact)}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold leading-tight">
            {lead.name || lead.contact || 'Visitante'}
          </p>
          <p className="truncate text-[11px] text-white/70">
            {lead.contact || 'contato não informado'}
          </p>
        </div>
        <button
          onClick={onDelete}
          className="grid h-9 w-9 place-items-center rounded-full hover:bg-white/10"
          aria-label="Excluir conversa"
        >
          <Trash2 size={17} />
        </button>
      </header>

      {/* Mensagens */}
      <div
        className="min-h-0 flex-1 space-y-1.5 overflow-y-auto px-4 py-4"
        style={{ backgroundColor: '#efeae2' }}
      >
        <div className="sticky top-0 z-10 mx-auto mb-2 w-fit rounded-md bg-white/85 px-2.5 py-1 text-[11px] font-medium text-ink-700/70 shadow-sm backdrop-blur">
          {dayLabel(lead.createdAt)}
        </div>

        {lead.transcript?.map((m, i) => {
          const fromBot = m.role === 'model'
          return (
            <div key={i} className={`flex ${fromBot ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`relative max-w-[78%] whitespace-pre-wrap rounded-lg px-3 py-1.5 text-sm shadow-sm ${
                  fromBot ? 'bg-[#d9fdd3] text-ink-900' : 'bg-white text-ink-900'
                }`}
              >
                {m.text}
                <span className="ml-2 inline-flex translate-y-0.5 items-center gap-0.5 text-[10px] text-ink-700/45">
                  {shortTime(lead.updatedAt)}
                  {fromBot && <CheckCheck size={12} className="text-[#53bdeb]" />}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Barra de digitação (desabilitada — o bot responde sozinho) */}
      <div className="flex items-center gap-2 border-t border-ink-900/8 bg-sand-100 px-3 py-2.5">
        <div className="flex-1 rounded-full bg-white px-4 py-2 text-sm text-ink-700/45">
          O bot responde automaticamente — configuração do WhatsApp em andamento
        </div>
        <span className="grid h-9 w-9 place-items-center rounded-full bg-[#25D366] text-white opacity-60">
          <Bot size={17} />
        </span>
      </div>
    </>
  )
}

/* ---------- Ficha do cliente ---------- */

function ClientCard({ lead }: { lead: Lead }) {
  const wa = customerWhatsApp(lead)
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex flex-col items-center gap-2 border-b border-ink-900/8 px-5 py-6 text-center">
        <span className="grid h-16 w-16 place-items-center rounded-full bg-[#25D366]/15 text-lg font-bold text-[#075E54]">
          {initials(lead.name, lead.contact)}
        </span>
        <p className="font-display font-bold text-ink-950">{lead.name || 'Cliente sem nome'}</p>
        <span className="rounded-full bg-ink-900/8 px-2.5 py-0.5 text-[11px] font-semibold text-ink-700/70">
          {STAGE_LABEL[lead.stage]}
        </span>
      </div>

      <div className="min-h-0 flex-1 space-y-2.5 overflow-y-auto px-5 py-5 text-sm">
        <FichaRow icon={<Phone size={15} />} label="Contato" value={lead.contact} />
        <FichaRow icon={<Tag size={15} />} label="Interesse" value={lead.interest} />
        <FichaRow icon={<Wallet size={15} />} label="Orçamento" value={lead.budget} />
        <FichaRow icon={<MapPin size={15} />} label="Cidade" value={lead.city} />

        {lead.summary && (
          <div className="rounded-xl bg-white p-3 text-ink-700 shadow-soft">
            <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-ink-700/45">
              Resumo
            </p>
            {lead.summary}
          </div>
        )}
      </div>

      <div className="space-y-2 border-t border-ink-900/8 p-4">
        {wa && (
          <a
            href={wa}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 rounded-lg bg-[#25D366] py-2 text-sm font-semibold text-white transition-colors hover:bg-[#1ebe5a]"
          >
            <MessageCircle size={15} /> Falar no WhatsApp
          </a>
        )}
        <Link
          to="/admin/crm"
          className="flex items-center justify-center gap-1.5 rounded-lg border border-ink-900/12 py-2 text-sm font-semibold text-ink-800 transition-colors hover:border-ink-900/25"
        >
          <ExternalLink size={15} /> Abrir no CRM
        </Link>
      </div>
    </div>
  )
}

function FichaRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value?: string
}) {
  return (
    <div className="flex items-start gap-2.5">
      <span className="mt-0.5 text-ink-700/40">{icon}</span>
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-700/45">{label}</p>
        <p className="break-words text-ink-900">{value || '—'}</p>
      </div>
    </div>
  )
}

/* ---------- Tela de conexão (placeholder durante a configuração de hoje) ---------- */

function ConnectScreen() {
  return (
    <div
      className="grid min-h-0 flex-1 place-items-center px-6 py-10"
      style={{ backgroundColor: '#efeae2' }}
    >
      <div className="w-full max-w-md rounded-2xl border border-ink-900/8 bg-white p-8 text-center shadow-soft">
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-[#075E54] text-white">
          <Smartphone size={28} />
        </span>
        <h2 className="mt-4 font-display text-lg font-bold text-ink-950">
          Conecte o WhatsApp ao bot
        </h2>
        <p className="mt-1.5 text-sm text-ink-700/60">
          Selecione uma conversa ao lado para acompanhar o atendimento. A conexão oficial com o
          número do WhatsApp está sendo configurada agora.
        </p>

        <div className="mx-auto mt-6 grid h-44 w-44 place-items-center rounded-xl border-2 border-dashed border-ink-900/15 bg-sand-50 text-ink-700/30">
          <QrCode size={64} />
        </div>
        <p className="mt-3 text-xs text-ink-700/45">
          O QR Code de pareamento aparecerá aqui na configuração.
        </p>

        <div className="mt-6 space-y-2 text-left">
          <Step n={1} text="Cadastrar o número no WhatsApp Business / Cloud API" />
          <Step n={2} text="Conectar o webhook do bot (Gemini) ao número" />
          <Step n={3} text="Cada conversa vira automaticamente uma ficha no CRM" />
        </div>
      </div>
    </div>
  )
}

function Step({ n, text }: { n: number; text: string }) {
  return (
    <div className="flex items-center gap-3 rounded-lg bg-sand-50 px-3 py-2.5">
      <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[#25D366] text-xs font-bold text-white">
        {n}
      </span>
      <span className="text-sm text-ink-800">{text}</span>
    </div>
  )
}

/* ---------- Badge de status da conexão ---------- */

function ConnectionBadge({ connected }: { connected: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${
        connected ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
      }`}
    >
      <ShieldCheck size={14} />
      {connected ? 'WhatsApp conectado' : 'Conectando agora'}
    </span>
  )
}
