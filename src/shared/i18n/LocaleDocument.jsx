import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useLocale } from './LocaleProvider'

export function LocaleDocument() {
  const { locale, t } = useLocale()
  const { pathname } = useLocation()
  useEffect(() => {
    const path = pathname.toLowerCase()
    const admin = path === '/admin' || path.startsWith('/admin/')
    document.documentElement.lang = admin ? 'en' : locale
    document.documentElement.dir = 'ltr'
    document.title = admin ? 'JashoreBro — Admin' : t('brand.title')
  }, [locale, pathname, t])
  return null
}
