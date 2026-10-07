import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Flame, ShoppingBag, Package, Users, Store, Award, ShieldAlert, ArrowLeft } from 'lucide-react'
import { cn } from '@/shared/lib/cn'
import { ModalFrame } from '@/shared/ui/ModalFrame'
import { useIsDesktop } from '@/shared/hooks/useMediaQuery'

const adminNavItems = [
  { to: '/admin', label: 'Overview', icon: LayoutDashboard },
  { to: '/admin/drops', label: 'Drops', icon: Flame },
  { to: '/admin/catalog', label: 'Product catalog', icon: ShoppingBag },
  { to: '/admin/orders', label: 'Orders', icon: Package },
  { to: '/admin/users', label: 'People & curators', icon: Users },
  { to: '/admin/sellers', label: 'Sellers', icon: Store },
  { to: '/admin/rewards', label: 'Rewards', icon: Award },
  { to: '/admin/moderation', label: 'Moderation', icon: ShieldAlert },
]

function SidebarContent({ onClose }) {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex h-16 shrink-0 items-center gap-3 border-b border-line px-5">
        <span className="flex size-9 items-center justify-center rounded-xl bg-brand text-on-brand"><Flame size={22} /></span>
        <div><p className="font-bold text-ink">JashoreBro</p><p className="text-xs text-muted">Admin workspace</p></div>
      </div>
      <p className="px-6 pt-7 pb-3 text-xs font-semibold uppercase tracking-[0.15em] text-muted">Manage</p>
      <nav aria-label="Admin navigation" className="flex-1 space-y-1 overflow-y-auto px-3">
        {adminNavItems.map(({ to, label, icon: Icon }) => <NavLink key={to} to={to} end={to === '/admin'} onClick={onClose} className={({ isActive }) => cn('flex min-h-12 items-center gap-3 rounded-xl px-3.5 text-sm font-medium transition-colors', isActive ? 'bg-brand-soft text-brand' : 'text-muted hover:bg-elevated hover:text-ink')}><Icon size={19} /><span>{label}</span></NavLink>)}
      </nav>
      <div className="border-t border-line p-4 pb-safe"><NavLink to="/" onClick={onClose} className="flex min-h-11 items-center gap-2 rounded-xl px-3 text-sm text-muted hover:bg-elevated hover:text-ink"><ArrowLeft size={18} /> Back to storefront</NavLink></div>
    </div>
  )
}

export function AdminSidebar({ isOpen, onClose }) {
  const isDesktop = useIsDesktop()
  return (
    <>
      <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 border-r border-line bg-surface md:block"><SidebarContent onClose={onClose} /></aside>
      <ModalFrame isOpen={isOpen && !isDesktop} onClose={onClose} title="Navigation" className="fixed inset-y-0 left-0 h-dvh max-h-dvh w-[min(85vw,320px)] rounded-none border-y-0 border-l-0 p-0 [&>div:first-child]:px-4 [&>div:first-child]:pt-3 [&>div:first-child]:mb-0">
        <div className="h-[calc(100dvh-4.5rem)]"><SidebarContent onClose={onClose} /></div>
      </ModalFrame>
    </>
  )
}
