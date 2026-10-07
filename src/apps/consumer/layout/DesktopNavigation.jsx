import React from 'react'
import { NavLink } from 'react-router-dom'
import { Home, Compass, BellRing, User, PlusCircle } from 'lucide-react'
import { cn } from '@/shared/lib/cn'
import { Button } from '@/shared/ui/Button'

const navItems = [
  { to: '/', label: 'Home Feed', icon: Home },
  { to: '/explore', label: 'Explore Drops', icon: Compass },
  { to: '/activity', label: 'Activity & Updates', icon: BellRing },
  { to: '/profile', label: 'My Picks & Profile', icon: User },
]

export function DesktopNavigation() {
  return (
    <aside className="hidden md:flex flex-col w-56 lg:w-64 shrink-0 py-6 pr-6 sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto">
      <div className="flex flex-col gap-1.5 flex-1">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all',
                isActive
                  ? 'bg-orange-50 text-[var(--color-brand)] font-bold'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  size={19}
                  className={cn(
                    'transition-colors',
                    isActive ? 'text-[var(--color-brand)] stroke-[2.5]' : 'text-slate-400'
                  )}
                />
                <span>{label}</span>
              </>
            )}
          </NavLink>
        ))}

        <div className="pt-6 mt-6 border-t border-slate-200/80">
          <Button
            variant="drop-fire"
            size="md"
            className="w-full flex items-center justify-center gap-2 shadow-sm"
            onClick={() => alert('Start a Drop campaign modal')}
          >
            <PlusCircle size={17} />
            <span>Start a Drop</span>
          </Button>
        </div>
      </div>

      {/* Community Card teaser */}
      <div className="p-3.5 bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl text-xs mt-auto">
        <p className="font-bold text-white mb-1">Jashore Community</p>
        <p className="text-slate-300 text-[11px] leading-relaxed">
          Shop together, save together. Follow local curators and discover drops.
        </p>
      </div>
    </aside>
  )
}
