import { useEffect, useState } from 'react'
import {
  MessagesSquare,
  Hand,
  Sparkles,
  BookOpen,
  Power,
  Save,
  Check,
  RotateCcw,
  Lightbulb,
} from 'lucide-react'
import { useStore } from '@/context/StoreContext'
import type { BotConfig } from '@/lib/types'

/**
 * Configuração do atendente de IA do site. O lojista ajusta tom, escreve
 * orientações e corrige o que o bot sabe — sem mexer no código. O conteúdo é
 * somado ao "cérebro" base e tem prioridade sobre ele.
 */
export function BotSite() {
  const { botConfig, updateBotConfig, resetBotConfig, chatEnabled, setChatEnabled } = useStore()

  const [form, setForm] = useState<BotConfig>(botConfig)
  const [saved, setSaved] = useState(false)

  // Reflete no formulário qualquer mudança vinda do contexto (salvar/restaurar).
  useEffect(() => setForm(botConfig), [botConfig])

  const set = (key: keyof BotConfig, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    setSaved(false)
  }

  const dirty = JSON.stringify(form) !== JSON.stringify(botConfig)

  const save = () => {
    updateBotConfig(form)
    setSaved(true)
    window.setTimeout(() => setSaved(false), 2500)
  }

  const restore = () => {
    if (
      window.confirm(
        'Restaurar a configuração padrão do bot? Suas orientações e correções serão apagadas.',
      )
    ) {
      resetBotConfig()
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex items-center gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-2xl bg-ink-950 text-lime-400">
          <MessagesSquare size={22} />
        </span>
        <div>
          <h1 className="font-display text-2xl font-bold leading-tight text-ink-950">
            Bot do site
          </h1>
          <p className="text-sm text-ink-700/60">
            Oriente o atendente, ajuste o tom e corrija respostas — sem programar.
          </p>
        </div>
      </div>

      {/* Status do atendimento */}
      <Card
        icon={<Power size={20} />}
        title="Atendimento no site"
        subtitle="Liga ou pausa o chat do site. Pausado, o widget não aparece para o cliente."
      >
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
                {chatEnabled ? 'Atendimento ativo' : 'Atendimento pausado'}
              </span>
              <span className="block text-xs text-ink-700/55">
                {chatEnabled
                  ? 'O chat aparece no site e responde os clientes.'
                  : 'O chat está oculto no site.'}
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

      {/* Saudação inicial */}
      <Card
        icon={<Hand size={20} />}
        title="Saudação inicial"
        subtitle="Primeira mensagem que o cliente vê ao abrir o chat."
      >
        <Textarea
          value={form.greeting}
          onChange={(v) => set('greeting', v)}
          rows={3}
          placeholder="Oi! Sou o atendente do Atacadão das Bikes..."
        />
      </Card>

      {/* Orientações de tom e conduta */}
      <Card
        icon={<Sparkles size={20} />}
        title="Orientações de atendimento"
        subtitle="Como o bot deve conversar. Têm prioridade sobre o comportamento padrão."
      >
        <Textarea
          value={form.instructions}
          onChange={(v) => set('instructions', v)}
          rows={7}
          placeholder={
            'Ex.: Seja mais breve e direto.\n' +
            'Trate o cliente por você, com simpatia, sem formalidade.\n' +
            'Nunca prometa desconto sem o lojista confirmar.\n' +
            'Sempre pergunte para que a pessoa vai usar a bike antes de indicar.'
          }
        />
        <Tip text="Escreva como se estivesse treinando um vendedor novo. Uma orientação por linha funciona melhor." />
      </Card>

      {/* Informações e correções */}
      <Card
        icon={<BookOpen size={20} />}
        title="Informações e correções"
        subtitle="Fatos que o bot deve tratar como verdade. Use para corrigir respostas erradas."
      >
        <Textarea
          value={form.knowledge}
          onChange={(v) => set('knowledge', v)}
          rows={7}
          placeholder={
            'Ex.: Fazemos entrega em toda a Grande Vitória.\n' +
            'A garantia das bikes é de 1 ano para o motor e a bateria.\n' +
            'Não trabalhamos com bikes a gasolina, só elétricas.\n' +
            'O modelo X50 está sem previsão de reposição.'
          }
        />
        <Tip text="Sempre que o bot errar uma informação, registre aqui a versão correta e salve." />
      </Card>

      {/* Barra de salvar */}
      <div className="sticky bottom-4 mt-6 flex items-center justify-between gap-3 rounded-2xl border border-ink-900/8 bg-white/90 p-3 shadow-soft backdrop-blur">
        <button
          onClick={restore}
          className="inline-flex items-center gap-2 rounded-xl border border-ink-900/12 px-4 py-2.5 text-sm font-semibold text-ink-700 transition-colors hover:border-ink-900/30"
        >
          <RotateCcw size={15} /> Restaurar padrão
        </button>
        <div className="flex items-center gap-3">
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
            <Save size={16} /> Salvar configuração
          </button>
        </div>
      </div>
    </div>
  )
}

/* ---------- UI reaproveitável ---------- */

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

function Textarea({
  value,
  onChange,
  rows = 5,
  placeholder,
}: {
  value: string
  onChange: (value: string) => void
  rows?: number
  placeholder?: string
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      rows={rows}
      placeholder={placeholder}
      spellCheck
      className="w-full resize-y rounded-xl border border-ink-900/12 bg-white px-3.5 py-3 text-sm leading-relaxed text-ink-900 placeholder:text-ink-700/35 focus:border-ink-900/35 focus:outline-none"
    />
  )
}

function Tip({ text }: { text: string }) {
  return (
    <p className="mt-2.5 flex items-start gap-2 text-xs text-ink-700/55">
      <Lightbulb size={14} className="mt-0.5 shrink-0 text-amber-500" />
      {text}
    </p>
  )
}
