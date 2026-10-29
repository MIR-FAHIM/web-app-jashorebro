import { useId } from 'react'
import { SUPPORTED_LOCALES, useLocale } from '@/shared/i18n/LocaleProvider'
import { cn } from '@/shared/lib/cn'

export function LanguageSwitcher({ compact = false, className }) {
  const { locale, setLocale, t } = useLocale()
  const name = useId()
  if (compact) {
    const next = SUPPORTED_LOCALES.find((item) => item.code !== locale)
    return <button type="button" onClick={() => setLocale(next.code)} aria-label={t('language.switchTo', { language: next.name })} title={t('language.switchTo', { language: next.name })} className={cn('flex size-11 shrink-0 items-center justify-center rounded-xl border border-line bg-surface text-xs font-semibold text-soft hover:border-brand/50 hover:text-brand', className)}><span lang={next.code}>{next.code === 'en' ? 'EN' : next.name}</span></button>
  }
  return <fieldset className={cn('min-w-0 space-y-3', className)}><legend className="text-sm font-semibold text-ink">{t('language.title')}</legend><div className="flex min-w-0 flex-wrap gap-3">{SUPPORTED_LOCALES.map((item) => <label key={item.code} className={cn('flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-sm focus-within:ring-2 focus-within:ring-brand', locale === item.code ? 'border-brand bg-brand-soft text-ink' : 'border-line bg-surface text-soft')}><input type="radio" name={name} value={item.code} checked={locale === item.code} onChange={() => setLocale(item.code)} className="size-4 accent-[var(--color-brand)]" /><span lang={item.code}>{item.name}</span></label>)}</div></fieldset>
}
