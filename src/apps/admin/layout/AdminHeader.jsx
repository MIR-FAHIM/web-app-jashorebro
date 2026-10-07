import { Menu, ArrowUpRight, LogOut, CheckCircle2 } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Avatar } from '@/shared/ui/Avatar'
import { useAuth } from '@/features/auth/model/authContext'

const sectionTitles = {
  '/admin': 'Dashboard Overview',
  '/admin/drops': 'Drops Engine',
  '/admin/catalog': 'Product Catalog',
  '/admin/orders': 'Orders & Dispatch',
  '/admin/sellers': 'Jashore Producers',
  '/admin/users': 'Users & Curators',
  '/admin/rewards': 'Wallets & Rewards',
  '/admin/moderation': 'Review & Flags',
}

export function AdminHeader({ onOpenSidebar }) {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const currentTitle = sectionTitles[location.pathname] || 'Workspace'

  const handleLogout = async () => {
    await logout()
    navigate('/admin/login')
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between gap-3 border-b border-slate-800 bg-slate-900/90 px-4 backdrop-blur-xl md:px-6">
      {/* Left: Mobile Toggle & Page Title */}
      <div className="flex min-w-0 items-center gap-3">
        <button
          onClick={onOpenSidebar}
          className="flex size-10 shrink-0 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white md:hidden"
          aria-label="Open navigation"
        >
          <Menu size={20} />
        </button>

        <div className="flex items-center gap-2.5 truncate">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 hidden sm:inline">
            Admin
          </span>
          <span className="text-slate-600 hidden sm:inline">/</span>
          <h1 className="text-sm font-bold text-white truncate">
            {currentTitle}
          </h1>
        </div>

        {/* Live System Indicator */}
        <div className="hidden lg:flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-medium text-emerald-400">
          <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>Hub Online</span>
        </div>
      </div>

      {/* Right: Quick actions & Admin Profile */}
      <div className="flex shrink-0 items-center gap-2.5 sm:gap-4">
        {/* View Storefront */}
        <Link
          to="/"
          target="_blank"
          rel="noreferrer"
          className="flex min-h-9 items-center gap-1.5 rounded-xl border border-slate-700/60 bg-slate-800/80 px-3 text-xs font-medium text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
          title="Open customer storefront in new tab"
        >
          <span className="hidden sm:inline">Storefront</span>
          <ArrowUpRight size={15} />
        </Link>

        {/* User profile capsule */}
        <div className="flex items-center gap-2.5 border-l border-slate-800 pl-2.5 sm:pl-4">
          <Avatar name={user?.name || 'Admin'} size="sm" className="ring-1 ring-slate-700" />
          <div className="hidden text-left xl:block">
            <p className="text-xs font-semibold text-white leading-tight">
              {user?.name || 'Administrator'}
            </p>
            <p className="text-[10px] text-slate-400">
              {user?.phone || 'admin@jashorebro.com'}
            </p>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            title="Log Out"
            className="flex size-8 items-center justify-center rounded-lg text-slate-400 hover:bg-red-500/15 hover:text-red-400 transition-colors"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </header>
  )
}
