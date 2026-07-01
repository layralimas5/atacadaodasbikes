import { useState } from 'react'
import {
  Settings,
  Store,
  Bot,
  Lock,
  TriangleAlert,
  Save,
  Check,
  Power,
} from 'lucide-react'
import { useStore } from '@/context/StoreContext'
import type { StoreInfo } from '@/lib/types'

export function SettingsAdmin() {
  const {
    storeInfo,
    updateStoreInfo,
    chatEnabled,
    setChatEnabled,
    changePassword,
    resetData,
  } = useStore()

  const [form, setForm] = useState<StoreInfo>(storeInfo)
  const [saved, setSaved] = useState(false)

  const set = (key: keyof StoreInfo, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    setSaved(false)
  }

  const dirty = JSON.stringify(form) !== JSON.stringify(storeInfo)

  const save = () => {
    updateStoreInfo(form)
    setSaved(true)
    window.setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex items-center gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-2xl bg-ink-950 text-lime-400">
          <Settings size={22} />
        </span>
        <div>
          <h1 className="font-display text-2xl font-bold leading-tight text-ink-950">
            Configurações
          </h1>
          <p className="text-sm text-ink-700/60">Dados da loja, atendimento e segurança.</p>
        </div>
      </div>

      {/* Dados da loja */}
      <Card icon={<Store size={20} />} title="Dados da loja" subtitle="Aparecem no site e o bot usa para responder.">
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Nome da loja" value={form.name} onChange={(v) => set('name', v)} />
          <Input label="Slogan" value={form.tagline} onChange={(v) => set('tagline', v)} />
          <Input
            label="Link do WhatsApp"
            value={form.whatsappUrl ?? ''}
            onChange={(v) => set('whatsappUrl', v)}
            placeholder="https://api.whatsapp.com/message/..."
          />
          <Input
            label="Número do WhatsApp (só dígitos)"
            value={form.whatsapp}
            onChange={(v) => set('whatsapp', v)}
            placeholder="5527999999999"
          />
          <Input label="E-mail" value={form.email} onChange={(v) => set('email', v)} type="email" />
          <Input label="Instagram (sem @)" value={form.instagram} onChange={(v) => set('instagram', v)} />
          <Input label="Telefone" value={form.phone} onChange={(v) => set('phone', v)} />
          <Input label="Cidade" value={form.city} onChange={(v) => set('city', v)} />
          <div className="sm:col-span-2">
            <Input label="Endereço" value={form.address} onChange={(v) => set('address', v)} />
          </div>
          <Input label="Horário de funcionamento" value={form.hours} onChange={(v) => set('hours', v)} />
          <Input
            label="Entrega / retirada"
            value={form.shippingNote}
            onChange={(v) => set('shippingNote', v)}
          />
        </div>
      </Card>

      {/* Atendimento (bot) */}
      <Card icon={<Bot size={20} />} title="Atendimento do bot" subtitle="Liga ou pausa o atendimento automático no site e no WhatsApp.">
        <button
          onClick={() => setChatEnabled(!chatEnabled)}
          role="switch"
          aria-checked={chatEnabled}
          className="flex w-full items-center justify-between gap-3 rounded-xl border border-ink-900/8 bg-sand-50 px-4 py-3 text-left"
        >
          <span className="flex items-center gap-2.5">
            <Power size={18} className={chatEnabled ? 'text-lime-600' : 'text-ink-700/40'} />
            <span>
              <span className="block text-sm font-semibold text-ink-950">
                {chatEnabled ? 'Bot ativo' : 'Bot pausado'}
              </span>
              <span className="block text-xs text-ink-700/55">
                {chatEnabled
                  ? 'Respondendo clientes automaticamente.'
                  : 'Atendimento automático desligado.'}
              </span>
            </span>
          </span>
          <span
            className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors ${
              chatEnabled ? 'bg-lime-500' : 'bg-ink-900/15'
            }`}
          >
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                chatEnabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </span>
        </button>
      </Card>

      {/* Barra de salvar (dados da loja) */}
      <div className="sticky bottom-4 mt-6 flex items-center justify-end gap-3 rounded-2xl border border-ink-900/8 bg-white/90 p-3 shadow-soft backdrop-blur">
        {saved && (
          <span className="flex items-center gap-1.5 text-sm font-medium text-green-600">
            <Check size={16} /> Salvo
          </span>
        )}
        <button
          onClick={save}
          disabled={!dirty}
          className="inline-flex items-center gap-2 rounded-xl bg-ink-950 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-ink-900 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Save size={16} /> Salvar dados da loja
        </button>
      </div>

      <PasswordCard changePassword={changePassword} />

      <DangerZone resetData={resetData} />
    </div>
  )
}

/* ---------- Troca de senha ---------- */

function PasswordCard({
  changePassword,
}: {
  changePassword: (current: string, next: string) => boolean
}) {
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [confirm, setConfirm] = useState('')
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)

  const submit = () => {
    if (next !== confirm) {
      setMsg({ ok: false, text: 'A confirmação não confere com a nova senha.' })
      return
    }
    if (next.trim().length < 4) {
      setMsg({ ok: false, text: 'A nova senha precisa ter ao menos 4 caracteres.' })
      return
    }
    if (changePassword(current, next)) {
      setMsg({ ok: true, text: 'Senha atualizada com sucesso.' })
      setCurrent('')
      setNext('')
      setConfirm('')
    } else {
      setMsg({ ok: false, text: 'Senha atual incorreta.' })
    }
  }

  return (
    <Card icon={<Lock size={20} />} title="Senha do painel" subtitle="Acesso administrativo (protótipo). Ao migrar para o Supabase, vira login real.">
      <div className="grid gap-4 sm:grid-cols-3">
        <Input label="Senha atual" value={current} onChange={setCurrent} type="password" />
        <Input label="Nova senha" value={next} onChange={setNext} type="password" />
        <Input label="Confirmar nova senha" value={confirm} onChange={setConfirm} type="password" />
      </div>
      {msg && (
        <p className={`mt-3 text-sm font-medium ${msg.ok ? 'text-green-600' : 'text-red-600'}`}>
          {msg.text}
        </p>
      )}
      <button
        onClick={submit}
        disabled={!current || !next || !confirm}
        className="mt-4 inline-flex items-center gap-2 rounded-xl border border-ink-900/12 px-4 py-2 text-sm font-semibold text-ink-800 transition-colors hover:border-ink-900/30 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <Lock size={15} /> Alterar senha
      </button>
    </Card>
  )
}

/* ---------- Zona de risco ---------- */

function DangerZone({ resetData }: { resetData: () => void }) {
  const confirmReset = () => {
    if (
      window.confirm(
        'Restaurar os dados de exemplo? Isso apaga produtos, vendas e leads e volta ao catálogo padrão. Não pode ser desfeito.',
      )
    ) {
      resetData()
    }
  }

  return (
    <section className="mt-6 rounded-2xl border border-red-200 bg-red-50/50 p-5">
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-red-100 text-red-600">
          <TriangleAlert size={20} />
        </span>
        <div>
          <h2 className="font-display font-bold text-ink-950">Zona de risco</h2>
          <p className="text-xs text-ink-700/55">
            Restaura o catálogo de exemplo e apaga vendas e leads. As integrações (API) são
            preservadas.
          </p>
        </div>
      </div>
      <button
        onClick={confirmReset}
        className="mt-4 inline-flex items-center gap-2 rounded-xl border border-red-300 bg-white px-4 py-2 text-sm font-semibold text-red-600 transition-colors hover:bg-red-600 hover:text-white"
      >
        <TriangleAlert size={15} /> Restaurar dados de exemplo
      </button>
    </section>
  )
}

/* ---------- Card + Input reaproveitáveis ---------- */

function Card({
  icon,
  title,
  subtitle,
  children,
}: {
  icon: React.ReactNode
  title: string
  subtitle: string
  children: React.ReactNode
}) {
  return (
    <section className="mt-5 rounded-2xl border border-ink-900/8 bg-white p-5 shadow-soft">
      <div className="mb-4 flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-sand-100 text-ink-800">
          {icon}
        </span>
        <div>
          <h2 className="font-display font-bold text-ink-950">{title}</h2>
          <p className="text-xs text-ink-700/55">{subtitle}</p>
        </div>
      </div>
      {children}
    </section>
  )
}

function Input({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  type?: string
  placeholder?: string
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold text-ink-800">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete="off"
        spellCheck={false}
        className="w-full rounded-xl border border-ink-900/12 bg-white px-3 py-2.5 text-sm text-ink-900 placeholder:text-ink-700/35 focus:border-ink-900/35 focus:outline-none"
      />
    </label>
  )
}
