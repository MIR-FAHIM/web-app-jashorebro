import { useId, useLayoutEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { BookmarkCheck, Check, Copy, ImageOff } from 'lucide-react'
import { Dialog } from '@/shared/ui/Dialog'
import { Button } from '@/shared/ui/Button'
import { useAuth } from '@/features/auth/model/authContext'
import { useLocale } from '@/shared/i18n/LocaleProvider'
import { getProductImageUrl } from '@/shared/lib/mediaUrl'
import { getRecommendationPath } from '@/features/referrals/model/referralAttribution'
import { communityApi } from '../api/communityApi'

const hasPrice = (value) => (typeof value === 'number' || typeof value === 'string') && String(value).trim() !== '' && Number.isFinite(Number(value)) && Number(value) >= 0
const isTrue = (value) => value === true || value === 1 || value === '1'

function SaveToPicksDialog({ isOpen, onClose, product, onSaved }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  const { t, formatMoney } = useLocale()
  const fieldId = useId()
  const [caption, setCaption] = useState('')
  const [isFeatured, setIsFeatured] = useState(false)
  const [isPublic, setIsPublic] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [savedPick, setSavedPick] = useState(null)
  const [copyState, setCopyState] = useState('idle')
  const [failedImage, setFailedImage] = useState(null)
  const submitting = useRef(false)
  const request = useRef(0)
  const latest = useRef(null)
  latest.current = { isOpen, userId: user?.id, productId: product?.id }

  useLayoutEffect(() => () => { request.current += 1 }, [])

  if (!product) return null

  const image = getProductImageUrl(product)
  const alreadyPicked = isTrue(product.current_user?.has_picked)
  const hasVariants = isTrue(product.has_variants)
  const displayedPrice = hasVariants
    ? hasPrice(product.price_from)
      ? hasPrice(product.price_to) && Number(product.price_to) > Number(product.price_from)
        ? t('card.priceRange', { from: formatMoney(product.price_from), to: formatMoney(product.price_to) })
        : t('card.priceFrom', { price: formatMoney(product.price_from) })
      : null
    : hasPrice(product.base_price) ? formatMoney(product.base_price) : null
  const shareCode = savedPick?.recommendation_code
  const shareUrl = shareCode ? `${window.location.origin}${getRecommendationPath(product, shareCode)}` : ''

  const handleSave = async (event) => {
    event.preventDefault()
    if (submitting.current) return
    if (!user) {
      onClose()
      navigate('/auth', { state: { from: location } })
      return
    }
    if (alreadyPicked) {
      onClose()
      navigate('/my-picks')
      return
    }
    const accountId = user.id
    const productId = product.id
    const requestId = ++request.current
    submitting.current = true
    setIsSubmitting(true)
    setError('')
    try {
      const response = await communityApi.picks.save(productId, {
        personal_caption: caption.trim(), caption: caption.trim(),
        is_featured: isPublic && isFeatured, is_public: isPublic,
      })
      const pick = response?.data || response?.pick || response
      if (request.current !== requestId || !latest.current.isOpen || latest.current.userId !== accountId || latest.current.productId !== productId) return
      // Notify consumers only after persistence, and keep late results out of a new dialog.
      setSavedPick({ ...pick, is_public: pick?.is_public == null ? isPublic : isTrue(pick.is_public) })
      onSaved?.(pick)
    } catch (failure) {
      if (request.current === requestId && latest.current.isOpen) setError(failure.message || t('pickSave.error'))
    } finally {
      if (request.current === requestId) {
        submitting.current = false
        setIsSubmitting(false)
      }
    }
  }

  const copyLink = async () => {
    if (!shareUrl) return
    const version = request.current
    const accountId = user?.id
    const productId = product.id
    const isCurrent = () => request.current === version && latest.current.isOpen && latest.current.userId === accountId && latest.current.productId === productId
    try {
      await navigator.clipboard.writeText(shareUrl)
      if (isCurrent()) setCopyState('copied')
    } catch {
      if (isCurrent()) setCopyState('error')
    }
  }

  return (
    <Dialog isOpen={isOpen} onClose={onClose} closeLabel={t('pickSave.close')} title={t(savedPick ? 'pickSave.savedTitle' : 'pickSave.title')} description={t(savedPick ? 'pickSave.savedDescription' : 'pickSave.description')}>
      {savedPick ? (
        <div className="min-w-0 space-y-5">
          <div role="status" className="rounded-xl border border-brand/30 bg-brand-soft p-4 text-sm text-ink">
            <BookmarkCheck size={24} className="mb-2 text-brand" aria-hidden="true" />
            <p className="font-semibold">{product.title}</p>
            <p className="mt-1 text-sm text-soft">{t(savedPick.is_public ? 'pickSave.publicSaved' : 'pickSave.privateSaved')}</p>
          </div>
          {savedPick.is_public && shareUrl && <div className="space-y-2">
            <label htmlFor={`${fieldId}-link`} className="text-sm font-medium text-ink">{t('pickSave.link')}</label>
            <div className="flex min-w-0 flex-wrap gap-2">
              <input id={`${fieldId}-link`} readOnly value={shareUrl} onFocus={(event) => event.target.select()} className="min-h-11 min-w-0 flex-1 rounded-xl border border-line bg-canvas px-3 text-xs text-soft" />
              <Button variant="outline" onClick={copyLink}>{copyState === 'copied' ? <Check size={16} aria-hidden="true" /> : <Copy size={16} aria-hidden="true" />}{t(copyState === 'copied' ? 'pickSave.copied' : 'pickSave.copy')}</Button>
            </div>
            {copyState === 'error' && <p role="status" className="text-sm text-muted">{t('pickSave.copyError')}</p>}
          </div>}
          <div className="flex flex-wrap items-center justify-end gap-2">
            <Button variant="secondary" onClick={onClose}>{t('pickSave.done')}</Button>
            <Link to="/my-picks" onClick={onClose} className="inline-flex min-h-11 items-center justify-center rounded-xl bg-brand px-4 py-2.5 text-sm font-medium text-on-brand">{t('pickSave.manage')}</Link>
          </div>
        </div>
      ) : alreadyPicked && user ? (
        <div className="space-y-4"><p className="text-sm text-soft">{t('pickSave.alreadySaved')}</p><Link to="/my-picks" onClick={onClose} className="inline-flex min-h-11 items-center justify-center rounded-xl bg-brand px-4 text-sm font-medium text-on-brand">{t('pickSave.manage')}</Link></div>
      ) : (
        <form onSubmit={handleSave} className="min-w-0 space-y-5">
          {error && <p role="alert" className="rounded-xl border border-danger/30 bg-danger-soft p-3 text-sm text-danger">{error}</p>}
          <div className="flex min-w-0 items-center gap-3 rounded-xl border border-line p-3">
            {image && failedImage !== image ? <img src={image} alt="" onError={() => setFailedImage(image)} className="size-14 shrink-0 rounded-lg bg-canvas object-contain" /> : <span className="flex size-14 shrink-0 items-center justify-center rounded-lg bg-canvas text-muted" aria-label={t('pickSave.noImage')}><ImageOff size={22} aria-hidden="true" /></span>}
            <div className="min-w-0"><p className="break-words text-sm font-semibold text-ink [overflow-wrap:anywhere]">{product.title}</p><p className="mt-1 text-xs text-muted">{displayedPrice ? t('pickSave.catalogPrice', { price: displayedPrice }) : t('pickSave.priceUnavailable')}</p></div>
          </div>
          <div className="space-y-2">
            <label htmlFor={`${fieldId}-caption`} className="block text-sm font-medium text-ink">{t('pickSave.caption')}</label>
            <textarea id={`${fieldId}-caption`} rows={3} maxLength={1000} value={caption} onChange={(event) => setCaption(event.target.value)} placeholder={t('pickSave.captionPlaceholder')} disabled={isSubmitting} className="w-full rounded-xl border border-line bg-canvas p-3 text-sm text-ink placeholder:text-muted focus:border-brand focus:outline-none" />
          </div>
          <fieldset disabled={isSubmitting} className="space-y-2">
            <legend className="mb-2 text-sm font-medium text-ink">{t('pickSave.visibility')}</legend>
            <div className="grid gap-2 sm:grid-cols-2">{[true, false].map((value) => (
              <label key={String(value)} className={`flex min-h-11 cursor-pointer items-start gap-3 rounded-xl border p-3 ${isPublic === value ? 'border-brand bg-brand-soft' : 'border-line bg-canvas'}`}>
                <input type="radio" name={`${fieldId}-visibility`} checked={isPublic === value} onChange={() => setIsPublic(value)} className="mt-0.5 size-4 shrink-0 accent-[var(--color-brand)]" />
                <span className="min-w-0 text-sm text-ink"><span className="block font-medium">{t(value ? 'pickSave.public' : 'pickSave.private')}</span><span className="mt-1 block text-xs text-muted">{t(value ? 'pickSave.publicDescription' : 'pickSave.privateDescription')}</span></span>
              </label>
            ))}</div>
          </fieldset>
          {isPublic && <label className="flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border border-line p-3 text-sm text-soft"><input type="checkbox" checked={isFeatured} onChange={(event) => setIsFeatured(event.target.checked)} disabled={isSubmitting} className="size-4 shrink-0 accent-[var(--color-brand)]" /><span>{t('pickSave.feature')}</span></label>}
          <div className="flex flex-wrap justify-end gap-2 border-t border-line pt-4"><Button variant="secondary" onClick={onClose}>{t('pickSave.cancel')}</Button><Button type="submit" isLoading={isSubmitting}>{t(isSubmitting ? 'pickSave.saving' : 'pickSave.save')}</Button></div>
        </form>
      )}
    </Dialog>
  )
}

export function SaveToPicksModal(props) {
  const { user } = useAuth()
  // Existing callers keep this component mounted; each opening/account/product gets fresh form state.
  const key = JSON.stringify([props.product?.id ?? null, user?.id ?? null, Boolean(props.isOpen)])
  return <SaveToPicksDialog key={key} {...props} />
}
