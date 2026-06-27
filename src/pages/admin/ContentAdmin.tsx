import { useState, type ReactNode } from 'react'
import { Check, RotateCcw } from 'lucide-react'
import { useStore } from '@/context/StoreContext'
import { buttonClass } from '@/components/ui/button-styles'
import { write } from '@/lib/storage'
import { STORE_INFO } from '@/data/seed'
import type { StoreInfo } from '@/lib/types'

const fieldCls =
  'mt-1.5 w-full rounded-xl border border-ink-900/12 bg-white px-3.5 py-2.5 text-sm text-ink-950 focus:border-ink-900/35 focus:outline-none'
const labelCls = 'text-xs font-semibold uppercase tracking-wide text-ink-700/60'

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-ink-900/8 bg-white p-5 shadow-soft">
      <h2 className="mb-4 font-display font-bold text-ink-950">{title}</h2>
      <div className="space-y-4">{children}</div>
    </section>
  )
}

export function ContentAdmin() {
  const { storeInfo, updateStoreInfo, resetData } = useStore()
  const [form, setForm] = useState<StoreInfo>({ ...storeInfo })
  const [saved, setSaved] = useState(false)
  const [newPassword, setNewPassword] = useState('')

  const set = <K extends keyof StoreInfo>(key: K, value: StoreInfo[K]) =>
    setForm((f) => ({ ...f, [key]: value }))

  const text = (key: keyof StoreInfo, labelText: string, placeholder?: string) => (
    <div>
      <label className={labelCls} htmlFor={`f-${key}`}>
        {labelText}
      </label>
      <input
        id={`f-${key}`}
        value={String(form[key] ?? '')}
        onChange={(e) => set(key, e.target.value as StoreInfo[typeof key])}
        placeholder={placeholder}
        className={fieldCls}
      />
    </div>
  )

  const save = () => {
    updateStoreInfo(form)
    if (newPassword.trim()) {
      write('adminPassword', newPassword.trim())
      setNewPassword('')
    }
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div className="max-w-3xl">
      <h1 className="font-display text-2xl font-bold text-ink-950">Conteúdo do site</h1>
      <p className="mt-1 text-sm text-ink-700/60">
        Edite os textos, contato e a chamada principal. As alterações aparecem no site na hora.
      </p>

      <div className="mt-6 space-y-5">
        <Group title="Identidade">
          {text('name', 'Nome da loja')}
          {text('tagline', 'Slogan')}
        </Group>

        <Group title="Banner principal (hero)">
          {text('heroTitle', 'Título')}
          <div>
            <label className={labelCls} htmlFor="f-heroSubtitle">
              Subtítulo
            </label>
            <textarea
              id="f-heroSubtitle"
              rows={3}
              value={form.heroSubtitle}
              onChange={(e) => set('heroSubtitle', e.target.value)}
              className={`${fieldCls} resize-none`}
            />
          </div>
          {text('heroImage', 'URL da imagem do banner', '/img/hero.jpg')}
          {text('heroVideo', 'Vídeo do banner (opcional)', '/video/hero.mp4')}
          <p className="text-xs text-ink-700/50">
            Se preencher o vídeo, ele toca no banner por cima da imagem (a imagem vira o poster
            enquanto carrega). Coloque o arquivo em <code>public/video/</code> e use o caminho
            <code> /video/seu-arquivo.mp4</code>.
          </p>
        </Group>

        <Group title="Contato">
          {text('whatsappUrl', 'Link direto do WhatsApp (prioritário)', 'https://api.whatsapp.com/message/...')}
          <div className="grid gap-4 sm:grid-cols-2">
            {text('whatsapp', 'WhatsApp por número (só dígitos, com DDI)', '5527999999999')}
            {text('whatsappLabel', 'WhatsApp (exibição)', '(27) 99999-9999')}
            {text('phone', 'Telefone')}
            {text('email', 'E-mail')}
            {text('instagram', 'Instagram (sem @)')}
            {text('city', 'Cidade')}
          </div>
          <p className="text-xs text-ink-700/50">
            Dica: se o link direto estiver preenchido, ele é usado em todos os botões. Deixe em
            branco para usar o número.
          </p>
          {text('address', 'Endereço')}
          {text('hours', 'Horário de funcionamento')}
          {text('shippingNote', 'Aviso de entrega')}
          <label className="flex items-center gap-2 text-sm text-ink-800">
            <input
              type="checkbox"
              checked={form.contactConfirmed}
              onChange={(e) => set('contactConfirmed', e.target.checked)}
              className="h-4 w-4 accent-lime-500"
            />
            Dados de contato confirmados (remove o aviso amarelo do site)
          </label>
        </Group>

        <Group title="Segurança">
          <div>
            <label className={labelCls} htmlFor="f-pass">
              Nova senha do painel (deixe em branco para manter)
            </label>
            <input
              id="f-pass"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              className={fieldCls}
            />
          </div>
        </Group>

        <div className="flex flex-wrap items-center gap-3">
          <button onClick={save} className={buttonClass('primary', 'lg')}>
            {saved ? (
              <>
                <Check size={18} /> Salvo!
              </>
            ) : (
              'Salvar alterações'
            )}
          </button>
          <button
            onClick={() => {
              if (
                window.confirm(
                  'Restaurar todos os dados de exemplo? Isso apaga produtos, vendas e textos editados.',
                )
              ) {
                resetData()
                setForm({ ...STORE_INFO })
              }
            }}
            className={buttonClass('ghost', 'md', 'text-ink-700')}
          >
            <RotateCcw size={16} /> Restaurar dados de exemplo
          </button>
        </div>
      </div>
    </div>
  )
}
