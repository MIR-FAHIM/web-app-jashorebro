import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { AlertCircle, ArrowRight, Bookmark, HeartHandshake, Search, Users, UserPlus } from 'lucide-react'
import { useAuth } from '@/features/auth/model/authContext'
import { friendPicksApi } from '@/features/friends/api/friendPicksApi'
import { FriendPickCard } from '@/features/friends/components/FriendPickCard'
import { FriendPickedProductCard } from '@/features/friends/components/FriendPickedProductCard'
import { Avatar } from '@/shared/ui/Avatar'
import { Button } from '@/shared/ui/Button'
import { Card } from '@/shared/ui/Card'
import { resolveImageUrl } from '@/shared/lib/mediaUrl'

function LoadingCards({ label }) {
  return <div role="status" className="space-y-3"><p className="text-sm text-muted">{label}</p><div aria-hidden="true" className="grid grid-cols-2 gap-3">{[1, 2, 3, 4].map((key) => <div key={key} className="h-32 animate-pulse rounded-2xl border border-line bg-elevated" />)}</div></div>
}

function RequestError({ message, onRetry }) {
  return <Card className="space-y-3 p-5"><AlertCircle size={24} className="text-danger" /><h3 className="font-semibold text-ink">We couldn’t load this just yet</h3><p role="alert" className="text-sm text-muted">{message}</p><Button variant="outline" onClick={onRetry}>Try again</Button></Card>
}

function FriendProducts({ friend, onCount }) {
  const [result, setResult] = useState({ picks: [], total: friend.picks_count, currentPage: 0, lastPage: 1 })
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [error, setError] = useState('')
  const [attempt, setAttempt] = useState(0)
  const requestRef = useRef(null)

  useEffect(() => {
    const controller = new AbortController()
    requestRef.current = controller
    friendPicksApi.getPublicPicks({ id: friend.id, username: friend.username }, { signal: controller.signal })
      .then((data) => {
        if (controller.signal.aborted) return
        setResult(data)
        onCount(friend.id, data.total)
      })
      .catch((failure) => {
        if (!controller.signal.aborted) setError(failure.message || 'Please try loading your friend’s picks again.')
      })
      .finally(() => { if (!controller.signal.aborted) setIsLoading(false) })
    return () => { controller.abort(); requestRef.current?.abort() }
  }, [friend.id, friend.username, attempt, onCount])

  const loadMore = async () => {
    if (isLoadingMore) return
    setIsLoadingMore(true)
    setError('')
    const controller = new AbortController()
    requestRef.current = controller
    try {
      const data = await friendPicksApi.getPublicPicks(friend, { page: result.currentPage + 1, signal: controller.signal })
      if (controller.signal.aborted) return
      setResult((previous) => ({ ...data, picks: [...new Map([...previous.picks, ...data.picks].map((pick) => [pick.id, pick])).values()] }))
      onCount(friend.id, data.total)
    } catch (failure) {
      if (!controller.signal.aborted) setError(failure.message || 'Could not load more picks.')
    } finally {
      if (!controller.signal.aborted) setIsLoadingMore(false)
    }
  }
  const retry = () => {
    if (result.currentPage > 0) { loadMore(); return }
    setError('')
    setIsLoading(true)
    setAttempt((previous) => previous + 1)
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-5">
        <div className="flex min-w-0 items-center gap-3"><Avatar name={friend.name} src={resolveImageUrl(friend.avatar_url)} size="lg" /><div className="min-w-0"><h2 id="friend-products-heading" className="text-xl font-semibold tracking-tight text-ink">{friend.name}’s picks</h2><p className="mt-1 text-sm text-muted">{result.total === null ? 'A collection worth exploring' : `${result.total} public ${result.total === 1 ? 'pick' : 'picks'}`}</p></div></div>
        {friend.username && <Link to={`/profile/${encodeURIComponent(friend.username)}`} className="inline-flex min-h-11 items-center gap-1 text-sm font-medium text-brand">View profile <ArrowRight size={15} /></Link>}
      </div>
      {isLoading ? <LoadingCards label={`Loading ${friend.name}’s picks…`} /> : (
        <>
          {!error && result.picks.length === 0 && <Card className="space-y-3 p-8 text-center"><Bookmark size={30} className="mx-auto text-brand" /><h3 className="text-lg font-semibold text-ink">No public picks yet</h3><p className="text-sm leading-relaxed text-muted">{friend.name} hasn’t shared any picks you can view yet. Choose another friend to keep exploring.</p></Card>}
          <div className="grid gap-4 min-[480px]:grid-cols-2">{result.picks.map((pick) => <FriendPickedProductCard key={pick.id} pick={pick} friend={friend} />)}</div>
          {error && <RequestError message={error} onRetry={retry} />}
          {!error && result.currentPage < result.lastPage && <div className="pt-2 text-center"><Button variant="outline" isLoading={isLoadingMore} onClick={loadMore}>Load more picks</Button><p className="mt-2 text-xs text-muted">Showing {result.picks.length} of {result.total} picks</p></div>}
        </>
      )}
    </div>
  )
}

function FriendPicksDirectory() {
  const [params, setParams] = useSearchParams()
  const [friends, setFriends] = useState([])
  const [query, setQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [attempt, setAttempt] = useState(0)
  const resultsRef = useRef(null)
  const selectedId = params.get('friend')
  const selectedFriend = friends.find((friend) => String(friend.id) === selectedId)
  const filteredFriends = friends.filter((friend) => `${friend.name} ${friend.username || ''}`.toLowerCase().includes(query.trim().toLowerCase()))
  const updateCount = useCallback((id, count) => {
    setFriends((previous) => previous.map((friend) => friend.id === id ? { ...friend, picks_count: count } : friend))
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    friendPicksApi.getAllFriends({ signal: controller.signal })
      .then(async (records) => {
        if (controller.signal.aborted) return
        setFriends(records)
        setIsLoading(false)
        await friendPicksApi.populateCounts(records, updateCount, { signal: controller.signal })
      })
      .catch((failure) => {
        if (!controller.signal.aborted) { setError(failure.message || 'Please try loading your friends again.'); setIsLoading(false) }
      })
    return () => controller.abort()
  }, [attempt, updateCount])

  const selectFriend = (friend) => {
    setParams((previous) => { const next = new URLSearchParams(previous); next.set('friend', friend.id); return next }, { preventScrollReset: true })
    if (window.matchMedia('(max-width: 1023px)').matches) resultsRef.current?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start' })
  }
  const retry = () => { setError(''); setIsLoading(true); setAttempt((previous) => previous + 1) }

  if (error) return <RequestError message={error} onRetry={retry} />
  if (isLoading) return <LoadingCards label="Finding your friends and their picks…" />
  if (!friends.length) return <Card className="space-y-4 p-8 text-center"><Users size={36} className="mx-auto text-brand" /><h2 className="text-xl font-semibold text-ink">Good finds start with your circle</h2><p className="mx-auto max-w-md text-sm leading-relaxed text-muted">Connect with friends to see their picks here. Only confirmed friends appear on this page.</p><Link to="/friends?tab=discover" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-brand px-5 text-sm font-semibold text-on-brand"><UserPlus size={17} /> Find friends</Link></Card>

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[260px_minmax(0,1fr)] xl:grid-cols-[280px_minmax(0,1fr)]">
      <aside className="min-w-0 space-y-4 lg:sticky lg:top-24" aria-labelledby="friend-list-heading">
        <div className="flex items-center justify-between gap-3"><h2 id="friend-list-heading" className="text-lg font-semibold text-ink">Your friends</h2><span className="rounded-full bg-elevated px-2.5 py-1 text-xs text-muted">{friends.length}</span></div>
        <div className="relative"><Search size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" /><input type="search" aria-label="Search your friends" placeholder="Find a friend" value={query} onChange={(event) => setQuery(event.target.value)} className="min-h-12 w-full rounded-xl border border-field-border bg-surface py-2.5 pl-10 pr-3 text-base text-ink placeholder:text-muted lg:text-sm" /></div>
        <p className="text-xs leading-relaxed text-muted">Choose a friend to explore their public picks.</p>
        <div className="grid max-h-[360px] grid-cols-2 gap-2 overflow-y-auto p-1 lg:max-h-[calc(100dvh-18rem)] lg:grid-cols-1">{filteredFriends.map((friend) => <FriendPickCard key={friend.id} friend={friend} isSelected={String(friend.id) === selectedId} onSelect={selectFriend} />)}</div>
        {!filteredFriends.length && <Card className="space-y-3 p-5 text-center"><p className="text-sm text-muted">No friends match “{query}”.</p><Button variant="ghost" onClick={() => setQuery('')}>Clear search</Button></Card>}
        <Link to="/friends" className="inline-flex min-h-11 items-center gap-2 text-sm text-muted hover:text-ink"><Users size={16} /> Manage friends <ArrowRight size={14} /></Link>
      </aside>
      <section ref={resultsRef} aria-labelledby="friend-products-heading" aria-live="polite" className="min-w-0 scroll-mt-24">
        {selectedFriend ? <FriendProducts key={selectedFriend.id} friend={selectedFriend} onCount={updateCount} /> : <Card className="flex min-h-80 flex-col items-center justify-center space-y-4 p-6 text-center"><span className="flex size-16 items-center justify-center rounded-2xl bg-brand-soft text-brand"><HeartHandshake size={30} /></span><h2 id="friend-products-heading" className="text-2xl font-semibold tracking-tight text-ink">Great picks come from good friends.</h2><p className="max-w-sm text-sm leading-relaxed text-muted">{selectedId ? 'This friend is no longer in your list. Choose another friend to see their picks.' : 'Select a friend to see the products they picked, their recommendations, and what might be your next favorite.'}</p></Card>}
      </section>
    </div>
  )
}

export default function FriendPicksPage() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const [params] = useSearchParams()
  return (
    <div className="mx-auto max-w-6xl space-y-7">
      <section className="relative overflow-hidden rounded-3xl border border-line bg-surface p-5 sm:p-7">
        <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-24 size-72 rounded-full bg-brand/10 blur-3xl" />
        <div className="relative max-w-2xl"><p className="mb-4 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-brand"><HeartHandshake size={16} /> Friend Picks</p><h1 className="text-3xl font-semibold leading-tight tracking-tight text-ink sm:text-4xl">Let your friends earn<br className="hidden sm:block" /> through your shopping.</h1><p className="mt-3 max-w-xl text-base leading-relaxed text-soft">Discover products your friends picked. Shop a recommendation you love and help support your circle.</p><p className="mt-3 text-xs leading-relaxed text-muted">Eligible purchases can earn your friend a reward. Only their public picks are shown.</p></div>
      </section>
      {isLoading ? <LoadingCards label="Loading your friend circle…" /> : isAuthenticated ? <FriendPicksDirectory key={user?.id} /> : <Card className="space-y-4 p-7 text-center"><Users size={36} className="mx-auto text-brand" /><h2 className="text-xl font-semibold text-ink">Your friends’ favorites are waiting</h2><p className="mx-auto max-w-md text-sm leading-relaxed text-muted">Sign in to see all your friends, their pick counts, and the products they recommend.</p><Link to="/auth" state={{ from: { pathname: '/friend-picks', search: params.size ? `?${params}` : '' } }} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-brand px-5 text-sm font-semibold text-on-brand">Sign in to see Friend Picks <ArrowRight size={17} /></Link></Card>}
    </div>
  )
}
