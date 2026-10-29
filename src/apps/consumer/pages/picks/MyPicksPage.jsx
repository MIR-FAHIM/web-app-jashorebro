import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Bookmark, Check, Copy, ImageOff, Loader2, Pencil, Plus, Trash2 } from 'lucide-react'
import { Card } from '@/shared/ui/Card'
import { Button } from '@/shared/ui/Button'
import { Dialog } from '@/shared/ui/Dialog'
import { communityApi } from '@/features/community/api/communityApi'
import { useAuth } from '@/features/auth/model/authContext'
import { useLocale } from '@/shared/i18n/LocaleProvider'
import { getProductImageUrl } from '@/shared/lib/mediaUrl'
import { getRecommendationPath } from '@/features/referrals/model/referralAttribution'

const isTrue = (value) => value === true || value === 1 || value === '1'
const validPrice = (value) => (typeof value === 'number' || typeof value === 'string') && String(value).trim() !== '' && Number.isFinite(Number(value)) && Number(value) >= 0

function PickPhoto({ product }) {
  const { t } = useLocale()
  const image = getProductImageUrl(product)
  const [failed, setFailed] = useState(null)
  return image && failed !== image
    ? <img src={image} alt="" loading="lazy" onError={() => setFailed(image)} className="size-20 shrink-0 rounded-xl border border-line bg-elevated object-contain sm:size-24" />
    : <span aria-label={t('picks.noPhoto')} className="flex size-20 shrink-0 items-center justify-center rounded-xl border border-line bg-elevated text-muted sm:size-24"><ImageOff aria-hidden="true" size={23} /></span>
}

function PickEditor({ pick, busy, error, onClose, onSave }) {
  const { t } = useLocale()
  const id = useId()
  const [caption, setCaption] = useState(pick.caption ?? pick.personal_caption ?? '')
  const [isPublic, setIsPublic] = useState(isTrue(pick.is_public))
  const [featured, setFeatured] = useState(isTrue(pick.is_featured))
  return <Dialog isOpen onClose={onClose} closeLabel={t('picks.close')} title={t('picks.editTitle')} description={pick.product?.title || t('picks.unavailableProduct')}>
    <form className="space-y-5" onSubmit={(event) => { event.preventDefault(); onSave({ caption: caption.trim(), is_public: isPublic, is_featured: isPublic && featured }) }}>
      {error && <p role="alert" className="rounded-xl border border-danger/30 p-3 text-sm text-danger">{t(error)}</p>}
      <div className="space-y-2"><label htmlFor={`${id}-caption`} className="block text-sm font-medium text-ink">{t('picks.caption')}</label><textarea id={`${id}-caption`} maxLength={1000} rows={4} value={caption} onChange={(event) => setCaption(event.target.value)} disabled={busy} className="w-full rounded-xl border border-field-border bg-canvas p-3 text-sm text-ink" /></div>
      <fieldset disabled={busy} className="space-y-2"><legend className="mb-2 text-sm font-medium text-ink">{t('picks.visibility')}</legend>{[true, false].map((value) => <label key={String(value)} className={`flex min-h-11 cursor-pointer items-start gap-3 rounded-xl border p-3 ${isPublic === value ? 'border-brand bg-brand/5' : 'border-line'}`}><input type="radio" name={`${id}-visibility`} checked={isPublic === value} onChange={() => setIsPublic(value)} className="mt-1 size-4 shrink-0" /><span className="text-sm text-ink"><span className="font-semibold">{t(value ? 'picks.public' : 'picks.private')}</span><span className="mt-1 block text-xs text-muted">{t(value ? 'picks.publicDescription' : 'picks.privateDescription')}</span></span></label>)}</fieldset>
      {isPublic && <label className="flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border border-line p-3 text-sm text-soft"><input type="checkbox" checked={featured} onChange={(event) => setFeatured(event.target.checked)} disabled={busy} className="size-4 shrink-0" />{t('picks.feature')}</label>}
      <p className="text-xs text-muted">{t('picks.priceFixed')}</p>
      <div className="flex flex-wrap justify-end gap-2"><Button variant="secondary" onClick={onClose} disabled={busy}>{t('picks.cancel')}</Button><Button type="submit" isLoading={busy}>{t(busy ? 'picks.saving' : 'picks.saveChanges')}</Button></div>
    </form>
  </Dialog>
}

export default function MyPicksPage() {
  const { isAuthenticated, isLoading: authLoading, user } = useAuth()
  const { t, formatMoney } = useLocale()
  const location = useLocation()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const rawPage = Number(params.get('page'))
  const page = Number.isSafeInteger(rawPage) && rawPage > 0 ? rawPage : 1
  const key = JSON.stringify([user?.id, page])
  const [results, setResults] = useState({ key: null, picks: [], meta: null })
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [editing, setEditing] = useState(null)
  const [removing, setRemoving] = useState(null)
  const [sharing, setSharing] = useState(null)
  const [actionError, setActionError] = useState('')
  const [notice, setNotice] = useState('')
  const [busy, setBusy] = useState(false)
  const [copied, setCopied] = useState(false)
  const [copyError, setCopyError] = useState(false)
  const fetchVersion = useRef(0)
  const mutationVersion = useRef(0)
  const mutationBusy = useRef(false)
  const currentUser = useRef(user?.id)
  currentUser.current = user?.id
  const currentKey = useRef(key)
  currentKey.current = key
  const currentShare = useRef(sharing?.id)
  currentShare.current = sharing?.id
  const heading = useRef(null)
  const focusAfterLoad = useRef(false)
  const linkId = useId()
  const picks = results.key === key ? results.picks : []
  const meta = results.key === key ? results.meta : null
  const lastPage = Math.max(1, Number(meta?.last_page || 1))
  const isLoading = loading || results.key !== key
  const shareUrl = sharing?._context === key && sharing?.product && sharing.recommendation_code && isTrue(sharing.is_public) ? window.location.origin + getRecommendationPath(sharing.product, sharing.recommendation_code) : ''

  const fetchPicks = useCallback(async () => {
    if (!user?.id) return
    const version = ++fetchVersion.current
    setLoading(true)
    setLoadError(false)
    try {
      const data = await communityApi.picks.getMyPicks({ page, per_page: 12 })
      if (version !== fetchVersion.current) return
      const items = data.picks || data.data
      if (!Array.isArray(items)) throw new Error('Invalid Picks response')
      setResults({ key, picks: items, meta: data.meta || { current_page: 1, last_page: 1, total: items.length } })
    } catch {
      if (version === fetchVersion.current) { setLoadError(true); setResults((previous) => previous.key === key ? previous : { key, picks: [], meta: null }) }
    } finally { if (version === fetchVersion.current) setLoading(false) }
  }, [user?.id, page, key])

  useEffect(() => {
    setEditing(null); setSharing(null); setRemoving(null); setActionError(''); setNotice('')
    mutationVersion.current += 1
    mutationBusy.current = false
    setBusy(false)
    if (!authLoading && isAuthenticated) fetchPicks()
    return () => { fetchVersion.current += 1; mutationVersion.current += 1 }
  }, [authLoading, isAuthenticated, fetchPicks])
  useEffect(() => {
    if (!isLoading && focusAfterLoad.current) {
      focusAfterLoad.current = false
      heading.current?.focus({ preventScroll: true })
      heading.current?.scrollIntoView({ block: 'start' })
    }
  }, [isLoading])

  const changePage = (nextPage) => {
    const next = new URLSearchParams(params)
    if (nextPage <= 1) next.delete('page'); else next.set('page', String(nextPage))
    focusAfterLoad.current = true
    navigate({ pathname: location.pathname, search: next.toString(), hash: location.hash }, { preventScrollReset: true })
  }
  const mutate = async (pick, changes) => {
    if (mutationBusy.current || isLoading || pick?._context !== key) return
    fetchVersion.current += 1
    const version = ++mutationVersion.current
    const account = user.id
    const context = key
    mutationBusy.current = true
    setBusy(true); setActionError(''); setNotice('')
    try {
      if (changes) {
        const updated = await communityApi.picks.update(pick.id, changes)
        if (version !== mutationVersion.current || currentUser.current !== account || currentKey.current !== context) return
        setResults((previous) => ({ ...previous, picks: previous.picks.map((item) => item.id === pick.id ? { ...item, ...updated, product: Object.hasOwn(updated, 'product') ? updated.product : item.product } : item) }))
        setEditing(null)
        setNotice('picks.updated')
      } else {
        await communityApi.picks.remove(pick.id)
        if (version !== mutationVersion.current || currentUser.current !== account || currentKey.current !== context) return
        setRemoving(null)
        setNotice('picks.removed')
        if (picks.length === 1 && page > 1) changePage(page - 1)
        else await fetchPicks()
      }
    } catch {
      if (version === mutationVersion.current) setActionError(changes ? 'picks.updateError' : 'picks.removeError')
    } finally {
      if (version === mutationVersion.current) { mutationBusy.current = false; setBusy(false) }
    }
  }
  const copy = async () => {
    const context = key
    const pickId = sharing?.id
    setCopyError(false)
    try {
      await navigator.clipboard.writeText(shareUrl)
      if (currentKey.current === context && currentShare.current === pickId) setCopied(true)
    } catch { if (currentKey.current === context && currentShare.current === pickId) setCopyError(true) }
  }
  const priceLabel = (product) => {
    const from = isTrue(product.has_variants) ? product.price_from : product.base_price ?? product.price_from
    if (!validPrice(from)) return t('picks.priceUnavailable')
    if (isTrue(product.has_variants) && validPrice(product.price_to) && Number(product.price_to) > Number(from)) return t('picks.priceRange', { from: formatMoney(from), to: formatMoney(product.price_to) })
    return isTrue(product.has_variants) ? t('picks.priceFrom', { price: formatMoney(from) }) : formatMoney(from)
  }

  if (authLoading) return <p role="status" className="p-8 text-sm text-muted">{t('picks.loadingAccount')}</p>
  if (!isAuthenticated) return <Card className="mx-auto max-w-md space-y-4 p-6 text-center"><Bookmark aria-hidden="true" className="mx-auto text-brand" size={32} /><h1 className="text-xl font-bold text-ink">{t('picks.heading')}</h1><p className="text-sm text-muted">{t('picks.signInDescription')}</p><Link to="/auth" state={{ from: location }} className="inline-flex min-h-11 items-center justify-center rounded-xl bg-brand px-4 text-sm font-semibold text-on-brand">{t('picks.signIn')}</Link></Card>

  return <div className="mx-auto max-w-5xl space-y-5">
    <div className="flex flex-wrap items-start justify-between gap-3"><div><Link to="/profile" className="mb-2 inline-flex min-h-11 items-center gap-1 text-sm text-muted"><ArrowLeft aria-hidden="true" size={15} />{t('picks.profile')}</Link><h1 ref={heading} tabIndex={-1} className="scroll-mt-24 text-2xl font-bold text-ink outline-none">{t('picks.heading')}</h1><p className="mt-1 max-w-xl text-sm text-muted">{t('picks.description')}</p></div><Link to="/" className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-on-brand"><Plus aria-hidden="true" size={17} />{t('picks.addProducts')}</Link></div>
    <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted"><p>{meta ? t('picks.count', { count: Number(meta.total || 0) }) : t('picks.loading')}</p>{user.username && <Link to={`/users/${encodeURIComponent(user.username)}`} className="inline-flex min-h-11 items-center font-semibold text-brand">{t('picks.publicProfile')}</Link>}</div>
    <details className="rounded-xl border border-line bg-surface px-4"><summary className="min-h-11 cursor-pointer py-3 text-sm font-semibold text-ink">{t('picks.rewardHeading')}</summary><p className="pb-4 text-sm leading-relaxed text-muted">{t('picks.rewardConditions')}</p></details>
    {notice && <p role="status" className="rounded-xl border border-brand/30 p-3 text-sm text-ink">{t(notice)}</p>}
    {isLoading && <p role="status" className="flex items-center justify-center gap-2 py-8 text-sm text-muted"><Loader2 aria-hidden="true" size={20} className="animate-spin" />{t('picks.loading')}</p>}
    {loadError && <Card role="alert" className="space-y-3 p-5"><p className="text-sm text-danger">{t('picks.loadError')}</p><Button variant="outline" disabled={busy} onClick={fetchPicks}>{t('picks.retry')}</Button></Card>}
    {!isLoading && !loadError && picks.length === 0 && <Card className="space-y-3 px-5 py-10 text-center"><Bookmark aria-hidden="true" size={30} className="mx-auto text-muted" /><h2 className="text-lg font-semibold text-ink">{t(page > 1 ? 'picks.emptyPage' : 'picks.emptyTitle')}</h2><p className="mx-auto max-w-md text-sm text-muted">{t('picks.emptyDescription')}</p>{page > 1 ? <Button variant="outline" onClick={() => changePage(1)}>{t('picks.firstPage')}</Button> : <Link to="/" className="inline-flex min-h-11 items-center rounded-xl bg-brand px-4 text-sm font-semibold text-on-brand">{t('picks.browse')}</Link>}</Card>}
    {picks.length > 0 && <div className="space-y-3">{picks.map((pick) => {
      const product = pick.product
      const available = Boolean(product) && product.is_available !== false && product.status !== 'draft' && product.status !== 'archived'
      const publicPick = isTrue(pick.is_public)
      return <article key={pick.id} className="min-w-0 rounded-2xl border border-line bg-surface p-4"><div className="flex min-w-0 items-start gap-3"><PickPhoto product={product} /><div className="min-w-0 flex-1"><div className="mb-1 flex flex-wrap gap-2 text-[11px] font-semibold"><span className={publicPick ? 'text-brand' : 'text-muted'}>{t(publicPick ? 'picks.public' : 'picks.private')}</span>{publicPick && isTrue(pick.is_featured) && <span className="text-soft">{t('picks.featured')}</span>}</div>{available ? <Link to={getRecommendationPath(product)} className="break-words text-sm font-semibold text-ink hover:text-brand [overflow-wrap:anywhere]">{product.title}</Link> : <h2 className="text-sm font-semibold text-muted">{product?.title || t('picks.unavailableProduct')}</h2>}<p className="mt-1 break-words text-base font-bold text-ink">{product ? priceLabel(product) : t('picks.priceUnavailable')}</p>{!available && <p className="mt-1 text-xs text-muted">{t('picks.notAvailable')}</p>}{product?.seller?.store_name && <p className="mt-1 text-xs text-muted">{product.seller.store_name}</p>}</div></div>
        {(pick.caption || pick.personal_caption) && <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-relaxed text-soft [overflow-wrap:anywhere]">{pick.caption || pick.personal_caption}</p>}
        <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-line pt-3"><Button variant="outline" disabled={busy || isLoading} className="gap-1.5 text-xs" onClick={() => { setActionError(''); setEditing({ ...pick, _context: key }) }}><Pencil aria-hidden="true" size={14} />{t('picks.edit')}</Button>{publicPick && available && pick.recommendation_code && <Button variant="secondary" disabled={busy || isLoading} className="gap-1.5 text-xs" onClick={() => { setCopied(false); setCopyError(false); setSharing({ ...pick, _context: key }) }}><Copy aria-hidden="true" size={14} />{t('picks.share')}</Button>}{available && <Link to={getRecommendationPath(product)} className="inline-flex min-h-11 items-center gap-1 rounded-xl px-2 text-xs font-semibold text-brand">{t('picks.viewProduct')}<ArrowRight aria-hidden="true" size={13} /></Link>}<button type="button" disabled={busy || isLoading} onClick={() => { setActionError(''); setRemoving({ ...pick, _context: key }) }} aria-label={t('picks.removeLabel', { title: product?.title || t('picks.unavailableProduct') })} className="ml-auto flex size-11 shrink-0 items-center justify-center rounded-xl text-muted hover:bg-danger-soft hover:text-danger disabled:opacity-50"><Trash2 aria-hidden="true" size={17} /></button></div>
      </article>
    })}</div>}
    {!isLoading && !loadError && lastPage > 1 && picks.length > 0 && <nav aria-label={t('picks.pagination')} className="flex items-center justify-between gap-2 border-t border-line pt-4"><Button variant="outline" disabled={page <= 1} onClick={() => changePage(page - 1)}><ArrowLeft size={15} aria-hidden="true" />{t('picks.previous')}</Button><span className="text-xs text-muted">{t('picks.page', { page, count: lastPage })}</span><Button variant="outline" disabled={page >= lastPage} onClick={() => changePage(page + 1)}>{t('picks.next')}<ArrowRight size={15} aria-hidden="true" /></Button></nav>}
    {editing?._context === key && <PickEditor key={`${user.id}-${editing.id}`} pick={editing} busy={busy} error={actionError} onClose={() => { if (!busy) setEditing(null) }} onSave={(changes) => mutate(editing, changes)} />}
    <Dialog isOpen={removing?._context === key} onClose={() => { if (!busy) setRemoving(null) }} closeLabel={t('picks.close')} title={t('picks.removeTitle')} description={removing?._context === key ? removing?.product?.title || t('picks.unavailableProduct') : ''}><div className="space-y-4"><p className="text-sm leading-relaxed text-muted">{t('picks.removeDescription')}</p>{actionError && <p role="alert" className="text-sm text-danger">{t(actionError)}</p>}<div className="flex flex-wrap justify-end gap-2"><Button variant="secondary" disabled={busy} onClick={() => setRemoving(null)}>{t('picks.cancel')}</Button><Button variant="danger" isLoading={busy} onClick={() => mutate(removing)}>{t('picks.removeConfirm')}</Button></div></div></Dialog>
    <Dialog isOpen={sharing?._context === key} onClose={() => setSharing(null)} closeLabel={t('picks.close')} title={t('picks.shareTitle')} description={sharing?._context === key ? sharing?.product?.title : ''}><div className="space-y-4"><p className="text-sm text-muted">{t('picks.shareDescription')}</p><label htmlFor={linkId} className="block text-sm font-medium text-ink">{t('picks.pickLink')}</label><input id={linkId} readOnly value={shareUrl} onFocus={(event) => event.target.select()} className="min-h-11 w-full min-w-0 rounded-xl border border-line bg-canvas px-3 text-xs text-soft" />{copyError && <p role="status" className="text-sm text-muted">{t('picks.copyError')}</p>}<Button onClick={copy} className="gap-2">{copied ? <Check aria-hidden="true" size={16} /> : <Copy aria-hidden="true" size={16} />}{t(copied ? 'picks.copied' : 'picks.copy')}</Button></div></Dialog>
  </div>
}
