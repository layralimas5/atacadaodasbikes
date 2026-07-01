// Extração de lead do site: POST /.netlify/functions/lead
// Recebe { messages } e devolve os dados do cliente em JSON (ou {} se nada útil).
// O widget salva o resultado no CRM (localStorage). Quando houver Supabase,
// é aqui que o lead também seria persistido no banco central.

import { geminiLead, rateLimited, sanitizeMessages } from '../lib/shared'

function clientIp(request: Request): string {
  return (
    request.headers.get('x-nf-client-connection-ip') ||
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    'unknown'
  )
}

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
  })
}

export default async (request: Request): Promise<Response> => {
  if (request.method !== 'POST') return json({ error: 'Método não permitido' }, 405)
  if (rateLimited(clientIp(request), 20)) return json({}, 200)

  let body: { messages?: unknown }
  try {
    body = await request.json()
  } catch {
    return json({}, 200)
  }

  const messages = sanitizeMessages(body.messages)
  if (!messages.length) return json({}, 200)

  try {
    const lead = await geminiLead(messages)
    return json(lead ?? {})
  } catch {
    // Falha na extração não pode quebrar o chat — devolve vazio.
    return json({})
  }
}
