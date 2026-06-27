import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Minus, Plus, Trash2, MessageCircle, ShoppingBag } from 'lucide-react'
import { useCart } from '@/context/CartContext'
import { useStore } from '@/context/StoreContext'
import { SmartImage } from '@/components/ui/SmartImage'
import { buttonClass } from '@/components/ui/button-styles'
import { formatBRL } from '@/lib/format'
import { cartCheckoutLink } from '@/lib/whatsapp'

export function CartDrawer() {
  const { lines, isOpen, close, setQuantity, remove, subtotal, count, clear } = useCart()
  const { storeInfo, recordSale } = useStore()

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close()
    if (isOpen) {
      document.addEventListener('keydown', onKey)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [isOpen, close])

  const checkout = () => {
    // Registra a venda no sistema (canal: site) e abre o WhatsApp pra fechar.
    recordSale(
      lines.map((l) => ({
        productId: l.product.id,
        name: l.product.name,
        unitPrice: l.product.price,
        quantity: l.quantity,
      })),
      { channel: 'site' },
    )
    window.open(cartCheckoutLink(storeInfo, lines, subtotal), '_blank', 'noopener')
    clear()
    close()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
            className="fixed inset-0 z-[60] bg-ink-950/50 backdrop-blur-sm"
            aria-hidden
          />
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3, ease: 'easeOut' }}
            className="fixed inset-y-0 right-0 z-[70] flex w-full max-w-md flex-col bg-white shadow-2xl"
            role="dialog"
            aria-label="Carrinho de compras"
          >
            <header className="flex items-center justify-between border-b border-ink-900/10 px-5 py-4">
              <h2 className="flex items-center gap-2 font-display text-lg font-bold text-ink-950">
                <ShoppingBag size={20} /> Seu carrinho
                {count > 0 && <span className="text-sm font-medium text-ink-700/60">({count})</span>}
              </h2>
              <button
                type="button"
                onClick={close}
                className="grid h-9 w-9 place-items-center rounded-full text-ink-800 hover:bg-ink-900/5"
                aria-label="Fechar carrinho"
              >
                <X size={20} />
              </button>
            </header>

            {lines.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
                <span className="grid h-16 w-16 place-items-center rounded-full bg-sand-100 text-ink-700/40">
                  <ShoppingBag size={28} />
                </span>
                <p className="font-display text-lg font-semibold text-ink-950">Carrinho vazio</p>
                <p className="text-sm text-ink-700/60">Adicione bikes e finalize pelo WhatsApp.</p>
                <button onClick={close} className={buttonClass('dark', 'md', 'mt-2')}>
                  Continuar comprando
                </button>
              </div>
            ) : (
              <>
                <ul className="flex-1 divide-y divide-ink-900/8 overflow-y-auto px-5">
                  {lines.map((l) => (
                    <li key={l.product.id} className="flex gap-3 py-4">
                      <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-sand-100">
                        <SmartImage
                          src={l.product.image}
                          alt={l.product.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="flex flex-1 flex-col">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="text-sm font-semibold text-ink-950">{l.product.name}</h3>
                          <button
                            type="button"
                            onClick={() => remove(l.product.id)}
                            className="text-ink-700/40 hover:text-red-500"
                            aria-label={`Remover ${l.product.name}`}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                        <p className="mt-0.5 text-sm font-bold text-ink-950">
                          {formatBRL(l.product.price)}
                        </p>
                        <div className="mt-auto flex items-center gap-1 pt-2">
                          <button
                            type="button"
                            onClick={() => setQuantity(l.product.id, l.quantity - 1)}
                            className="grid h-8 w-8 place-items-center rounded-lg border border-ink-900/10 hover:bg-ink-900/5"
                            aria-label="Diminuir quantidade"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="w-8 text-center text-sm font-semibold">{l.quantity}</span>
                          <button
                            type="button"
                            onClick={() => setQuantity(l.product.id, l.quantity + 1)}
                            disabled={l.quantity >= l.product.stock}
                            className="grid h-8 w-8 place-items-center rounded-lg border border-ink-900/10 hover:bg-ink-900/5 disabled:opacity-40"
                            aria-label="Aumentar quantidade"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>

                <footer className="border-t border-ink-900/10 px-5 py-5">
                  <div className="mb-4 flex items-center justify-between">
                    <span className="text-sm text-ink-700">Subtotal</span>
                    <span className="font-display text-xl font-bold text-ink-950">
                      {formatBRL(subtotal)}
                    </span>
                  </div>
                  <button onClick={checkout} className={buttonClass('whatsapp', 'lg', 'w-full')}>
                    <MessageCircle size={18} /> Finalizar pelo WhatsApp
                  </button>
                  <p className="mt-2 text-center text-xs text-ink-700/50">
                    {storeInfo.shippingNote}
                  </p>
                </footer>
              </>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
