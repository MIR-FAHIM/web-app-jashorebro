import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Bookmark, BookmarkCheck, ImageOff, Loader2, Store } from 'lucide-react'
import { Avatar } from '@/shared/ui/Avatar'
import { Button } from '@/shared/ui/Button'
import { Dialog } from '@/shared/ui/Dialog'
import { getProductImageUrl, resolveImageUrl } from '@/shared/lib/mediaUrl'
import { useLocale } from '@/shared/i18n/LocaleProvider'
import { useAuth } from '@/features/auth/model/authContext'
import { SaveToPicksModal } from '@/features/community/components/SaveToPicksModal'
import { getRecommendationPath } from '@/features/referrals/model/referralAttribution'
import { catalogApi } from '../api/catalogApi'

const priceValue = (value) => (typeof value === 'number' || typeof value === 'string') && String(value).trim() !== '' && Number.isFinite(Number(value)) && Number(value) >= 0 ? Number(value) : null
const isTrue = (value) => value === true || value === 1 || value === '1'

function ProductPhoto({ product, className }) {
  const { t } = useLocale()
  const source = getProductImageUrl(product)
  const [failedSource, setFailedSource] = useState(null)
  return source && source !== failedSource
    ? <img src={source} alt="" loading="lazy" onError={() => setFailedSource(source)} className={className} />
    : <span className={`flex flex-col items-center justify-center gap-2 bg-elevated text-muted ${className}`}><ImageOff size={25} aria-hidden="true" /><span className="px-2 text-center text-xs">{t('card.noImage')}</span></span>
}

export function MarketplaceProductCard({ product, onSaved }) {
  const { user, isLoading: isAuthLoading } = useAuth()
  const { t, formatMoney, formatNumber } = useLocale()
  const location = useLocation()
  const navigate = useNavigate()
  const [saveKey, setSaveKey] = useState(null)
  const [localPick, setLocalPick] = useState(null)
  const [preview, setPreview] = useState(null)
  const [friendsResult, setFriendsResult] = useState({ key: null, status: 'idle', friends: [] })
  const friendsRequest = useRef(0)
  const loadingKey = useRef(null)
  const resultKey = JSON.stringify([product.id, user?.id])
  const latestKey = useRef(resultKey)
  latestKey.current = resultKey
  useEffect(() => () => { friendsRequest.current += 1 }, [])

  const path = getRecommendationPath(product)
  const saved = Boolean(user) && (isTrue(product.current_user?.has_picked) || localPick?.key === resultKey)
  const hasVariants = isTrue(product.has_variants)
  const from = priceValue(product.price_from)
  const to = priceValue(product.price_to)
  const current = hasVariants ? from : priceValue(product.base_price) ?? from
  const compare = !hasVariants ? priceValue(product.compare_price) : null
  const price = current === null ? t('card.priceUnavailable')
    : hasVariants && to !== null && to > current ? t('card.priceRange', { from: formatMoney(current), to: formatMoney(to) })
      : hasVariants ? t('card.priceFrom', { price: formatMoney(current) }) : formatMoney(current)
  const availability = product.availability === 'in_stock' || product.in_stock === true ? 'card.inStock'
    : product.availability === 'out_of_stock' || product.in_stock === false ? 'card.outOfStock' : 'card.availability'
  const seller = product.seller?.store_name || product.seller?.name
  const summary = user && Array.isArray(product.picked_by_friends?.users) ? product.picked_by_friends.users.slice(0, 3) : []
  const friendCount = user ? Math.max(summary.length, Number(product.picked_by_friends?.count) || 0) : 0
  const remaining = Math.max(0, friendCount - summary.length)
  const currentFriends = friendsResult.key === resultKey ? friendsResult : { status: 'idle', friends: [] }
  const previewOpen = preview?.key === resultKey
  const previewFriends = preview?.friendId == null ? currentFriends.friends : currentFriends.friends.filter((friend) => String(friend.id) === String(preview.friendId))

  const loadFriends = async (force = false) => {
    if (loadingKey.current === resultKey || (!force && currentFriends.status === 'ready')) return
    const key = resultKey
    const requestId = ++friendsRequest.current
    loadingKey.current = key
    setFriendsResult({ key, status: 'loading', friends: [] })
    try {
      const response = await catalogApi.getFriendsWhoPicked(product.id, { all: true })
      if (requestId !== friendsRequest.current || latestKey.current !== key) return
      const friends = Array.isArray(response) ? response : response?.friends || response?.data || []
      setFriendsResult({ key, status: 'ready', friends: Array.isArray(friends) ? friends : [] })
    } catch {
      if (requestId === friendsRequest.current && latestKey.current === key) setFriendsResult({ key, status: 'error', friends: [] })
    } finally {
      if (requestId === friendsRequest.current) loadingKey.current = null
    }
  }
  const openPreview = (friendId = null) => { setPreview({ key: resultKey, friendId }); loadFriends(true) }
  const startSave = () => {
    if (!user) { navigate('/auth', { state: { from: location } }); return }
    setSaveKey(resultKey)
  }

  return (
    <>
      <article className="flex min-w-0 flex-col overflow-hidden rounded-2xl border border-line bg-surface">
        <div className="relative">
          <Link to={path} aria-label={t('card.open', { title: product.title })} className="block aspect-square overflow-hidden bg-elevated"><ProductPhoto product={product} className="h-full w-full object-contain p-2" /></Link>
          {saved ? <Link to="/my-picks" aria-label={t('card.manage', { title: product.title })} title={t('card.saved')} className="absolute right-1.5 top-1.5 flex size-11 items-center justify-center rounded-xl border border-brand/30 bg-surface/95 text-brand"><BookmarkCheck size={20} aria-hidden="true" /></Link>
            : <button type="button" onClick={startSave} disabled={isAuthLoading} aria-label={t('card.save', { title: product.title })} title={t('card.saveShort')} className="absolute right-1.5 top-1.5 flex size-11 items-center justify-center rounded-xl border border-line bg-surface/95 text-soft hover:text-brand disabled:opacity-50"><Bookmark size={20} aria-hidden="true" /></button>}
        </div>
        <div className="flex min-w-0 flex-1 flex-col p-3 sm:p-4">
          <Link to={path} className="flex min-h-11 items-start break-words text-sm font-semibold leading-snug text-ink hover:text-brand [overflow-wrap:anywhere]"><span className="line-clamp-2">{product.title}</span></Link>
          <div className="mt-2 flex flex-wrap items-baseline gap-x-2 gap-y-1"><p className="min-w-0 break-words text-base font-bold text-ink [overflow-wrap:anywhere]">{price}</p>{current !== null && compare !== null && compare > current && <span className="text-xs text-muted"><span className="sr-only">{t('card.previousPrice')} </span><s>{formatMoney(compare)}</s></span>}</div>
          {seller && <p className="mt-2 flex min-w-0 items-start gap-1 text-xs text-muted"><Store size={13} className="mt-0.5 shrink-0" aria-hidden="true" /><span className="break-words [overflow-wrap:anywhere]">{seller}</span></p>}
          <p className={`mt-2 text-xs ${availability === 'card.outOfStock' ? 'text-danger' : 'text-muted'}`}>{t(availability)}</p>
          {friendCount > 0 && <div className="mt-auto pt-3"><p className="text-[11px] text-muted">{t('card.friendsPicked', { count: friendCount })}</p><div className="-mx-1 mt-1 flex flex-wrap items-center">
            {summary.map((friend) => <button key={friend.id} type="button" onClick={() => openPreview(friend.id)} aria-label={t('card.previewFriend', { name: friend.name || t('card.friend'), title: product.title })} className="flex size-11 shrink-0 items-center justify-center rounded-xl hover:bg-elevated"><Avatar name={friend.name || t('card.friend')} src={resolveImageUrl(friend.avatar_url)} size="sm" /></button>)}
            {remaining > 0 && <button type="button" onClick={() => openPreview()} aria-label={t('card.allFriends', { count: friendCount, title: product.title })} className="flex min-h-11 min-w-11 items-center justify-center rounded-xl px-1 text-xs font-semibold text-brand hover:bg-elevated">+{formatNumber(remaining)}</button>}
          </div></div>}
        </div>
      </article>

      {saveKey === resultKey && user && <SaveToPicksModal key={resultKey} isOpen onClose={() => setSaveKey(null)} product={product} onSaved={(pick) => { if (latestKey.current !== resultKey) return; setLocalPick({ key: resultKey, pick }); onSaved?.(product.id, pick) }} />}

      <Dialog isOpen={previewOpen} onClose={() => setPreview(null)} closeLabel={t('card.close')} title={t(preview?.friendId == null ? 'card.allPicksTitle' : 'card.previewTitle')} description={t('card.previewDescription')}>
        <div className="min-w-0 space-y-4">
          <div className="flex min-w-0 items-center gap-3 rounded-xl border border-line p-3"><ProductPhoto product={product} className="size-16 shrink-0 rounded-lg object-contain" /><div className="min-w-0"><p className="break-words text-sm font-semibold text-ink [overflow-wrap:anywhere]">{product.title}</p><p className="mt-1 text-sm text-muted">{price}</p></div></div>
          {(currentFriends.status === 'loading' || currentFriends.status === 'idle') && <p role="status" className="flex min-h-16 items-center justify-center gap-2 text-sm text-muted"><Loader2 size={18} className="animate-spin" aria-hidden="true" />{t('card.loadingPicks')}</p>}
          {currentFriends.status === 'error' && <div role="alert" className="space-y-3 rounded-xl border border-danger/30 p-4 text-sm text-soft"><p>{t('card.picksError')}</p><Button variant="outline" onClick={() => loadFriends(true)}>{t('card.retry')}</Button></div>}
          {currentFriends.status === 'ready' && previewFriends.length === 0 && <p role="status" className="py-3 text-sm text-muted">{t('card.noPicks')}</p>}
          {currentFriends.status === 'ready' && previewFriends.map((friend) => <div key={friend.id} className="min-w-0 space-y-3 rounded-xl border border-line p-3 sm:p-4">
            <div className="flex min-w-0 items-center gap-3"><Avatar name={friend.name || t('card.friend')} src={resolveImageUrl(friend.avatar_url)} size="md" /><p className="min-w-0 break-words text-sm font-semibold text-ink [overflow-wrap:anywhere]">{friend.name || t('card.friend')}</p></div>
            {friend.caption ? <blockquote className="whitespace-pre-wrap break-words text-sm leading-relaxed text-soft [overflow-wrap:anywhere]">{friend.caption}</blockquote> : <p className="text-sm text-muted">{t('card.noCaption')}</p>}
            <div className="flex flex-wrap gap-2">{friend.recommendation_code && <Link to={getRecommendationPath(product, friend.recommendation_code)} className="inline-flex min-h-11 items-center justify-center rounded-xl bg-brand px-3 py-2 text-sm font-medium text-on-brand">{t('card.viewPick', { name: friend.name || t('card.friend') })}</Link>}{friend.username && <Link to={`/users/${encodeURIComponent(friend.username)}`} className="inline-flex min-h-11 items-center justify-center rounded-xl border border-line px-3 py-2 text-sm font-medium text-soft">{t('card.viewProfile')}</Link>}</div>
          </div>)}
        </div>
      </Dialog>
    </>
  )
}
