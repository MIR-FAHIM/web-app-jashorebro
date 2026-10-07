import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Flame,
  ShoppingBag,
  Package,
  Users,
  Store,
  Award,
  ShieldAlert,
  ArrowLeft,
  LogOut,
  Shield,
  Layers,
} from 'lucide-react'
import { cn } from '@/shared/lib/cn'
import { ModalFrame } from '@/shared/ui/ModalFrame'
import { useIsDesktop } from '@/shared/hooks/useMediaQuery'
import { useAuth } from '@/features/auth/model/authContext'
import { Avatar } from '@/shared/ui/Avatar'
import { Badge } from '@/shared/ui/Badge'

const navGroups = [
  {
    title: 'Overview',
    items: [
      { to: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    ],
  },
  {
    title: 'Commerce & Drops',
    items: [
      { to: '/admin/drops', label: 'Drops Engine', icon: Flame },
      { to: '/admin/catalog', label: 'Product Catalog', icon: ShoppingBag },
      { to: '/admin/orders', label: 'Orders & Dispatch', icon: Package },
    ],
  },
  {
    title: 'Ecosystem & Governance',
    items: [
      { to: '/admin/sellers', label: 'Jashore Producers', icon: Store },
      { to: '/admin/users', label: 'Users & Curators', icon: Users },
      { to: '/admin/rewards', label: 'Wallets & Rewards', icon: Award },
      { to: '/admin/moderation', label: 'Review & Flags', icon: ShieldAlert },
    ],
  },
]

function SidebarContent({ onClose }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/admin/login')
  }

  return (
    <div className="flex h-full min-h-0 flex-col bg-slate-900 text-slate-100 border-r border-slate-800">
      {/* Brand Header */}
      <div className="flex h-16 shrink-0 items-center justify-between border-b border-slate-800/80 px-5">
        <div className="flex items-center gap-2.5">
          <span className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-tr from-orange-600 to-red-500 text-white shadow-md shadow-orange-600/30">
            <Flame size={20} className="fill-white" />
          </span>
          <div>
            <p className="font-extrabold text-sm text-white tracking-tight leading-none">
              Jashore<span className="text-orange-500">Bro</span>
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5 font-medium">Control Center</p>
          </div>
        </div>

        <Badge variant="unlocked" size="sm" className="bg-orange-500/20 text-orange-400 border-orange-500/30 text-[10px]">
          Live
        </Badge>
      </div>

      {/* Nav Menu Items */}
      <nav aria-label="Admin navigation" className="flex-1 space-y-6 overflow-y-auto px-3.5 py-5">
        {navGroups.map((group) => (
          <div key={group.title} className="space-y-1">
            <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">
              {group.title}
            </p>
            {group.items.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/admin'}
                onClick={onClose}
                className={({ isActive }) =>
                  cn(
                    'flex min-h-10 items-center gap-3 rounded-xl px-3 text-xs font-semibold transition-all',
                    isActive
                      ? 'bg-orange-500/15 text-orange-400 border border-orange-500/30 shadow-xs'
                      : 'text-slate-400 hover:bg-slate-800/80 hover:text-white'
                  )
                }
              >
                <Icon size={17} />
                <span>{label}</span>
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      {/* Bottom Profile & Actions Footer */}
      <div className="border-t border-slate-800/80 p-3.5 space-y-3 bg-slate-950/40">
        {/* Admin Card */}
        <div className="flex items-center justify-between p-2 rounded-xl bg-slate-800/60 border border-slate-700/60">
          <div className="flex items-center gap-2.5 min-w-0">
            <Avatar name={user?.name || 'Administrator'} size="sm" className="shrink-0 ring-1 ring-slate-600" />
            <div className="min-w-0">
              <p className="text-xs font-bold text-white truncate leading-tight">
                {user?.name || 'Admin Officer'}
              </p>
              <p className="text-[10px] text-slate-400 truncate">
                {user?.phone || 'staff@jashorebro.com'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            title="Log Out of Admin"
            className="size-8 rounded-lg hover:bg-red-500/20 text-slate-400 hover:text-red-400 flex items-center justify-center transition-colors cursor-pointer"
          >
            <LogOut size={15} />
          </button>
        </div>

        {/* Back to Storefront Link */}
        <NavLink
          to="/"
          onClick={onClose}
          className="flex min-h-9 items-center justify-center gap-2 rounded-xl border border-slate-700/60 px-3 text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
        >
          <ArrowLeft size={14} />
          <span>Go to Customer Storefront</span>
        </NavLink>
      </div>
    </div>
  )
}

export function AdminSidebar({ isOpen, onClose }) {
  const isDesktop = useIsDesktop()
  return (
    <>
      <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 md:block">
        <SidebarContent onClose={onClose} />
      </aside>
      <ModalFrame
        isOpen={isOpen && !isDesktop}
        onClose={onClose}
        title="Admin Menu"
        className="fixed inset-y-0 left-0 h-dvh max-h-dvh w-[min(85vw,300px)] rounded-none border-y-0 border-l-0 p-0 bg-slate-900 text-white [&>div:first-child]:px-4 [&>div:first-child]:pt-3 [&>div:first-child]:mb-0 [&>div:first-child]:border-b [&>div:first-child]:border-slate-800"
      >
        <div className="h-[calc(100dvh-4.5rem)]">
          <SidebarContent onClose={onClose} />
        </div>
      </ModalFrame>
    </>
  )
}
