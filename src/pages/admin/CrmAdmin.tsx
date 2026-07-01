import { useMemo, useState } from 'react'
import {
  Users,
  Trash2,
  MessageCircle,
  Phone,
  Tag,
  Wallet,
  MapPin,
  ChevronDown,
  Store,
  Globe,
} from 'lucide-react'
import { useStore } from '@/context/StoreContext'
import { formatDate } from '@/lib/format'
import { leadAttendance, type Lead, type LeadAttendance, type LeadStage } from '@/lib/types'

type AttendanceFilter = 'all' | LeadAttendance

const ATTENDANCE_TABS: { value: AttendanceFilter; label: string }[] = [
  { value: 'all', label: 'Todos' },
  { value: 'presencial', label: 'Presencial' },
  { value: 'online', label: 'Online' },
]

const channelLabel: Record<Lead['channel'], string> = {
  presencial: 'presencial',
  site: 'site',
  whatsapp: 'WhatsApp',
}

const STAGES: { value: LeadStage; label: string; badge: string }[] = [
  { value: 'novo', label: 'Novo', badge: 'bg-lime-400/20 text-lime-700' },
  { value: 'em_atendimento', label: 'Em atendimento', badge: 'bg-brand-600/10 text-brand-600' },
  { value: 'qualificado', label: 'Qualificado', badge: 'bg-amber-100 text-amber-700' },
  { value: 'fechado', label: 'Fechado', badge: 'bg-green-100 text-green-700' },
  { value: 'perdido', label: 'Perdido', badge: 'bg-ink-900/8 text-ink-700/60' },
]

const stageInfo = (s: LeadStage) => STAGES.find((x) => x.value === s) ?? STAGES[0]

/** Link de WhatsApp para o número do CLIENTE (se houver telefone). */
function customerWhatsApp(lead: Lead): string | null {
  const digits = (lead.contact ?? '').replace(/\D/g, '')
  if (digits.length < 8) return null
  const full = digits.length <= 11 ? `55${digits}` : digits
  const msg = `Olá${lead.name ? ` ${lead.name}` : ''}! Aqui é do Atacadão das Bikes. ${
    lead.interest ? `Vi seu interesse em ${lead.interest}. ` : ''
  }Posso te ajudar a fechar?`
  return `https://wa.me/${full}?text=${encodeURIComponent(msg)}`
}

export function CrmAdmin() {
  const { leads, updateLead, deleteLead } = useStore()
  const [filter, setFilter] = useState<LeadStage | 'all'>('all')
  const [attendance, setAttendance] = useState<AttendanceFilter>('all')
  const [openId, setOpenId] = useState<string | null>(null)

  // CRM = leads com dados (nome, contato ou pedido). Conversas cruas ficam na aba Conversas.
  const qualified = useMemo(
    () => leads.filter((l) => l.name || l.contact || l.interest || l.productName),
    [leads],
  )

  // Recorte por tipo de atendimento (presencial x online) antes dos estágios.
  const byAttendance = useMemo(
    () =>
      attendance === 'all'
        ? qualified
        : qualified.filter((l) => leadAttendance(l) === attendance),
    [qualified, attendance],
  )

  const counts = useMemo(() => {
    const map = new Map<LeadStage, number>()
    for (const l of byAttendance) map.set(l.stage, (map.get(l.stage) ?? 0) + 1)
    return map
  }, [byAttendance])

  const filtered = filter === 'all' ? byAttendance : byAttendance.filter((l) => l.stage === filter)

  const confirmDelete = (l: Lead) => {
    if (window.confirm(`Excluir o lead${l.name ? ` "${l.name}"` : ''}? Essa ação não pode ser desfeita.`)) {
      deleteLead(l.id)
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink-950">CRM</h1>
          <p className="mt-1 text-sm text-ink-700/60">
            {byAttendance.length} lead(s) no funil
            {attendance !== 'all'
              ? ` · ${attendance === 'presencial' ? 'presencial' : 'online'}`
              : ''}
            .
          </p>
        </div>
      </div>

      {/* Separação por tipo de atendimento (presencial x online) */}
      <div className="mt-5 flex gap-2">
        {ATTENDANCE_TABS.map((t) => {
          const Icon = t.value === 'presencial' ? Store : t.value === 'online' ? Globe : null
          return (
            <button
              key={t.value}
              type="button"
              onClick={() => setAttendance(t.value)}
              className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-semibold transition-colors ${
                attendance === t.value
                  ? 'bg-ink-950 text-white'
                  : 'border border-ink-900/12 bg-white text-ink-700 hover:border-ink-900/25'
              }`}
            >
              {Icon && <Icon size={14} />}
              {t.label}
            </button>
          )
        })}
      </div>

      {/* Filtros por estágio */}
      <div className="mt-4 -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        <Chip label={`Todos (${byAttendance.length})`} active={filter === 'all'} onClick={() => setFilter('all')} />
        {STAGES.map((s) => (
          <Chip
            key={s.value}
            label={`${s.label} (${counts.get(s.value) ?? 0})`}
            active={filter === s.value}
            onClick={() => setFilter(s.value)}
          />
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-ink-900/15 bg-white py-16 text-center">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-sand-100 text-ink-700/40">
            <Users size={26} />
          </span>
          <p className="mt-3 font-display font-semibold text-ink-950">
            {qualified.length === 0 ? 'Nenhum lead ainda' : 'Nada neste estágio'}
          </p>
          <p className="mt-1 text-sm text-ink-700/55">
            Conversas no atendimento do site viram leads aqui automaticamente.
          </p>
        </div>
      ) : (
        <div className="mt-6 grid gap-3 lg:grid-cols-2">
          {filtered.map((lead) => {
            const wa = customerWhatsApp(lead)
            const open = openId === lead.id
            return (
              <article
                key={lead.id}
                className="flex flex-col rounded-2xl border border-ink-900/8 bg-white p-4 shadow-soft"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="truncate font-display font-bold text-ink-950">
                        {lead.name || 'Cliente sem nome'}
                      </h3>
                      <span
                        className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                          leadAttendance(lead) === 'presencial'
                            ? 'bg-brand-600/10 text-brand-600'
                            : 'bg-lime-400/20 text-lime-700'
                        }`}
                      >
                        {leadAttendance(lead) === 'presencial' ? <Store size={11} /> : <Globe size={11} />}
                        {leadAttendance(lead) === 'presencial' ? 'Presencial' : 'Online'}
                      </span>
                    </div>
                    <p className="text-xs text-ink-700/50">
                      {formatDate(lead.updatedAt)} · via {channelLabel[lead.channel]}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${stageInfo(lead.stage).badge}`}
                  >
                    {stageInfo(lead.stage).label}
                  </span>
                </div>

                <dl className="mt-3 space-y-1.5 text-sm">
                  {lead.productName && <Row icon={<Tag size={14} />} value={lead.productName} />}
                  {lead.contact && <Row icon={<Phone size={14} />} value={lead.contact} />}
                  {lead.interest && !lead.productName && <Row icon={<Tag size={14} />} value={lead.interest} />}
                  {lead.budget && <Row icon={<Wallet size={14} />} value={lead.budget} />}
                  {lead.city && <Row icon={<MapPin size={14} />} value={lead.city} />}
                </dl>

                {lead.summary && (
                  <p className="mt-3 rounded-lg bg-sand-50 px-3 py-2 text-sm text-ink-700">
                    {lead.summary}
                  </p>
                )}

                {/* Transcrição */}
                {lead.transcript && lead.transcript.length > 0 && (
                  <div className="mt-3">
                    <button
                      onClick={() => setOpenId(open ? null : lead.id)}
                      className="flex items-center gap-1 text-xs font-semibold text-ink-700/60 hover:text-ink-950"
                      aria-expanded={open}
                    >
                      <ChevronDown
                        size={14}
                        className={`transition-transform ${open ? 'rotate-180' : ''}`}
                      />
                      {open ? 'Ocultar conversa' : `Ver conversa (${lead.transcript.length})`}
                    </button>
                    {open && (
                      <div className="mt-2 max-h-56 space-y-2 overflow-y-auto rounded-lg border border-ink-900/8 bg-sand-50 p-3">
                        {lead.transcript.map((m, i) => (
                          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <span
                              className={`max-w-[85%] whitespace-pre-wrap rounded-xl px-2.5 py-1.5 text-xs ${
                                m.role === 'user'
                                  ? 'bg-ink-950 text-white'
                                  : 'border border-ink-900/8 bg-white text-ink-700'
                              }`}
                            >
                              {m.text}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Ações */}
                <div className="mt-4 flex items-center gap-2 border-t border-ink-900/8 pt-3">
                  <select
                    value={lead.stage}
                    onChange={(e) => updateLead(lead.id, { stage: e.target.value as LeadStage })}
                    className="rounded-lg border border-ink-900/12 bg-white px-2.5 py-1.5 text-xs font-medium text-ink-800 focus:border-ink-900/35 focus:outline-none"
                    aria-label="Mudar estágio do lead"
                  >
                    {STAGES.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>

                  {wa ? (
                    <a
                      href={wa}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-[#25D366] py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[#1ebe5a]"
                    >
                      <MessageCircle size={14} /> Chamar no WhatsApp
                    </a>
                  ) : (
                    <span className="flex-1 text-center text-xs text-ink-700/40">sem telefone</span>
                  )}

                  <button
                    onClick={() => confirmDelete(lead)}
                    className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-ink-700 hover:bg-red-50 hover:text-red-600"
                    aria-label="Excluir lead"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}

function Row({ icon, value }: { icon: React.ReactNode; value: string }) {
  return (
    <div className="flex items-center gap-2 text-ink-800">
      <span className="text-ink-700/40">{icon}</span>
      <span className="min-w-0 break-words">{value}</span>
    </div>
  )
}

function Chip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 whitespace-nowrap rounded-full px-3.5 py-1.5 text-sm font-semibold transition-colors ${
        active
          ? 'bg-ink-950 text-white'
          : 'border border-ink-900/12 bg-white text-ink-700 hover:border-ink-900/25'
      }`}
    >
      {label}
    </button>
  )
}
