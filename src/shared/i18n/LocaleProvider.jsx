import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import en from './locales/en'
import bn from './locales/bn'

export const LOCALE_STORAGE_KEY = 'jb_locale_v1'
export const DEFAULT_LOCALE = 'en'
export const SUPPORTED_LOCALES = [{ code: 'bn', name: 'বাংলা' }, { code: 'en', name: 'English' }]
const resources = { bn, en }
const LocaleContext = createContext(null)
const validLocale = (value) => Object.hasOwn(resources, value)

function readLocale() {
  try {
    const value = localStorage.getItem(LOCALE_STORAGE_KEY)
    if (validLocale(value)) return value
  } catch { /* Keep the current choice in memory if browser storage is unavailable. */ }
  return DEFAULT_LOCALE
}

export function LocaleProvider({ children }) {
  const [locale, updateLocale] = useState(readLocale)
  const [storageAvailable, setStorageAvailable] = useState(() => {
    try { localStorage.getItem(LOCALE_STORAGE_KEY); return true } catch { return false }
  })
  const setLocale = useCallback((next) => {
    if (!validLocale(next)) return
    updateLocale(next)
    try { localStorage.setItem(LOCALE_STORAGE_KEY, next); setStorageAvailable(true) } catch { setStorageAvailable(false) }
  }, [])
  useEffect(() => {
    const sync = (event) => {
      if (event.key === LOCALE_STORAGE_KEY || event.key === null) updateLocale(readLocale())
    }
    window.addEventListener('storage', sync)
    return () => window.removeEventListener('storage', sync)
  }, [])
  const value = useMemo(() => {
    const intlLocale = locale === 'bn' ? 'bn-BD' : 'en-BD'
    const formatNumber = (number, options = {}) => number == null || !Number.isFinite(Number(number)) ? '—' : new Intl.NumberFormat(intlLocale, options).format(Number(number))
    const pluralRules = new Intl.PluralRules(intlLocale)
    const t = (key, values = {}) => {
      const pluralKey = typeof values.count === 'number' ? `${key}_${pluralRules.select(values.count)}` : key
      const message = resources[locale][pluralKey] ?? resources[locale][key] ?? en[pluralKey] ?? en[key] ?? key
      return message.replace(/\{(\w+)\}/g, (match, name) => {
        const item = values[name]
        return item == null ? match : typeof item === 'number' ? formatNumber(item) : String(item)
      })
    }
    const formatMoney = (amount) => formatNumber(amount, { style: 'currency', currency: 'BDT', currencyDisplay: 'narrowSymbol', minimumFractionDigits: 0, maximumFractionDigits: 2 })
    const formatDate = (date, options = {}) => {
      if (!date) return ''
      const parsed = new Date(date)
      if (!Number.isFinite(parsed.getTime())) return ''
      return new Intl.DateTimeFormat(intlLocale, { timeZone: 'Asia/Dhaka', day: 'numeric', month: 'short', year: 'numeric', ...options }).format(parsed)
    }
    return { locale, setLocale, t, formatNumber, formatMoney, formatDate, storageAvailable }
  }, [locale, setLocale, storageAvailable])
  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
}

export function useLocale() {
  const value = useContext(LocaleContext)
  if (!value) throw new Error('useLocale must be used within LocaleProvider')
  return value
}
