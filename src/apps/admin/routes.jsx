import { lazy } from 'react'
import { Navigate, Route } from 'react-router-dom'
import { UI_FEATURES } from '@/shared/config/features'
import { AdminLayout } from './layout/AdminLayout'
import { AdminGuard } from './guards/AdminGuard'

const AdminLoginPage = lazy(() => import('./pages/auth/AdminLoginPage'))
const AdminDashboardPage = lazy(() => import('./pages/dashboard/AdminDashboardPage'))
const AdminPosPage = lazy(() => import('./pages/pos/AdminPosPage'))
const DropManagementPage = lazy(() => import('./pages/drop-management/DropManagementPage'))
const CatalogPage = lazy(() => import('./pages/catalog/CatalogPage'))
const AdminCategoriesPage = lazy(() => import('./pages/categories/AdminCategoriesPage'))
const OrdersPage = lazy(() => import('./pages/orders/OrdersPage'))
const UsersPage = lazy(() => import('./pages/users/UsersPage'))
const SellersPage = lazy(() => import('./pages/sellers/SellersPage'))
const RewardsPage = lazy(() => import('./pages/rewards/RewardsPage'))
const ModerationPage = lazy(() => import('./pages/moderation/ModerationPage'))
const LogsPage = lazy(() => import('./pages/logs/LogsPage'))
const AdminNotificationsPage = lazy(() => import('./pages/notifications/AdminNotificationsPage'))
const AdminShopsPage = lazy(() => import('./pages/community/AdminShopsPage'))
const AdminPayoutsPage = lazy(() => import('./pages/community/AdminPayoutsPage'))
const AdminSettlementReportPage = lazy(() => import('./pages/community/AdminSettlementReportPage'))

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
      <Route path="pos" element={<AdminPosPage />} />
      <Route path="drops" element={<DropManagementPage />} />
      <Route path="catalog" element={<CatalogPage />} />
      <Route path="categories" element={<AdminCategoriesPage />} />
      <Route path="orders" element={<OrdersPage />} />
      <Route path="sellers" element={<SellersPage />} />
      <Route path="users" element={<UsersPage />} />
      <Route path="rewards" element={<RewardsPage />} />
      <Route path="moderation" element={<ModerationPage />} />
      <Route path="logs" element={<LogsPage />} />
      <Route path="notifications" element={<AdminNotificationsPage />} />
      <Route path="community-shops" element={UI_FEATURES.personalStores ? <AdminShopsPage /> : <Navigate to="/admin/catalog" replace />} />
      <Route path="payouts" element={<AdminPayoutsPage />} />
      <Route path="settlement" element={<AdminSettlementReportPage />} />
    </Route>
  </Route>
)
