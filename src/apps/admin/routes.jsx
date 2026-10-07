import { lazy } from 'react'
import { Route } from 'react-router-dom'
import { AdminLayout } from './layout/AdminLayout'
import { AdminGuard } from './guards/AdminGuard'

const AdminLoginPage = lazy(() => import('./pages/auth/AdminLoginPage'))
const AdminDashboardPage = lazy(() => import('./pages/dashboard/AdminDashboardPage'))
const DropManagementPage = lazy(() => import('./pages/drop-management/DropManagementPage'))
const CatalogPage = lazy(() => import('./pages/catalog/CatalogPage'))
const OrdersPage = lazy(() => import('./pages/orders/OrdersPage'))
const UsersPage = lazy(() => import('./pages/users/UsersPage'))
const SellersPage = lazy(() => import('./pages/sellers/SellersPage'))
const RewardsPage = lazy(() => import('./pages/rewards/RewardsPage'))
const ModerationPage = lazy(() => import('./pages/moderation/ModerationPage'))

export const adminRoutes = (
  <Route path="/admin">
    <Route path="login" element={<AdminLoginPage />} />
    <Route
      element={
        <AdminGuard>
          <AdminLayout />
        </AdminGuard>
      }
    >
      <Route index element={<AdminDashboardPage />} />
      <Route path="drops" element={<DropManagementPage />} />
      <Route path="catalog" element={<CatalogPage />} />
      <Route path="orders" element={<OrdersPage />} />
      <Route path="sellers" element={<SellersPage />} />
      <Route path="users" element={<UsersPage />} />
      <Route path="rewards" element={<RewardsPage />} />
      <Route path="moderation" element={<ModerationPage />} />
    </Route>
  </Route>
)
