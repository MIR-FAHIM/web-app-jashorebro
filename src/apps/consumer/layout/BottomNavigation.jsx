import { NavLink } from 'react-router-dom'
import { Home, Compass, Users, BellRing, User } from 'lucide-react'
import { cn } from '@/shared/lib/cn'
import { useFriends } from '@/features/friends/model/friendsContext'

export function BottomNavigation() {
  const { incomingCount } = useFriends()

  const navItems = [
    { to: '/', label: 'Home', icon: Home },
    { to: '/explore', label: 'Explore', icon: Compass },
    { to: '/friends', label: 'Friends', icon: Users, badge: incomingCount },
    { to: '/activity', label: 'Activity', icon: BellRing },
    { to: '/profile', label: 'Profile', icon: User },
  ]

  return (
    <nav aria-label="Main navigation" className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/95 px-2 pt-2 pb-safe backdrop-blur-xl md:hidden">
      <div className="mx-auto flex max-w-md items-center justify-around">
        {navItems.map(({ to, label, icon: Icon, badge }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              cn(
                'relative flex min-h-12 flex-1 flex-col items-center justify-center gap-1 rounded-xl text-[11px] font-medium transition-colors',
                isActive ? 'text-brand font-semibold' : 'text-muted hover:text-ink'
              )
            }
          >
            {({ isActive }) => (
              <>
                <div className="relative">
                  <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
                  {badge > 0 && (
                    <span className="absolute -top-1 -right-1.5 flex size-4 items-center justify-center rounded-full bg-brand text-[9px] font-bold text-on-brand animate-pulse">
                      {badge > 9 ? '9+' : badge}
                    </span>
                  )}
                </div>
                <span>{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}

