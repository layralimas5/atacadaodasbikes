import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Send, X, Headset } from 'lucide-react'
import { useStore } from '@/context/StoreContext'
import { whatsappHref } from '@/lib/whatsapp'
import { streamChat, extractLead, type ChatTurn } from '@/lib/chatClient'

const SUGGESTIONS = [
  'Quero uma bike pra cidade',
  'Qual é a mais barata?',
  'Tem modelo de banco duplo?',
]

export function ChatWidget() {
  const { products, storeInfo, upsertLead, chatEnabled, botConfig } = useStore()
  const greeting =
    botConfig.greeting.trim() ||
    'Oi! Sou o atendente do Atacadão das Bikes. Me conta o que você procura que eu te ajudo a achar a bike elétrica ideal, e fico com você até o final.'
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<ChatTurn[]>([])
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)

  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const abortRef = useRef<AbortController | null>(null)
  const sessionId = useRef<string>(crypto.randomUUID())
  const messagesRef = useRef<ChatTurn[]>([])
  const capturedRef = useRef(false)

  const waLink = whatsappHref(storeInfo, 'Olá! Vim pelo atendimento do site.')

  useEffect(() => {
    if (open) inputRef.current?.focus()
  }, [open])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, busy, open])

  // Mantém a referência atual das mensagens para capturar o lead ao sair.
  useEffect(() => {
    messagesRef.current = messages
    capturedRef.current = false // houve mudança → vale recapturar
  }, [messages])

  /**
   * Ao encerrar a conversa (fechar o chat ou sair da página):
   * 1) salva SEMPRE a conversa no sistema (transcript) — sem custo de IA;
   * 2) extrai os dados do cliente (nome/número/pedido) UMA vez — 1 requisição.
   * Salvar 1x por conversa preserva o limite do plano gratuito.
   */
  const captureConversation = async (convo: ChatTurn[]) => {
    const real = convo.filter((m) => m.text.trim())
    if (!real.length) return

    // 1) Conversa sempre registrada (de graça).
    upsertLead({
      id: sessionId.current,
      channel: 'site',
      transcript: real.map((t) => ({ role: t.role, text: t.text })),
    })

    // 2) Enriquecimento com IA (nome, número, pedido...) — só uma vez.
    if (real.length >= 2 && !capturedRef.current) {
      capturedRef.current = true
      const draft = await extractLead(real)
      if (draft) {
        upsertLead({
          id: sessionId.current,
          name: draft.name || undefined,
          contact: draft.contact || undefined,
          interest: draft.interest || undefined,
          budget: draft.budget || undefined,
          city: draft.city || undefined,
          summary: draft.summary || undefined,
          channel: 'site',
        })
      }
    }
  }

  /** Fecha o chat e registra a conversa (1 requisição por conversa). */
  const handleClose = () => {
    setOpen(false)
    void captureConversation(messagesRef.current)
  }

  // Ao desmontar (sair da página), encerra o stream e registra a conversa.
  const captureRef = useRef(captureConversation)
  captureRef.current = captureConversation
  useEffect(
    () => () => {
      abortRef.current?.abort()
      void captureRef.current(messagesRef.current)
    },
    [],
  )

  const send = async (text: string) => {
    const trimmed = text.trim()
    if (!trimmed || busy) return

    const history: ChatTurn[] = [...messages, { role: 'user', text: trimmed }]
    setMessages([...history, { role: 'model', text: '' }])
    setInput('')
    setBusy(true)

    const controller = new AbortController()
    abortRef.current = controller

    try {
      let acc = ''
      for await (const chunk of streamChat(history, products, storeInfo, botConfig, controller.signal)) {
        acc += chunk
        setMessages((prev) => {
          const copy = [...prev]
          copy[copy.length - 1] = { role: 'model', text: acc }
          return copy
        })
      }
      if (!acc) throw new Error('resposta vazia')
    } catch (err) {
      if (!(err instanceof DOMException && err.name === 'AbortError')) {
        setMessages((prev) => {
          const copy = [...prev]
          copy[copy.length - 1] = {
            role: 'model',
            text: 'Não consegui responder agora. Fala com a gente no WhatsApp que resolvemos rapidinho!',
          }
          return copy
        })
      }
    } finally {
      setBusy(false)
      abortRef.current = null
    }
  }

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    void send(input)
  }

  // Atendimento desligado no painel → não mostra o widget no site.
  if (!chatEnabled) return null

  return (
    <>
      {/* Painel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
            role="dialog"
            aria-label="Atendimento do Atacadão das Bikes"
            className="fixed inset-x-3 bottom-3 z-[60] flex max-h-[80svh] flex-col overflow-hidden rounded-card border border-ink-900/10 bg-white shadow-lift sm:inset-x-auto sm:right-5 sm:bottom-24 sm:w-[380px]"
          >
            {/* Cabeçalho */}
            <header className="flex items-center gap-3 bg-ink-950 px-4 py-3 text-white">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-lime-400 text-ink-950">
                <Headset size={19} strokeWidth={2.2} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold leading-tight">Atendimento</p>
                <p className="flex items-center gap-1 text-[11px] text-white/55">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-400" /> online agora
                </p>
              </div>
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-white/20"
              >
                WhatsApp
              </a>
              <button
                onClick={handleClose}
                className="grid h-8 w-8 place-items-center rounded-full text-white/70 hover:bg-white/10 hover:text-white"
                aria-label="Fechar atendimento"
              >
                <X size={18} />
              </button>
            </header>

            {/* Mensagens */}
            <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto bg-sand-50 p-4">
              <Bubble role="model" text={greeting} />
              {messages.map((m, i) => (
                <Bubble
                  key={i}
                  role={m.role}
                  text={m.text}
                  typing={busy && m.role === 'model' && i === messages.length - 1 && !m.text}
                />
              ))}

              {messages.length === 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => void send(s)}
                      className="rounded-full border border-ink-900/12 bg-white px-3 py-1.5 text-xs font-medium text-ink-700 transition-colors hover:border-ink-900/30 hover:text-ink-950"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Entrada */}
            <form onSubmit={onSubmit} className="flex items-center gap-2 border-t border-ink-900/8 bg-white p-3">
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Escreva sua mensagem..."
                aria-label="Mensagem"
                className="min-w-0 flex-1 rounded-full border border-ink-900/12 bg-sand-50 px-4 py-2.5 text-sm text-ink-950 placeholder:text-ink-700/40 focus:border-ink-900/30 focus:outline-none"
              />
              <button
                type="submit"
                disabled={!input.trim() || busy}
                className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-ink-950 text-lime-400 transition-all hover:bg-ink-800 disabled:opacity-40"
                aria-label="Enviar mensagem"
              >
                <Send size={17} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Launcher */}
      <AnimatePresence mode="wait" initial={false}>
        {open ? (
          <motion.button
            key="close"
            onClick={handleClose}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.95 }}
            className="fixed bottom-5 right-5 z-50 grid h-14 w-14 place-items-center rounded-full bg-ink-950 text-white shadow-lift"
            aria-label="Fechar atendimento"
          >
            <X size={24} />
          </motion.button>
        ) : (
          <motion.button
            key="open"
            onClick={() => setOpen(true)}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ delay: 0.4, type: 'spring', stiffness: 260, damping: 20 }}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            className="group fixed bottom-5 right-5 z-50 flex items-center gap-2.5 rounded-full bg-ink-950 py-2 pl-2 pr-4 text-white shadow-lift"
            aria-label="Abrir atendimento online"
            aria-expanded={false}
          >
            <span className="relative grid h-10 w-10 shrink-0 place-items-center rounded-full bg-lime-400 text-ink-950">
              <span className="absolute inset-0 animate-ping rounded-full bg-lime-400 opacity-30" aria-hidden />
              <Headset size={21} strokeWidth={2.2} className="relative" />
              <span className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full border-2 border-ink-950 bg-green-400" aria-hidden />
            </span>
            <span className="text-left leading-tight">
              <span className="block text-sm font-bold">Atendimento</span>
              <span className="block text-[11px] font-medium text-lime-300">online · fale com a gente</span>
            </span>
          </motion.button>
        )}
      </AnimatePresence>
    </>
  )
}

function Bubble({ role, text, typing }: { role: 'user' | 'model'; text: string; typing?: boolean }) {
  const isUser = role === 'user'
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[82%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
          isUser
            ? 'rounded-br-md bg-ink-950 text-white'
            : 'rounded-bl-md border border-ink-900/8 bg-white text-ink-800'
        }`}
      >
        {typing ? <TypingDots /> : text}
      </div>
    </div>
  )
}

function TypingDots() {
  return (
    <span className="inline-flex gap-1 py-1" aria-label="digitando">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="h-1.5 w-1.5 rounded-full bg-ink-700/40"
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
        />
      ))}
    </span>
  )
}
