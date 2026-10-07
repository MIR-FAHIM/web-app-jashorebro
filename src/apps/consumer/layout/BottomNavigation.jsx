import React from 'react'
import { NavLink } from 'react-router-dom'
import { Home, Compass, BellRing, User } from 'lucide-react'
import { cn } from '@/shared/lib/cn'

const navItems = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/explore', label: 'Explore', icon: Compass },
  { to: '/activity', label: 'Activity', icon: BellRing, badge: true },
  { to: '/profile', label: 'Profile', icon: User },
]

export function BottomNavigation() {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-slate-200/80 px-2 py-1.5 pb-safe">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map(({ to, label, icon: Icon, badge }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center justify-center flex-1 py-1 text-[11px] font-semibold transition-all relative',
                isActive
                  ? 'text-[var(--color-brand)] scale-105'
                  : 'text-slate-500 hover:text-slate-800'
              )
            }
          >
            {({ isActive }) => (
              <>
                <div className="relative">
                  <Icon
                    size={20}
                    className={cn(
                      'transition-transform',
                      isActive ? 'stroke-[2.5]' : 'stroke-[1.8]'
                    )}
                  />
                  {badge && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-red-500" />
                  )}
                </div>
                <span className="mt-1 tracking-tight">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
