import { Link, Outlet, useLocation } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import logoBanner from '@/assets/jashorebrobannerlogo.png'
import { useLocale } from '@/shared/i18n/LocaleProvider'
import { LanguageSwitcher } from '@/shared/ui/LanguageSwitcher'

export function FocusedLayout() {
  const { pathname, state } = useLocation()
  const { t } = useLocale()
  const returnLocation = state?.from
  const backTo = pathname === '/checkout'
    ? '/cart'
    : returnLocation?.pathname?.startsWith('/') && !returnLocation.pathname.startsWith('//')
      ? { pathname: returnLocation.pathname, search: returnLocation.search || '', hash: returnLocation.hash || '' }
      : '/'
  return (
    <div className="flex min-h-dvh flex-col bg-canvas text-ink">
      <header className="sticky top-0 z-40 border-b border-line bg-canvas/95 backdrop-blur-xl">
        <div className="mx-auto flex h-16 min-w-0 max-w-5xl items-center justify-between gap-2 px-4">
          <Link to={backTo} className="flex min-h-11 shrink-0 items-center gap-2 rounded-xl px-2 text-sm text-muted hover:bg-elevated hover:text-ink"><ArrowLeft size={20} /><span>{t('common.back')}</span></Link>
          <Link to="/" className="flex min-w-0 items-center" aria-label={t('shell.home')}>
            <img src={logoBanner} alt="JashoreBro" className="h-7 max-w-28 object-contain" />
          </Link>
          <div className="flex shrink-0 items-center gap-2">
            <span className="hidden text-xs text-muted sm:inline">{t(pathname === '/checkout' ? 'focused.checkout' : 'focused.account')}</span>
            <LanguageSwitcher compact />
          </div>
        </div>
      </header>
      <main className="mx-auto min-w-0 w-full max-w-5xl flex-1 px-4 py-6 pb-safe sm:py-8"><Outlet /></main>
    </div>
  )
}
