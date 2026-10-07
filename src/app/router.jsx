import { Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { consumerRoutes } from '@/apps/consumer/routes'
import { adminRoutes } from '@/apps/admin/routes'
import { EmptyState } from '@/shared/patterns/EmptyState'
import { Compass } from 'lucide-react'

function PageFallback() {
  return (
    <div className="w-full min-h-[50vh] flex flex-col items-center justify-center">
      <div className="w-8 h-8 border-3 border-[var(--color-brand)] border-t-transparent rounded-full animate-spin" />
      <span className="text-xs text-muted font-medium mt-3">Loading JashoreBro...</span>
    </div>
  )
}

function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-elevated">
      <EmptyState
        icon={Compass}
        title="Page Not Found"
        description="The drop or page you are looking for does not exist or has been moved."
        actionLabel="Back to Home Feed"
        onAction={() => (window.location.href = '/')}
      />
    </div>
  )
}

export function AppRouter() {
  return (
    <BrowserRouter>
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
