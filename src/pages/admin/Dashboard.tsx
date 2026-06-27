import { Link } from 'react-router-dom'
import { Package, Boxes, Receipt, TrendingUp, AlertTriangle } from 'lucide-react'
import { useStore } from '@/context/StoreContext'
import { formatBRL, formatDate } from '@/lib/format'

export function Dashboard() {
  const { products, sales } = useStore()

  const totalProducts = products.length
  const totalUnits = products.reduce((s, p) => s + p.stock, 0)
  const lowStock = products.filter((p) => p.stock > 0 && p.stock <= 5)
  const outOfStock = products.filter((p) => p.stock <= 0)
  const revenue = sales.reduce((s, sale) => s + sale.total, 0)

  const stats = [
    { label: 'Produtos cadastrados', value: String(totalProducts), icon: Package },
    { label: 'Unidades em estoque', value: String(totalUnits), icon: Boxes },
    { label: 'Vendas registradas', value: String(sales.length), icon: Receipt },
    { label: 'Faturamento total', value: formatBRL(revenue), icon: TrendingUp },
  ]

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-ink-950">Visão geral</h1>
      <p className="mt-1 text-sm text-ink-700/60">Resumo do que está acontecendo na loja.</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(({ label, value, icon: Icon }) => (
          <div key={label} className="rounded-2xl border border-ink-900/8 bg-white p-5 shadow-soft">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wide text-ink-700/50">
                {label}
              </span>
              <Icon size={18} className="text-ink-700/40" />
            </div>
            <p className="mt-3 font-display text-2xl font-bold text-ink-950">{value}</p>
          </div>
        ))}
      </div>

      {(lowStock.length > 0 || outOfStock.length > 0) && (
        <div className="mt-6 rounded-2xl border border-amber-300/50 bg-amber-50 p-5">
          <div className="flex items-center gap-2 text-amber-800">
            <AlertTriangle size={18} />
            <h2 className="font-display font-bold">Atenção ao estoque</h2>
          </div>
          <p className="mt-1 text-sm text-amber-800/80">
            {outOfStock.length > 0 && `${outOfStock.length} produto(s) esgotado(s). `}
            {lowStock.length > 0 && `${lowStock.length} com estoque baixo.`}
          </p>
          <Link
            to="/admin/estoque"
            className="mt-3 inline-block text-sm font-semibold text-amber-900 underline underline-offset-2"
          >
            Repor estoque →
          </Link>
        </div>
      )}

      <div className="mt-6 rounded-2xl border border-ink-900/8 bg-white shadow-soft">
        <div className="flex items-center justify-between border-b border-ink-900/8 px-5 py-4">
          <h2 className="font-display font-bold text-ink-950">Vendas recentes</h2>
          <Link to="/admin/vendas" className="text-sm font-semibold text-lime-600 hover:underline">
            Ver todas
          </Link>
        </div>
        {sales.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-ink-700/50">
            Nenhuma venda registrada ainda. As vendas feitas pelo carrinho do site aparecem aqui.
          </p>
        ) : (
          <ul className="divide-y divide-ink-900/8">
            {sales.slice(0, 5).map((sale) => (
              <li key={sale.id} className="flex items-center justify-between px-5 py-3.5">
                <div>
                  <p className="text-sm font-semibold text-ink-950">
                    {sale.items.length} {sale.items.length === 1 ? 'item' : 'itens'} ·{' '}
                    <span className="capitalize text-ink-700/70">{sale.channel}</span>
                  </p>
                  <p className="text-xs text-ink-700/50">{formatDate(sale.createdAt)}</p>
                </div>
                <span className="font-display font-bold text-ink-950">{formatBRL(sale.total)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
