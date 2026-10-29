import { Link, useLocation } from 'react-router-dom'
import { cn } from '@/shared/lib/cn'
import { useFriends } from '@/features/friends/model/friendsContext'
import { useLocale } from '@/shared/i18n/LocaleProvider'
import { CONSUMER_NAV_ITEMS, getConsumerSection } from '../navigation'

export function DesktopNavigation() {
  const { pathname } = useLocation()
  const { incomingCount } = useFriends()
  const { t, formatNumber } = useLocale()
  const activeSection = getConsumerSection(pathname)

  return (
    <aside className="sticky top-16 hidden h-[calc(100dvh-4rem)] w-48 shrink-0 flex-col overflow-y-auto py-8 md:flex lg:w-56">
      <nav aria-label={t('nav.main')} className="flex flex-col gap-1">
        {CONSUMER_NAV_ITEMS.map(({ section, to, labelKey, icon: Icon }) => {
          const isActive = section === activeSection
          return (
            <Link key={to} to={to} aria-current={isActive ? 'page' : undefined} className={cn('flex min-h-12 items-center gap-3 rounded-xl px-3 text-sm font-medium transition-colors', isActive ? 'bg-brand-soft text-brand' : 'text-muted hover:bg-surface hover:text-ink')}>
              <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
              <span>{t(labelKey)}</span>
              {section === 'friends' && incomingCount > 0 && (
                <span aria-hidden="true" className="ml-auto flex min-w-5 items-center justify-center rounded-full bg-brand px-1 text-[10px] font-bold text-on-brand">
                  {incomingCount > 9 ? `${formatNumber(9)}+` : formatNumber(incomingCount)}
                </span>
              )}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
