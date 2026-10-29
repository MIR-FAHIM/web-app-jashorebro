import { Link, useLocation } from 'react-router-dom'
import { cn } from '@/shared/lib/cn'
import { useFriends } from '@/features/friends/model/friendsContext'
import { useLocale } from '@/shared/i18n/LocaleProvider'
import { CONSUMER_NAV_ITEMS, getConsumerSection } from '../navigation'

export function BottomNavigation() {
  const { incomingCount } = useFriends()
  const { pathname } = useLocation()
  const { t, formatNumber } = useLocale()
  const activeSection = getConsumerSection(pathname)

  return (
    <nav aria-label={t('nav.main')} className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/95 px-2 pt-2 pb-safe backdrop-blur-xl md:hidden">
      <div className="mx-auto flex max-w-md items-center justify-around">
        {CONSUMER_NAV_ITEMS.map(({ section, to, labelKey, icon: Icon }) => {
          const isActive = section === activeSection
          const badge = section === 'friends' ? incomingCount : 0
          return (
            <Link
              key={to}
              to={to}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                'relative flex min-h-12 flex-1 flex-col items-center justify-center gap-1 rounded-xl text-[11px] font-medium transition-colors',
                isActive ? 'text-brand font-semibold' : 'text-muted hover:text-ink'
              )}
            >
              <div className="relative">
                <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
                {badge > 0 && (
                  <span aria-hidden="true" className="absolute -top-1 -right-1.5 flex size-4 items-center justify-center rounded-full bg-brand text-[9px] font-bold text-on-brand">
                    {badge > 9 ? `${formatNumber(9)}+` : formatNumber(badge)}
                  </span>
                )}
              </div>
              <span>{t(labelKey)}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

