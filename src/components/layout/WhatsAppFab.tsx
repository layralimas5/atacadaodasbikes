import { motion } from 'framer-motion'
import { MessageCircle } from 'lucide-react'
import { useStore } from '@/context/StoreContext'
import { whatsappHref } from '@/lib/whatsapp'

export function WhatsAppFab() {
  const { storeInfo } = useStore()
  const link = whatsappHref(storeInfo, 'Olá! Vim pelo site do Atacadão das Bikes.')

  return (
    <motion.a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 0.8, type: 'spring', stiffness: 260, damping: 20 }}
      whileHover={{ scale: 1.06 }}
      whileTap={{ scale: 0.95 }}
      className="fixed bottom-5 right-5 z-50 grid h-14 w-14 place-items-center rounded-full bg-[#25D366] text-white shadow-[0_8px_30px_-6px_rgba(37,211,102,0.7)]"
      aria-label="Falar no WhatsApp"
    >
      <span className="absolute inset-0 animate-ping rounded-full bg-[#25D366] opacity-30" aria-hidden />
      <MessageCircle size={26} className="relative" />
    </motion.a>
  )
}
