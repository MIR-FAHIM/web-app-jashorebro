import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Search, ShoppingBag } from 'lucide-react'
import logoBanner from '@/assets/jashorebrobannerlogo.png'
import { useAuth } from '@/features/auth/model/authContext'
import { useCart } from '@/features/cart/model/cartContext'
import { Avatar } from '@/shared/ui/Avatar'
import { NotificationBell } from '@/shared/ui/NotificationBell'
import { resolveImageUrl } from '@/shared/lib/mediaUrl'
import { useLocale } from '@/shared/i18n/LocaleProvider'
import { LanguageSwitcher } from '@/shared/ui/LanguageSwitcher'

export function ConsumerHeader() {
  const { user } = useAuth()
  const { itemCount } = useCart()
  const { t, formatNumber } = useLocale()
  const [query, setQuery] = useState('')
  const navigate = useNavigate()
  const location = useLocation()

  const search = (event) => {
    event.preventDefault()
    navigate(`/?q=${encodeURIComponent(query.trim())}`)
  }

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-canvas/90 backdrop-blur-xl">
      <div className="mx-auto flex h-16 min-w-0 max-w-7xl items-center justify-between gap-2 px-3 sm:gap-4 sm:px-6">
        <Link to="/" className="flex min-w-0 shrink-0 items-center" aria-label={t('shell.home')}>
          <img
            src={logoBanner}
            alt="JashoreBro"
            className="h-8 w-auto max-w-24 object-contain sm:h-9 sm:max-w-36"
          />
        </Link>
        <form onSubmit={search} role="search" className="relative mx-4 hidden w-full max-w-md md:block">
          <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
          <input aria-label={t('shell.searchLabel')} value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t('shell.searchPlaceholder')} className="min-h-11 w-full rounded-xl border border-line bg-surface py-2.5 pl-11 pr-14 text-sm text-ink placeholder:text-muted focus:border-brand focus:outline-none" />
          <button type="submit" aria-label={t('shell.submitSearch')} className="absolute right-1 top-0.5 flex size-10 items-center justify-center rounded-lg text-muted hover:bg-elevated"><Search size={16} /></button>
        </form>
        <div className="flex shrink-0 items-center sm:gap-2">
          <LanguageSwitcher compact />
          <Link to="/explore" aria-label={t('shell.searchLabel')} className="flex size-11 items-center justify-center rounded-xl text-muted hover:bg-elevated hover:text-ink md:hidden"><Search size={20} /></Link>
          <Link to="/cart" aria-label={t('shell.cartLabel', { count: itemCount })} className="relative flex size-11 items-center justify-center rounded-xl text-soft hover:bg-elevated">
            <ShoppingBag size={21} />
            {itemCount > 0 && <span aria-hidden="true" className="absolute right-0.5 top-0.5 flex min-w-4.5 items-center justify-center rounded-full bg-brand px-1 text-[10px] font-bold text-on-brand">{itemCount > 99 ? `${formatNumber(99)}+` : formatNumber(itemCount)}</span>}
          </Link>
          {user && (
            <NotificationBell
              context="customer"
              getAccessibleLabel={(count) => t('shell.notificationsLabel', { count })}
              viewAllUrl="/notifications"
              theme="light"
              className="[&_[role=region]]:max-w-[calc(100vw-1.5rem)]"
            />
          )}
          <Link to={user ? '/profile' : '/auth'} state={user ? undefined : { from: location }} aria-label={t(user ? 'shell.profile' : 'shell.signIn')} className="hidden size-11 items-center justify-center rounded-xl hover:bg-elevated sm:flex"><Avatar name={user?.name || 'Guest'} src={resolveImageUrl(user?.avatar_url || user?.profile?.avatar_url)} size="sm" /></Link>
        </div>
      </div>
    </header>
  )
}

