import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Bike, Lock, ArrowLeft } from 'lucide-react'
import { buttonClass } from '@/components/ui/button-styles'
import { useStore } from '@/context/StoreContext'

export function Login() {
  const { login } = useStore()
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!login(password)) {
      setError(true)
      setPassword('')
    }
  }

  return (
    <div className="grid min-h-svh place-items-center bg-ink-950 px-5 text-white">
      <div
        aria-hidden
        className="pointer-events-none absolute right-0 top-0 h-[30rem] w-[30rem] rounded-full bg-lime-500/15 blur-[120px]"
      />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative w-full max-w-sm"
      >
        <div className="mb-8 flex flex-col items-center text-center">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-lime-400 text-ink-950">
            <Bike size={26} strokeWidth={2.2} />
          </span>
          <h1 className="mt-4 font-display text-2xl font-bold">Painel administrativo</h1>
          <p className="mt-1 text-sm text-white/50">Atacadão das Bikes Camburi</p>
        </div>

        <form
          onSubmit={onSubmit}
          className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur"
        >
          <label htmlFor="password" className="text-sm font-medium text-white/80">
            Senha de acesso
          </label>
          <div className="relative mt-2">
            <Lock
              size={17}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40"
            />
            <input
              id="password"
              type="password"
              autoFocus
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                setError(false)
              }}
              placeholder="••••••••"
              className={`w-full rounded-xl border bg-ink-900/60 py-3 pl-11 pr-4 text-white placeholder:text-white/30 focus:outline-none ${
                error ? 'border-red-500' : 'border-white/10 focus:border-lime-400/50'
              }`}
              aria-invalid={error}
            />
          </div>
          {error && (
            <p className="mt-2 text-sm text-red-400" role="alert">
              Senha incorreta. Tente novamente.
            </p>
          )}

          <button type="submit" className={buttonClass('primary', 'lg', 'mt-5 w-full')}>
            Entrar
          </button>

          <p className="mt-4 text-center text-xs text-white/40">
            Protótipo — senha padrão: <code className="text-white/70">atacadao123</code>
          </p>
        </form>

        <Link
          to="/"
          className="mt-6 flex items-center justify-center gap-1.5 text-sm text-white/50 hover:text-white"
        >
          <ArrowLeft size={15} /> Voltar para a loja
        </Link>
      </motion.div>
    </div>
  )
}
