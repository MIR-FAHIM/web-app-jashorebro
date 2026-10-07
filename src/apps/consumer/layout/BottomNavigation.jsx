import { NavLink } from 'react-router-dom'
import { Home, Compass, BellRing, User } from 'lucide-react'
import { cn } from '@/shared/lib/cn'

const navItems = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/explore', label: 'Explore', icon: Compass },
  { to: '/activity', label: 'Activity', icon: BellRing },
  { to: '/profile', label: 'Profile', icon: User },
]

export function BottomNavigation() {
  return (
    <nav aria-label="Main navigation" className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/95 px-3 pt-2 pb-safe backdrop-blur-xl md:hidden">
      <div className="mx-auto flex max-w-md items-center justify-around">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) => cn('flex min-h-12 flex-1 flex-col items-center justify-center gap-1 rounded-xl text-xs font-medium transition-colors', isActive ? 'text-brand' : 'text-muted hover:text-ink')}>
            {({ isActive }) => <><Icon size={21} strokeWidth={isActive ? 2.5 : 1.8} /><span>{label}</span></>}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
