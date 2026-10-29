import { Suspense } from 'react'
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom'
import { consumerRoutes } from '@/apps/consumer/routes'
import { adminRoutes } from '@/apps/admin/routes'
import { EmptyState } from '@/shared/patterns/EmptyState'
import { Compass } from 'lucide-react'
import { LocaleDocument } from '@/shared/i18n/LocaleDocument'
import { useLocale } from '@/shared/i18n/LocaleProvider'

function PageFallback() {
  const { t } = useLocale()
  const { pathname } = useLocation()
  return (
    <div className="w-full min-h-[50vh] flex flex-col items-center justify-center">
      <div className="w-8 h-8 border-3 border-[var(--color-brand)] border-t-transparent rounded-full animate-spin" />
      <span role="status" className="text-xs text-muted font-medium mt-3">{pathname.startsWith('/admin') ? 'Loading JashoreBro…' : t('common.loading')}</span>
    </div>
  )
}

function NotFoundPage() {
  const { t } = useLocale()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const isAdmin = pathname === '/admin' || pathname.startsWith('/admin/')
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-elevated">
      <EmptyState
        icon={Compass}
        title={isAdmin ? 'This page is unavailable' : t('notFound.heading')}
        description={isAdmin ? 'Return to the admin dashboard.' : t('notFound.description')}
        actionLabel={isAdmin ? 'Admin dashboard' : t('notFound.shop')}
        onAction={() => navigate(isAdmin ? '/admin' : '/')}
      />
    </div>
  )
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <LocaleDocument />
      <Suspense fallback={<PageFallback />}>
        <Routes>
          {/* Consumer Experience */}
          {consumerRoutes}

          {/* Admin & Seller Console */}
          {adminRoutes}

          {/* 404 Catch-All */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
