import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Contact,
  Plus,
  X,
  Trash2,
  Phone,
  Tag,
  MapPin,
  Wallet,
  Store,
  Globe,
  MessageCircle,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '@/context/StoreContext'
import { buttonClass } from '@/components/ui/button-styles'
import { formatDate } from '@/lib/format'
import { leadAttendance, type Lead, type LeadAttendance, type Product } from '@/lib/types'

type AttendanceFilter = 'all' | LeadAttendance

const ATTENDANCE_TABS: { value: AttendanceFilter; label: string }[] = [
  { value: 'all', label: 'Todos' },
  { value: 'presencial', label: 'Presencial' },
  { value: 'online', label: 'Online' },
]

const STAGE_LABEL: Record<Lead['stage'], string> = {
  novo: 'Novo',
  em_atendimento: 'Em atendimento',
  qualificado: 'Qualificado',
  fechado: 'Comprou',
  perdido: 'Não comprou',
}

const channelLabel: Record<Lead['channel'], string> = {
  presencial: 'Presencial',
  site: 'Site',
  whatsapp: 'WhatsApp',
}

export function CustomersAdmin() {
  const { leads, products, addCustomer, deleteLead, recordSale } = useStore()
  const [filter, setFilter] = useState<AttendanceFilter>('all')
  const [showForm, setShowForm] = useState(false)

  // Ficha = registro com identificação (nome, contato ou produto/interesse).
  const customers = useMemo(
    () => leads.filter((l) => l.name || l.contact || l.interest || l.productName),
    [leads],
  )

  const counts = useMemo(() => {
    let presencial = 0
    for (const c of customers) if (leadAttendance(c) === 'presencial') presencial++
    return { presencial, online: customers.length - presencial }
  }, [customers])

  const filtered =
    filter === 'all' ? customers : customers.filter((c) => leadAttendance(c) === filter)

  const confirmDelete = (c: Lead) => {
    if (window.confirm(`Excluir a ficha${c.name ? ` de "${c.name}"` : ''}? Essa ação não pode ser desfeita.`)) {
      deleteLead(c.id)
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink-950">Clientes</h1>
          <p className="mt-1 text-sm text-ink-700/60">
            {customers.length} ficha(s) · {counts.presencial} presencial · {counts.online} online.
          </p>
        </div>
        <button onClick={() => setShowForm(true)} className={buttonClass('primary', 'md')}>
          <Plus size={18} /> Nova ficha
        </button>
      </div>

      {/* Filtro por tipo de atendimento */}
      <div className="mt-5 flex gap-2">
        {ATTENDANCE_TABS.map((t) => (
          <button
            key={t.value}
            type="button"
            onClick={() => setFilter(t.value)}
            className={`rounded-full px-3.5 py-1.5 text-sm font-semibold transition-colors ${
              filter === t.value
                ? 'bg-ink-950 text-white'
                : 'border border-ink-900/12 bg-white text-ink-700 hover:border-ink-900/25'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-ink-900/15 bg-white py-16 text-center">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-sand-100 text-ink-700/40">
            <Contact size={26} />
          </span>
          <p className="mt-3 font-display font-semibold text-ink-950">
            {customers.length === 0 ? 'Nenhuma ficha ainda' : 'Nada neste filtro'}
          </p>
          <p className="mt-1 text-sm text-ink-700/55">
            Cadastre um cliente que veio à loja em “Nova ficha”. O atendimento online também vira ficha aqui.
          </p>
        </div>
      ) : (
        <div className="mt-6 grid gap-3 lg:grid-cols-2">
          {filtered.map((c) => (
            <CustomerCard key={c.id} customer={c} onDelete={() => confirmDelete(c)} />
          ))}
        </div>
      )}

      <AnimatePresence>
        {showForm && (
          <CustomerForm
            products={products}
            onClose={() => setShowForm(false)}
            onSubmit={(data) => {
              const product = data.productId
                ? products.find((p) => p.id === data.productId)
                : undefined
              const customer = addCustomer({
                name: data.name,
                contact: data.contact || undefined,
                city: data.city || undefined,
                budget: data.budget || undefined,
                summary: data.summary,
                interest: product?.name || undefined,
                productId: product?.id,
                productName: product?.name,
                channel: 'presencial',
                stage: data.purchased ? 'fechado' : 'novo',
              })
              // Comprou na hora → registra a venda do produto escolhido.
              if (data.purchased && product) {
                recordSale(
                  [{ productId: product.id, name: product.name, unitPrice: product.price, quantity: 1 }],
                  { channel: 'loja', customer: customer.name || undefined },
                )
              }
              setShowForm(false)
            }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

/** Link de WhatsApp para o número do cliente (se houver telefone). */
function customerWhatsApp(c: Lead): string | null {
  const digits = (c.contact ?? '').replace(/\D/g, '')
  if (digits.length < 8) return null
  const full = digits.length <= 11 ? `55${digits}` : digits
  const msg = `Olá${c.name ? ` ${c.name}` : ''}! Aqui é do Atacadão das Bikes. ${
    c.productName ? `Sobre a ${c.productName}, ` : ''
  }posso te ajudar a fechar?`
  return `https://wa.me/${full}?text=${encodeURIComponent(msg)}`
}

function CustomerCard({ customer, onDelete }: { customer: Lead; onDelete: () => void }) {
  const attendance = leadAttendance(customer)
  const wa = customerWhatsApp(customer)
  return (
    <article className="flex flex-col rounded-2xl border border-ink-900/8 bg-white p-4 shadow-soft">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate font-display font-bold text-ink-950">
            {customer.name || 'Cliente sem nome'}
          </h3>
          <p className="text-xs text-ink-700/50">
            {formatDate(customer.updatedAt)} · {channelLabel[customer.channel]}
          </p>
        </div>
        <span
          className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
            attendance === 'presencial'
              ? 'bg-brand-600/10 text-brand-600'
              : 'bg-lime-400/20 text-lime-700'
          }`}
        >
          {attendance === 'presencial' ? <Store size={12} /> : <Globe size={12} />}
          {attendance === 'presencial' ? 'Presencial' : 'Online'}
        </span>
      </div>

      <dl className="mt-3 space-y-1.5 text-sm">
        {customer.productName && <Row icon={<Tag size={14} />} value={customer.productName} />}
        {customer.contact && <Row icon={<Phone size={14} />} value={customer.contact} />}
        {customer.budget && <Row icon={<Wallet size={14} />} value={customer.budget} />}
        {customer.city && <Row icon={<MapPin size={14} />} value={customer.city} />}
      </dl>

      {customer.summary && (
        <p className="mt-3 rounded-lg bg-sand-50 px-3 py-2 text-sm text-ink-700">{customer.summary}</p>
      )}

      <div className="mt-4 flex items-center gap-2 border-t border-ink-900/8 pt-3">
        <span className="rounded-full bg-ink-900/6 px-2.5 py-1 text-xs font-semibold text-ink-700">
          {STAGE_LABEL[customer.stage]}
        </span>
        <Link
          to="/admin/crm"
          className="text-xs font-semibold text-lime-600 hover:underline"
        >
          Ver no CRM
        </Link>
        <span className="flex-1" />
        {wa && (
          <a
            href={wa}
            target="_blank"
            rel="noopener noreferrer"
            className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-[#1ebe5a] hover:bg-[#25D366]/10"
            aria-label="Chamar no WhatsApp"
          >
            <MessageCircle size={16} />
          </a>
        )}
        <button
          onClick={onDelete}
          className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-ink-700 hover:bg-red-50 hover:text-red-600"
          aria-label="Excluir ficha"
        >
          <Trash2 size={15} />
        </button>
      </div>
    </article>
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

interface CustomerFormData {
  name: string
  contact: string
  city: string
  budget: string
  summary: string
  productId: string
  purchased: boolean
}

function CustomerForm({
  products,
  onClose,
  onSubmit,
}: {
  products: Product[]
  onClose: () => void
  onSubmit: (data: CustomerFormData) => void
}) {
  const [form, setForm] = useState<CustomerFormData>({
    name: '',
    contact: '',
    city: '',
    budget: '',
    summary: '',
    productId: '',
    purchased: false,
  })

  const activeProducts = products.filter((p) => p.active)
  const field =
    'w-full rounded-xl border border-ink-900/12 bg-white px-3.5 py-2.5 text-sm focus:border-ink-900/35 focus:outline-none'
  const set = <K extends keyof CustomerFormData>(key: K, value: CustomerFormData[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-ink-950/50 p-5 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-h-[90svh] w-full max-w-md overflow-y-auto rounded-2xl bg-white shadow-2xl"
        role="dialog"
        aria-label="Nova ficha de cliente"
      >
        <header className="sticky top-0 flex items-center justify-between border-b border-ink-900/10 bg-white px-5 py-4">
          <h2 className="font-display text-lg font-bold text-ink-950">Nova ficha</h2>
          <button onClick={onClose} className="text-ink-700/50 hover:text-ink-950" aria-label="Fechar">
            <X size={20} />
          </button>
        </header>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            if (!form.name.trim()) return
            onSubmit({ ...form, name: form.name.trim() })
          }}
          className="space-y-4 p-5"
        >
          <Field label="Nome do cliente" required>
            <input
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              required
              autoFocus
              placeholder="Ex.: João da Silva"
              className={field}
            />
          </Field>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="WhatsApp / telefone">
              <input
                value={form.contact}
                onChange={(e) => set('contact', e.target.value)}
                inputMode="tel"
                placeholder="(27) 99999-9999"
                className={field}
              />
            </Field>
            <Field label="Cidade">
              <input
                value={form.city}
                onChange={(e) => set('city', e.target.value)}
                placeholder="Opcional"
                className={field}
              />
            </Field>
          </div>

          <Field label="Produto escolhido">
            <select
              value={form.productId}
              onChange={(e) => set('productId', e.target.value)}
              className={field}
            >
              <option value="">Nenhum / ainda decidindo</option>
              {activeProducts.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Orçamento informado">
            <input
              value={form.budget}
              onChange={(e) => set('budget', e.target.value)}
              placeholder="Opcional"
              className={field}
            />
          </Field>

          <Field label="Observações">
            <textarea
              value={form.summary}
              onChange={(e) => set('summary', e.target.value)}
              rows={3}
              placeholder="O que o cliente procura, combinados, próximos passos..."
              className={`${field} resize-none`}
            />
          </Field>

          <label className="flex items-center gap-2.5 rounded-xl border border-ink-900/12 bg-sand-50 px-3.5 py-3 text-sm font-medium text-ink-800">
            <input
              type="checkbox"
              checked={form.purchased}
              onChange={(e) => set('purchased', e.target.checked)}
              className="h-4 w-4 rounded border-ink-900/30 accent-lime-500"
            />
            Comprou na hora (registra a venda do produto escolhido)
          </label>
          {!form.purchased && (
            <p className="-mt-2 text-xs text-ink-700/55">
              Sem compra, a ficha entra no CRM como “Novo” para acompanhamento.
            </p>
          )}

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className={buttonClass('outline', 'md', 'flex-1')}>
              Cancelar
            </button>
            <button type="submit" className={buttonClass('primary', 'md', 'flex-1')}>
              Salvar ficha
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

function Field({
  label,
  required,
  children,
}: {
  label: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase tracking-wide text-ink-700/60">
        {label}
        {required && <span className="text-brand-600"> *</span>}
      </span>
      <div className="mt-1.5">{children}</div>
    </label>
  )
}
