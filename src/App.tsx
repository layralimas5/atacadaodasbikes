import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { StoreProvider } from '@/context/StoreContext'
import { CartProvider } from '@/context/CartContext'
import { StoreLayout } from '@/components/layout/StoreLayout'
import { Home } from '@/pages/Home'
import { Catalog } from '@/pages/Catalog'
import { ProductDetail } from '@/pages/ProductDetail'
import { AdminLayout } from '@/pages/admin/AdminLayout'
import { Dashboard } from '@/pages/admin/Dashboard'
import { ProductsAdmin } from '@/pages/admin/ProductsAdmin'
import { StockAdmin } from '@/pages/admin/StockAdmin'
import { SalesAdmin } from '@/pages/admin/SalesAdmin'
import { CustomersAdmin } from '@/pages/admin/CustomersAdmin'
import { CrmAdmin } from '@/pages/admin/CrmAdmin'
import { BotWhatsApp } from '@/pages/admin/BotWhatsApp'
import { BotSite } from '@/pages/admin/BotSite'
import { ApiAdmin } from '@/pages/admin/ApiAdmin'
import { SettingsAdmin } from '@/pages/admin/SettingsAdmin'

export default function App() {
  return (
    <StoreProvider>
      <CartProvider>
        <BrowserRouter>
          <Routes>
            {/* Loja */}
            <Route element={<StoreLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/catalogo" element={<Catalog />} />
              <Route path="/produto/:id" element={<ProductDetail />} />
            </Route>

            {/* Painel administrativo */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="produtos" element={<ProductsAdmin />} />
              <Route path="estoque" element={<StockAdmin />} />
              <Route path="vendas" element={<SalesAdmin />} />
              <Route path="clientes" element={<CustomersAdmin />} />
              <Route path="crm" element={<CrmAdmin />} />
              <Route path="bot-site" element={<BotSite />} />
              <Route path="bot" element={<BotWhatsApp />} />
              <Route path="api" element={<ApiAdmin />} />
              <Route path="config" element={<SettingsAdmin />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </StoreProvider>
  )
}
