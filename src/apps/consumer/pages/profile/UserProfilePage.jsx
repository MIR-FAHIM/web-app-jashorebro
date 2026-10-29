import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { AlertCircle, Bookmark, Check, Copy, ImageOff, Loader2, MapPin, Share2, Store, UserCheck } from 'lucide-react'
import { Avatar } from '@/shared/ui/Avatar'
import { Button } from '@/shared/ui/Button'
import { Card } from '@/shared/ui/Card'
import { useAuth } from '@/features/auth/model/authContext'
import { useFriends } from '@/features/friends/model/friendsContext'
import { friendsApi } from '@/features/friends/api/friendsApi'
import { getRecommendationPath } from '@/features/referrals/model/referralAttribution'
import { getProductImageUrl, resolveImageUrl } from '@/shared/lib/mediaUrl'
import { useLocale } from '@/shared/i18n/LocaleProvider'
import { UI_FEATURES } from '@/shared/config/features'

const isTrue = (value) => value === true || value === 1 || value === '1'
const isPrivate = (pick) => pick.is_public === false || pick.is_public === 0 || pick.is_public === '0' || pick.is_public === 'false'
const numericPrice = (value) => (typeof value === 'number' || typeof value === 'string') && String(value).trim() !== '' && Number.isFinite(Number(value)) && Number(value) >= 0 ? Number(value) : null

function PublicFriendAction({ profile }) {
  const { t } = useLocale()
  const { user } = useAuth()
  const actions = useFriends()
  const location = useLocation()
  const navigate = useNavigate()
  const [status, setStatus] = useState(profile.relationship_status || 'none')
  const [friendshipId, setFriendshipId] = useState(profile.friendship_id)
  const [pending, setPending] = useState(false)
  const [confirmRemoval, setConfirmRemoval] = useState(false)
  const [failed, setFailed] = useState(false)
  const busy = useRef(false)
  const mounted = useRef(true)
  useLayoutEffect(() => { mounted.current = true; return () => { mounted.current = false } }, [])

  const act = async (action) => {
    if (!user) { navigate('/auth', { state: { from: location } }); return }
    if (busy.current) return
    busy.current = true
    setPending(true)
    setFailed(false)
    try {
      let nextStatus = 'none'
      let nextFriendshipId = null
      if (action === 'send') {
        const result = await actions.sendRequest({ recipient_id: profile.id, username: profile.username })
        nextStatus = result.relationship_status || 'pending_sent'
        nextFriendshipId = result.friendship_id ?? null
      } else if (action === 'accept') {
        await actions.acceptRequest(friendshipId)
        nextStatus = 'friends'
        nextFriendshipId = friendshipId
      } else if (action === 'decline') await actions.declineRequest(friendshipId)
      else if (action === 'cancel') await actions.cancelRequest(friendshipId)
      else if (action === 'remove') await actions.unfriend(profile.id)
      if (!mounted.current) return
      setStatus(nextStatus)
      setFriendshipId(nextFriendshipId)
      setConfirmRemoval(false)
    } catch {
      if (mounted.current) setFailed(true)
    } finally {
      busy.current = false
      if (mounted.current) setPending(false)
    }
  }

  return <div className="min-w-0 space-y-2">
    <div className="flex flex-wrap items-center gap-2">
      {status === 'friends' ? confirmRemoval ? <>
        <Button variant="danger" disabled={pending} onClick={() => act('remove')}>{t('publicProfile.removeFriend')}</Button>
        <Button variant="secondary" disabled={pending} onClick={() => setConfirmRemoval(false)}>{t('publicProfile.keepFriend')}</Button>
      </> : <Button variant="outline" onClick={() => setConfirmRemoval(true)}><UserCheck size={17} aria-hidden="true" />{t('publicProfile.friends')}</Button>
        : status === 'pending_sent' ? <Button variant="outline" disabled={pending || !friendshipId} onClick={() => act('cancel')}>{t('publicProfile.cancelRequest')}</Button>
          : status === 'pending_received' ? friendshipId ? <><Button disabled={pending} onClick={() => act('accept')}>{t('publicProfile.acceptRequest')}</Button><Button variant="outline" disabled={pending} onClick={() => act('decline')}>{t('publicProfile.declineRequest')}</Button></>
            : <Link to="/friends?tab=requests" className="inline-flex min-h-11 items-center rounded-xl border border-line px-3 text-sm text-soft">{t('publicProfile.manageRequests')}</Link>
            : status === 'blocked' ? <p className="text-sm text-muted">{t('publicProfile.relationshipUnavailable')}</p>
              : <Button disabled={pending} onClick={() => act('send')}>{t('publicProfile.addFriend')}</Button>}
    </div>
    {pending && <p role="status" className="text-xs text-muted">{t('publicProfile.updatingFriendship')}</p>}
    {status === 'pending_sent' && <p role="status" className="text-xs text-muted">{t('publicProfile.requestSent')}</p>}
    {failed && <p role="alert" className="max-w-sm text-sm text-danger">{t('publicProfile.friendError')}</p>}
  </div>
}

function PublicPickCard({ pick }) {
  const { t, formatMoney } = useLocale()
  const [imageFailed, setImageFailed] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [copyState, setCopyState] = useState('idle')
  const mounted = useRef(true)
  useLayoutEffect(() => { mounted.current = true; return () => { mounted.current = false } }, [])
  const product = pick.product
  const image = getProductImageUrl(product)
  const hasVariants = isTrue(product?.has_variants)
  const from = numericPrice(product?.price_from)
  const to = numericPrice(product?.price_to)
  const amount = hasVariants ? from : numericPrice(product?.base_price) ?? from
  const comparison = hasVariants ? null : numericPrice(product?.compare_price)
  const price = amount === null ? t('publicProfile.priceUnavailable')
    : hasVariants && to !== null && to > amount ? t('publicProfile.priceRange', { from: formatMoney(amount), to: formatMoney(to) })
      : hasVariants ? t('publicProfile.priceFrom', { price: formatMoney(amount) }) : formatMoney(amount)
  const caption = pick.caption || pick.personal_caption || ''
  const seller = product?.seller?.store_name || product?.seller?.name
  const hasDestination = product && (product.slug || product.id)
  const pickPath = hasDestination ? getRecommendationPath(product, pick.recommendation_code) : null
  const canShare = pickPath && pick.recommendation_code && !isPrivate(pick)
  const openLabel = t(pick.recommendation_code ? 'publicProfile.openPick' : 'publicProfile.openProduct', { title: product?.title })

  const copyPick = async () => {
    if (!canShare) return
    try {
      await navigator.clipboard.writeText(`${window.location.origin}${pickPath}`)
      if (mounted.current) setCopyState('copied')
    } catch { if (mounted.current) setCopyState('error') }
  }

  return <article className="flex min-w-0 flex-col overflow-hidden rounded-2xl border border-line bg-surface">
    {pickPath ? <Link to={pickPath} aria-label={openLabel} className="block aspect-square overflow-hidden bg-elevated">
      {image && !imageFailed ? <img src={image} alt="" loading="lazy" onError={() => setImageFailed(true)} className="size-full object-contain p-2" /> : <span className="flex size-full flex-col items-center justify-center gap-2 p-3 text-center text-xs text-muted"><ImageOff size={24} aria-hidden="true" />{t('publicProfile.noImage')}</span>}
    </Link> : <div className="flex aspect-square items-center justify-center bg-elevated p-3 text-center text-sm text-muted">{t('publicProfile.productUnavailable')}</div>}
    <div className="flex min-w-0 flex-1 flex-col p-3 sm:p-4">
      {isTrue(pick.is_featured) && !isPrivate(pick) && <p className="mb-2 text-xs font-semibold text-brand">{t('publicProfile.featuredPick')}</p>}
      {pickPath ? <Link to={pickPath} className="flex min-h-11 items-start text-sm font-semibold leading-snug text-ink hover:text-brand"><span className="line-clamp-2 break-words [overflow-wrap:anywhere]">{product.title}</span></Link> : <p className="text-sm font-semibold text-ink">{t('publicProfile.productUnavailable')}</p>}
      <div className="mt-2 flex flex-wrap items-baseline gap-x-2 gap-y-1"><p className="break-words text-base font-bold text-ink [overflow-wrap:anywhere]">{price}</p>{amount !== null && comparison !== null && comparison > amount && <span className="text-xs text-muted"><span className="sr-only">{t('publicProfile.previousPrice')} </span><s>{formatMoney(comparison)}</s></span>}</div>
      {seller && <p className="mt-2 flex min-w-0 items-start gap-1 text-xs text-muted"><Store size={13} className="mt-0.5 shrink-0" aria-hidden="true" /><span className="break-words [overflow-wrap:anywhere]">{seller}</span></p>}
      {['in_stock', 'out_of_stock'].includes(product?.availability) && <p className="mt-2 text-xs text-muted">{t(product.availability === 'in_stock' ? 'publicProfile.inStock' : 'publicProfile.outOfStock')}</p>}
      {caption && <div className="mt-3 border-t border-line pt-3"><p className={`${caption.length > 160 && !expanded ? 'line-clamp-3' : ''} whitespace-pre-wrap break-words text-sm leading-relaxed text-soft [overflow-wrap:anywhere]`}>{caption}</p>{caption.length > 160 && <button type="button" aria-expanded={expanded} onClick={() => setExpanded(!expanded)} className="min-h-11 text-xs font-medium text-brand">{t(expanded ? 'publicProfile.lessNote' : 'publicProfile.moreNote')}</button>}</div>}
      <div className="mt-auto flex flex-wrap gap-2 pt-4">
        {pickPath && <Link to={pickPath} aria-label={openLabel} className="inline-flex min-h-11 flex-1 items-center justify-center rounded-xl bg-brand px-3 py-2 text-center text-sm font-medium text-on-brand">{t(pick.recommendation_code ? 'publicProfile.viewPick' : 'publicProfile.viewProduct')}</Link>}
        {canShare && <button type="button" onClick={copyPick} aria-label={t('publicProfile.copyPick', { title: product.title })} title={t('publicProfile.copyLink')} className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-line text-soft hover:text-brand">{copyState === 'copied' ? <Check size={18} aria-hidden="true" /> : <Copy size={18} aria-hidden="true" />}</button>}
      </div>
      {copyState !== 'idle' && <p role={copyState === 'error' ? 'alert' : 'status'} className={`mt-2 text-xs ${copyState === 'error' ? 'text-danger' : 'text-muted'}`}>{t(copyState === 'error' ? 'publicProfile.copyError' : 'publicProfile.pickCopied')}</p>}
    </div>
  </article>
}

function PublicProfileContent({ username }) {
  const { user } = useAuth()
  const { t } = useLocale()
  const [result, setResult] = useState({ status: 'loading', data: null })
  const [attempt, setAttempt] = useState(0)
  const [picks, setPicks] = useState([])
  const [meta, setMeta] = useState(null)
  const [moreStatus, setMoreStatus] = useState('idle')
  const [shareStatus, setShareStatus] = useState('idle')
  const mounted = useRef(true)
  const loadingMore = useRef(false)
  const sharing = useRef(false)
  const picksRequest = useRef(0)
  useLayoutEffect(() => { mounted.current = true; return () => { mounted.current = false; picksRequest.current += 1 } }, [])

  useEffect(() => {
    let current = true
    picksRequest.current += 1
    loadingMore.current = false
    setResult({ status: 'loading', data: null })
    setPicks([])
    setMeta(null)
    setMoreStatus('idle')
    friendsApi.getUserProfile(username, { picks_page: 1, picks_per_page: 12 })
      .then((data) => {
        if (!current) return
        if (!data?.id || !Array.isArray(data.picks)) throw new Error('Invalid profile response')
        setResult({ status: 'ready', data })
        setPicks(data.picks.filter((pick) => !isPrivate(pick)))
        setMeta(data.picks_meta || null)
      })
      .catch(() => { if (current) setResult({ status: 'error', data: null }) })
    return () => { current = false }
  }, [username, attempt])

  const loadMore = async () => {
    if (loadingMore.current || !meta || Number(meta.current_page) >= Number(meta.last_page)) return
    const version = ++picksRequest.current
    const nextPage = Number(meta.current_page) + 1
    loadingMore.current = true
    setMoreStatus('loading')
    try {
      const data = await friendsApi.getUserProfile(username, { picks_page: nextPage, picks_per_page: 12 })
      if (!mounted.current || picksRequest.current !== version) return
      if (String(data?.id) !== String(result.data.id) || !Array.isArray(data.picks) || Number(data.picks_meta?.current_page) !== nextPage) throw new Error('Invalid Picks response')
      setPicks((previous) => {
        const seen = new Set(previous.map((pick) => String(pick.id)))
        return [...previous, ...data.picks.filter((pick) => !isPrivate(pick) && !seen.has(String(pick.id)))]
      })
      setMeta(data.picks_meta)
      setMoreStatus('idle')
    } catch (failure) {
      if (mounted.current && picksRequest.current === version) {
        if (failure.status === 403 || failure.status === 404) {
          setPicks([])
          setMeta(null)
          setResult({ status: 'error', data: null })
        } else setMoreStatus('error')
      }
    }
    finally { if (picksRequest.current === version) loadingMore.current = false }
  }

  if (result.status === 'loading') return <div role="status" className="flex min-h-48 items-center justify-center gap-2 text-sm text-muted"><Loader2 size={21} className="animate-spin" aria-hidden="true" />{t('publicProfile.loading')}</div>
  if (result.status === 'error') return <Card className="mx-auto max-w-lg space-y-4 p-5 sm:p-6"><AlertCircle size={25} className="text-danger" aria-hidden="true" /><h1 className="text-xl font-semibold text-ink">{t('publicProfile.unavailable')}</h1><p role="alert" className="text-sm leading-relaxed text-muted">{t('publicProfile.loadError')}</p><div className="flex flex-wrap gap-2"><Button onClick={() => setAttempt((value) => value + 1)}>{t('publicProfile.retry')}</Button><Link to="/friends" className="inline-flex min-h-11 items-center rounded-xl border border-line px-3 text-sm font-medium text-soft">{t('publicProfile.findFriends')}</Link></div></Card>

  const profile = result.data
  const isSelf = profile.relationship_status === 'self' || (user?.id != null && String(user.id) === String(profile.id))
  const canonicalUrl = `${window.location.origin}/users/${encodeURIComponent(profile.username || username)}`
  const locality = profile.profile?.locality
  const total = numericPrice(meta?.total ?? profile.stats?.picks_count)
  const hasMore = meta && Number(meta.current_page) < Number(meta.last_page)
  const shop = UI_FEATURES.personalStores ? profile.shop : null

  const shareProfile = async () => {
    if (sharing.current) return
    sharing.current = true
    setShareStatus('sharing')
    try {
      if (navigator.share) {
        try {
          await navigator.share({ title: t('publicProfile.shareTitle', { name: profile.name }), url: canonicalUrl })
          if (mounted.current) setShareStatus('idle')
          return
        } catch (failure) { if (failure?.name === 'AbortError') { if (mounted.current) setShareStatus('idle'); return } }
      }
      await navigator.clipboard.writeText(canonicalUrl)
      if (mounted.current) setShareStatus('copied')
    } catch { if (mounted.current) setShareStatus('error') }
    finally { sharing.current = false }
  }

  return <div className="mx-auto min-w-0 max-w-5xl space-y-6">
    <Card className="space-y-4 p-4 sm:p-5">
      <div className="flex min-w-0 items-start gap-3 sm:gap-4">
        <Avatar name={profile.name || profile.username} src={resolveImageUrl(profile.profile?.avatar_url || profile.avatar_url)} size="lg" className="size-16" />
        <div className="min-w-0 flex-1"><h1 className="break-words text-xl font-semibold leading-snug text-ink [overflow-wrap:anywhere] sm:text-2xl">{profile.name || profile.username}</h1>{profile.username && <p className="mt-1 break-words text-sm text-muted [overflow-wrap:anywhere]">@{profile.username}</p>}{locality && <p className="mt-2 flex min-w-0 items-start gap-1.5 text-xs text-muted"><MapPin size={14} className="shrink-0" aria-hidden="true" /><span className="break-words [overflow-wrap:anywhere]">{locality}</span></p>}</div>
      </div>
      {profile.profile?.bio && <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-soft [overflow-wrap:anywhere]">{profile.profile.bio}</p>}
      <div className="flex flex-wrap items-start gap-2">
        {isSelf ? <Link to="/profile" className="inline-flex min-h-11 items-center justify-center rounded-xl bg-brand px-4 py-2 text-sm font-medium text-on-brand">{t('publicProfile.editOwnProfile')}</Link> : <PublicFriendAction key={`${profile.id}-${profile.relationship_status}-${profile.friendship_id}`} profile={profile} />}
        <Button variant="outline" disabled={shareStatus === 'sharing'} onClick={shareProfile}><Share2 size={17} aria-hidden="true" />{t('publicProfile.shareProfile')}</Button>
        {shop?.slug && <Link to={`/shop/${encodeURIComponent(shop.slug)}`} className="inline-flex min-h-11 items-center rounded-xl border border-line px-3 text-sm text-soft">{t('publicProfile.visitStore')}</Link>}
      </div>
      {shareStatus === 'copied' && <p role="status" className="text-sm text-muted">{t('publicProfile.profileCopied')}</p>}
      {shareStatus === 'error' && <div className="space-y-2"><label htmlFor="public-profile-share-url" className="block text-sm text-muted">{t('publicProfile.shareFallback')}</label><input id="public-profile-share-url" readOnly value={canonicalUrl} onFocus={(event) => event.target.select()} className="min-h-11 w-full min-w-0 rounded-xl border border-line bg-canvas px-3 text-xs text-soft" /></div>}
    </Card>

    <section aria-labelledby="public-profile-picks-heading" className="space-y-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2"><h2 id="public-profile-picks-heading" className="text-lg font-semibold text-ink">{t('publicProfile.publicPicks')}</h2>{total !== null && <p className="text-sm text-muted">{t('publicProfile.pickCount', { count: total })}</p>}</div>
      {picks.length > 0 ? <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">{picks.map((pick) => <PublicPickCard key={pick.id} pick={pick} />)}</div> : <Card className="space-y-3 p-6 text-center"><Bookmark size={26} className="mx-auto text-muted" aria-hidden="true" /><h3 className="text-base font-semibold text-ink">{t('publicProfile.emptyTitle')}</h3><p className="text-sm text-muted">{t('publicProfile.emptyDescription')}</p>{isSelf && <Link to="/my-picks" className="inline-flex min-h-11 items-center justify-center rounded-xl border border-line px-4 text-sm font-medium text-soft">{t('publicProfile.manageOwnPicks')}</Link>}</Card>}
      {moreStatus === 'error' && <p role="alert" className="text-sm text-danger">{t('publicProfile.moreError')}</p>}
      {hasMore && <div className="flex flex-col items-center gap-2"><Button variant="outline" isLoading={moreStatus === 'loading'} onClick={loadMore}>{t(moreStatus === 'error' ? 'publicProfile.retryMore' : moreStatus === 'loading' ? 'publicProfile.loadingMore' : 'publicProfile.loadMore')}</Button>{moreStatus === 'loading' && <p role="status" className="text-xs text-muted">{t('publicProfile.loadingMore')}</p>}</div>}
    </section>
  </div>
}

export default function UserProfilePage() {
  const { username } = useParams()
  const { user, isLoading } = useAuth()
  const { t } = useLocale()
  const cleanUsername = (username || '').replace(/^@/, '')
  if (isLoading) return <p role="status" className="py-8 text-center text-sm text-muted">{t('publicProfile.loading')}</p>
  return <PublicProfileContent key={JSON.stringify([cleanUsername.toLowerCase(), user?.id ?? null])} username={cleanUsername} />
}
