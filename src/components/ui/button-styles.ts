export type ButtonVariant = 'primary' | 'dark' | 'outline' | 'ghost' | 'whatsapp'
export type ButtonSize = 'sm' | 'md' | 'lg'

const base =
  'inline-flex items-center justify-center gap-2 font-semibold rounded-full transition-all duration-200 ' +
  'focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50 disabled:pointer-events-none ' +
  'active:scale-[0.98] select-none whitespace-nowrap'

const variants: Record<ButtonVariant, string> = {
  primary:
    'bg-lime-400 text-ink-950 hover:bg-lime-500 shadow-[0_8px_24px_-8px_rgba(227,194,92,0.55)] hover:shadow-[0_10px_30px_-8px_rgba(227,194,92,0.65)]',
  dark: 'bg-ink-950 text-white hover:bg-ink-800',
  outline: 'border border-ink-900/15 text-ink-900 bg-white/60 hover:bg-white hover:border-ink-900/30',
  ghost: 'text-ink-900 hover:bg-ink-900/5',
  whatsapp: 'bg-[#25D366] text-white hover:bg-[#1ebe5a] shadow-[0_8px_24px_-8px_rgba(37,211,102,0.6)]',
}

const sizes: Record<ButtonSize, string> = {
  sm: 'text-sm px-4 py-2',
  md: 'text-sm px-5 py-2.5',
  lg: 'text-base px-7 py-3.5',
}

export function buttonClass(
  variant: ButtonVariant = 'primary',
  size: ButtonSize = 'md',
  extra = '',
): string {
  return `${base} ${variants[variant]} ${sizes[size]} ${extra}`
}
