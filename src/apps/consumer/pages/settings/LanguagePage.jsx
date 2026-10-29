import { Link } from 'react-router-dom'
import { Card } from '@/shared/ui/Card'
import { LanguageSwitcher } from '@/shared/ui/LanguageSwitcher'
import { useLocale } from '@/shared/i18n/LocaleProvider'

export default function LanguagePage() {
  const { t, storageAvailable } = useLocale()
  return <div className="mx-auto min-w-0 max-w-xl space-y-5"><h1 className="text-2xl font-semibold text-ink">{t('language.heading')}</h1><p className="text-sm leading-relaxed text-muted">{t('language.description')}</p><Card className="min-w-0 space-y-5 p-5"><LanguageSwitcher /><p role="status" className="text-sm text-soft">{t(storageAvailable ? 'language.instant' : 'language.sessionOnly')}</p>{storageAvailable && <p className="text-xs leading-relaxed text-muted">{t('language.deviceNote')}</p>}</Card><Link to="/profile" className="inline-flex min-h-11 items-center text-sm font-semibold text-brand">{t('language.backProfile')}</Link></div>
}
