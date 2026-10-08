import { Navigate, useLocation, Link } from 'react-router-dom'
import { ShieldAlert, ArrowLeft } from 'lucide-react'
import { useAuth } from '@/features/auth/model/authContext'
import { Button } from '@/shared/ui/Button'

export function AdminGuard({ children }) {
  const { user, isAuthenticated, isLoading, logout } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="size-8 border-3 border-orange-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-400">Verifying administrative credentials...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />
  }

  // Enforce administrative role verification
  const hasAdminRole = user?.roles?.some((r) => r.name === 'admin' || r.name === 'super_admin')

  if (!hasAdminRole) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4 text-white">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 text-center space-y-4 shadow-2xl">
          <div className="size-14 mx-auto rounded-2xl bg-red-500/15 text-red-400 border border-red-500/30 flex items-center justify-center">
            <ShieldAlert size={28} />
          </div>
          <h2 className="text-xl font-extrabold text-white">Administrative Access Restricted</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            Your account (<span className="font-mono text-slate-200">{user?.phone || user?.name}</span>) is authenticated as a customer but does not possess administrative staff credentials.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
            <Link to="/" className="flex-1">
              <Button variant="secondary" size="sm" className="w-full">
                <ArrowLeft size={15} />
                <span>Return to Store</span>
              </Button>
            </Link>
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                await logout()
                window.location.href = '/admin/login'
              }}
              className="flex-1 border-slate-700 text-slate-300 hover:bg-slate-800"
            >
              Sign In as Admin
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return children
}
