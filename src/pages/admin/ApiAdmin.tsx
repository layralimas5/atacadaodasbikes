import { useState } from 'react'
import {
  KeyRound,
  Bot,
  MessageCircle,
  Eye,
  EyeOff,
  Copy,
  Check,
  Save,
  ShieldAlert,
  ExternalLink,
} from 'lucide-react'
import { useStore } from '@/context/StoreContext'
import type { ApiIntegrations } from '@/lib/types'

/** Considera uma integração "conectada" quando os campos obrigatórios têm valor. */
function isConnected(keys: (string | undefined)[]): boolean {
  return keys.every((k) => (k ?? '').trim().length > 0)
}

export function ApiAdmin() {
  const { integrations, updateIntegrations } = useStore()
  const [form, setForm] = useState<ApiIntegrations>(integrations)
  const [saved, setSaved] = useState(false)

  const set = (key: keyof ApiIntegrations, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    setSaved(false)
  }

  const save = () => {
    updateIntegrations(form)
    setSaved(true)
    window.setTimeout(() => setSaved(false), 2500)
  }

  const dirty = JSON.stringify(form) !== JSON.stringify(integrations)

  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex items-center gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-2xl bg-ink-950 text-lime-400">
          <KeyRound size={22} />
        </span>
        <div>
          <h1 className="font-display text-2xl font-bold leading-tight text-ink-950">
            API & Integrações
          </h1>
          <p className="text-sm text-ink-700/60">
            Central das APIs do sistema — IA do bot e WhatsApp.
          </p>
        </div>
      </div>

      {/* Aviso de segurança */}
      <div className="mt-5 flex gap-3 rounded-2xl border border-amber-300/50 bg-amber-50 p-4">
        <ShieldAlert size={20} className="mt-0.5 shrink-0 text-amber-600" />
        <div className="text-sm text-amber-900">
          <p className="font-semibold">As chaves valem para todo o sistema.</p>
          <p className="mt-0.5 text-amber-800/80">
            Por segurança, as chaves secretas de <strong>produção</strong> também devem ser
            cadastradas nas variáveis de ambiente da Netlify (nunca ficam expostas no navegador).
            Aqui você organiza e confere cada integração. Use o botão de copiar o nome da variável.
          </p>
        </div>
      </div>

      {/* IA — Gemini */}
      <IntegrationCard
        icon={<Bot size={20} />}
        title="IA do Bot — Google Gemini"
        subtitle="O cérebro que responde clientes no site e no WhatsApp."
        connected={isConnected([form.geminiApiKey])}
        docsUrl="https://aistudio.google.com/app/apikey"
      >
        <Field
          label="Chave da API (GEMINI_API_KEY)"
          envVar="GEMINI_API_KEY"
          value={form.geminiApiKey}
          onChange={(v) => set('geminiApiKey', v)}
          secret
          placeholder="AIza..."
        />
        <Field
          label="Modelo (GEMINI_MODEL)"
          envVar="GEMINI_MODEL"
          value={form.geminiModel}
          onChange={(v) => set('geminiModel', v)}
          placeholder="gemini-2.5-flash"
        />
      </IntegrationCard>

      {/* WhatsApp — Cloud API */}
      <IntegrationCard
        icon={<MessageCircle size={20} />}
        title="WhatsApp — Meta Cloud API"
        subtitle="Conecta o número oficial do WhatsApp ao bot."
        connected={isConnected([
          form.whatsappToken,
          form.whatsappPhoneNumberId,
          form.whatsappVerifyToken,
        ])}
        docsUrl="https://developers.facebook.com/docs/whatsapp/cloud-api/get-started"
      >
        <Field
          label="Access Token (WHATSAPP_TOKEN)"
          envVar="WHATSAPP_TOKEN"
          value={form.whatsappToken}
          onChange={(v) => set('whatsappToken', v)}
          secret
          placeholder="EAAG..."
        />
        <Field
          label="ID do número (WHATSAPP_PHONE_NUMBER_ID)"
          envVar="WHATSAPP_PHONE_NUMBER_ID"
          value={form.whatsappPhoneNumberId}
          onChange={(v) => set('whatsappPhoneNumberId', v)}
          placeholder="1029384756..."
        />
        <Field
          label="Token de verificação do webhook (WHATSAPP_VERIFY_TOKEN)"
          envVar="WHATSAPP_VERIFY_TOKEN"
          value={form.whatsappVerifyToken}
          onChange={(v) => set('whatsappVerifyToken', v)}
          secret
          placeholder="um-token-que-voce-inventa"
        />
      </IntegrationCard>

      {/* Barra de salvar fixa */}
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
          <Save size={16} /> Salvar alterações
        </button>
      </div>
    </div>
  )
}

/* ---------- Card de integração ---------- */

function IntegrationCard({
  icon,
  title,
  subtitle,
  connected,
  docsUrl,
  children,
}: {
  icon: React.ReactNode
  title: string
  subtitle: string
  connected: boolean
  docsUrl: string
  children: React.ReactNode
}) {
  return (
    <section className="mt-5 rounded-2xl border border-ink-900/8 bg-white p-5 shadow-soft">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-sand-100 text-ink-800">
            {icon}
          </span>
          <div>
            <h2 className="font-display font-bold text-ink-950">{title}</h2>
            <p className="text-xs text-ink-700/55">{subtitle}</p>
          </div>
        </div>
        <span
          className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
            connected ? 'bg-green-100 text-green-700' : 'bg-ink-900/8 text-ink-700/55'
          }`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${connected ? 'bg-green-500' : 'bg-ink-700/40'}`} />
          {connected ? 'Conectado' : 'Pendente'}
        </span>
      </div>

      <div className="mt-4 space-y-3">{children}</div>

      <a
        href={docsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-ink-700/60 hover:text-ink-950"
      >
        <ExternalLink size={13} /> Como obter as credenciais
      </a>
    </section>
  )
}

/* ---------- Campo com cópia do nome da variável e máscara ---------- */

function Field({
  label,
  envVar,
  value,
  onChange,
  secret = false,
  placeholder,
}: {
  label: string
  envVar: string
  value: string
  onChange: (value: string) => void
  secret?: boolean
  placeholder?: string
}) {
  const [show, setShow] = useState(false)
  const [copied, setCopied] = useState(false)

  const copyEnv = async () => {
    try {
      await navigator.clipboard.writeText(envVar)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1500)
    } catch {
      /* clipboard pode falhar sem HTTPS — ignora silenciosamente */
    }
  }

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <label className="text-xs font-semibold text-ink-800">{label}</label>
        <button
          type="button"
          onClick={copyEnv}
          className="inline-flex items-center gap-1 rounded-md bg-sand-100 px-2 py-0.5 text-[11px] font-medium text-ink-700/70 transition-colors hover:bg-sand-200"
          aria-label={`Copiar nome da variável ${envVar}`}
        >
          {copied ? <Check size={11} className="text-green-600" /> : <Copy size={11} />}
          {copied ? 'copiado' : 'copiar nome'}
        </button>
      </div>
      <div className="flex items-center gap-2 rounded-xl border border-ink-900/12 bg-white px-3 focus-within:border-ink-900/35">
        <input
          type={secret && !show ? 'password' : 'text'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete="off"
          spellCheck={false}
          className="w-full bg-transparent py-2.5 text-sm text-ink-900 placeholder:text-ink-700/35 focus:outline-none"
        />
        {secret && (
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            className="shrink-0 text-ink-700/40 hover:text-ink-700"
            aria-label={show ? 'Ocultar valor' : 'Mostrar valor'}
          >
            {show ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>
    </div>
  )
}
