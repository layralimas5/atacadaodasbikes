import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'
import type { IncomingMessage, ServerResponse } from 'node:http'
import {
  buildSystemPrompt,
  geminiStream,
  geminiLead,
  sanitizeMessages,
  MissingKeyError,
} from './netlify/lib/shared.ts'

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve) => {
    let data = ''
    req.on('data', (c) => (data += c))
    req.on('end', () => resolve(data))
    req.on('error', () => resolve(''))
  })
}

/**
 * Roda o atendente de IA durante o `npm run dev`, sem precisar do Netlify CLI.
 * Atende /.netlify/functions/chat e /lead direto no dev server do Vite.
 * Em produção (Netlify), quem responde são as functions de verdade.
 */
function aiDevServer(env: Record<string, string>): Plugin {
  if (env.GEMINI_API_KEY) process.env.GEMINI_API_KEY = env.GEMINI_API_KEY
  if (env.GEMINI_MODEL) process.env.GEMINI_MODEL = env.GEMINI_MODEL

  return {
    name: 'ai-dev-server',
    configureServer(server) {
      server.middlewares.use(async (req: IncomingMessage, res: ServerResponse, next) => {
        const url = req.url ?? ''
        if (req.method !== 'POST' || !url.startsWith('/.netlify/functions/')) return next()

        const raw = await readBody(req)
        let payload: { messages?: unknown; products?: unknown; store?: unknown } = {}
        try {
          payload = JSON.parse(raw)
        } catch {
          /* corpo vazio/ inválido */
        }
        const messages = sanitizeMessages(payload.messages)

        if (url.startsWith('/.netlify/functions/chat')) {
          res.setHeader('content-type', 'text/plain; charset=utf-8')
          res.setHeader('cache-control', 'no-store')
          try {
            const system = buildSystemPrompt(
              (payload.store ?? {}) as Parameters<typeof buildSystemPrompt>[0],
              (Array.isArray(payload.products) ? payload.products : []) as Parameters<
                typeof buildSystemPrompt
              >[1],
            )
            for await (const chunk of geminiStream(system, messages)) res.write(chunk)
          } catch (err) {
            res.write(
              err instanceof MissingKeyError
                ? 'A IA ainda não está ativa: falta a GEMINI_API_KEY no arquivo .env. 🙏'
                : 'Tive um probleminha técnico agora. Pode repetir? 🙏',
            )
          }
          res.end()
          return
        }

        if (url.startsWith('/.netlify/functions/lead')) {
          res.setHeader('content-type', 'application/json')
          try {
            const lead = await geminiLead(messages)
            res.end(JSON.stringify(lead ?? {}))
          } catch {
            res.end('{}')
          }
          return
        }

        next()
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [react(), aiDevServer(env)],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    server: {
      port: 5173,
      open: false,
    },
  }
})
