import { Link, NavLink } from 'react-router-dom'
import { Home, Compass, BellRing, User, ArrowUpRight, ShoppingBag, ShieldCheck } from 'lucide-react'
import { cn } from '@/shared/lib/cn'

const navItems = [
  { to: '/', label: 'Home feed', icon: Home },
  { to: '/explore', label: 'Explore', icon: Compass },
  { to: '/activity', label: 'Activity', icon: BellRing },
  { to: '/profile', label: 'My picks & profile', icon: User },
  { to: '/cart', label: 'Your cart', icon: ShoppingBag },
]

export function DesktopNavigation() {
  return (
    <aside className="sticky top-16 hidden h-[calc(100dvh-4rem)] w-48 shrink-0 flex-col py-8 md:flex lg:w-56">
      <p className="mb-4 px-3 text-xs font-semibold uppercase tracking-[0.16em] text-muted">Your community</p>
      <nav aria-label="Main navigation" className="flex flex-col gap-1">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) => cn('flex min-h-12 items-center gap-3 rounded-xl px-3 text-sm font-medium transition-colors', isActive ? 'bg-brand-soft text-brand' : 'text-muted hover:bg-surface hover:text-ink')}>
            <Icon size={20} /><span>{label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="mt-6 border-t border-line pt-6">
        <Link to="/explore?tab=products" className="flex min-h-12 items-center justify-between rounded-xl border border-line bg-surface px-3 text-sm font-medium text-ink hover:border-brand/40">Discover a new Drop <ArrowUpRight size={17} className="text-brand" /></Link>
      </div>
      <div className="mt-auto space-y-4 pt-8">
        <div className="rounded-2xl border border-line bg-surface p-4">
          <span className="mb-3 flex size-8 items-center justify-center rounded-lg bg-brand-soft text-brand"><Compass size={17} /></span>
          <p className="text-sm font-semibold text-ink">Good finds. Better together.</p>
          <p className="mt-2 text-xs leading-relaxed text-muted">Discover local picks and help your community unlock better prices.</p>
        </div>
        <Link to="/admin" className="flex min-h-11 items-center gap-2 px-3 text-xs text-muted hover:text-ink"><ShieldCheck size={16} /> Admin preview</Link>
      </div>
    </aside>
  )
}
