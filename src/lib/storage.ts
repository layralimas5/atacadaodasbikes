/**
 * Camada de persistência — hoje em localStorage.
 *
 * A UI nunca acessa localStorage direto: fala só com este módulo. Pra migrar
 * pro Supabase, basta reimplementar `read`/`write` (ou trocar por chamadas
 * async à API) sem tocar nos componentes.
 */

const PREFIX = 'adb' // atacadao-das-bikes
// Suba a versão sempre que os dados-semente (seed) mudarem e você quiser que o
// site recarregue os novos defaults (descarta o que estava salvo no navegador).
const VERSION = 'v7'

function key(name: string): string {
  return `${PREFIX}:${VERSION}:${name}`
}

export function read<T>(name: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback
  try {
    const raw = window.localStorage.getItem(key(name))
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

export function write<T>(name: string, value: T): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(key(name), JSON.stringify(value))
  } catch (err) {
    // Em modo privado ou cota cheia o storage pode falhar — não derrubar a UI.
    console.warn('Falha ao salvar no armazenamento local:', err)
  }
}

export function remove(name: string): void {
  if (typeof window === 'undefined') return
  window.localStorage.removeItem(key(name))
}
