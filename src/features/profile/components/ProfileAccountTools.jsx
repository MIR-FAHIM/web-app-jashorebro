import { Link } from 'react-router-dom'
import { ArrowUpRight, HeartHandshake, Languages, MapPin, Package, Store, Wallet } from 'lucide-react'
import { Card } from '@/shared/ui/Card'
import { useLocale } from '@/shared/i18n/LocaleProvider'
import { UI_FEATURES } from '@/shared/config/features'

const accountTools = [
  { to: '/orders', labelKey: 'profile10.orders', icon: Package },
  { to: '/profile?tab=addresses#account-content', labelKey: 'profile10.addresses', icon: MapPin },
  { to: '/earnings', labelKey: 'profile10.earnings', icon: Wallet },
  { to: '/settings/language', labelKey: 'profile10.language', icon: Languages },
  { to: '/friend-picks', labelKey: 'profile10.friendPicks', icon: HeartHandshake },
  ...(UI_FEATURES.personalStores ? [{ to: '/my-shop', labelKey: 'profile10.myStore', icon: Store }] : []),
]

export function ProfileAccountTools() {
  const { t } = useLocale()
  return (
    <Card className="p-4 sm:p-5">
      <h2 id="profile-account-tools-heading" className="text-base font-semibold text-ink">{t('profile10.accountTools')}</h2>
      <nav aria-labelledby="profile-account-tools-heading" className="mt-3 grid gap-2 sm:grid-cols-2">
        {accountTools.map(({ to, labelKey, icon: Icon }) => (
          <Link key={to} to={to} className="flex min-h-12 items-center gap-3 rounded-xl border border-line px-3 py-3 text-sm font-medium text-ink hover:border-brand/40 hover:bg-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand">
            <Icon size={18} className="shrink-0 text-brand" aria-hidden="true" />
            <span className="min-w-0 flex-1">{t(labelKey)}</span>
            <ArrowUpRight size={16} className="shrink-0 text-muted" aria-hidden="true" />
          </Link>
        ))}
      </nav>
    </Card>
  )
}
