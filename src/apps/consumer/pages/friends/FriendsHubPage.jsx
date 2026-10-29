import { useState, useEffect, useRef } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowUpRight, Users, UserPlus, Clock, Search, MapPin, Sparkles, Check, X } from 'lucide-react'
import { Card } from '@/shared/ui/Card'
import { Button } from '@/shared/ui/Button'
import { Avatar } from '@/shared/ui/Avatar'
import { Badge } from '@/shared/ui/Badge'
import { UserCard } from '@/features/friends/components/UserCard'
import { useFriends } from '@/features/friends/model/friendsContext'
import { friendsApi } from '@/features/friends/api/friendsApi'
import { useAuth } from '@/features/auth/model/authContext'
import { resolveImageUrl } from '@/shared/lib/mediaUrl'
import { useLocale } from '@/shared/i18n/LocaleProvider'

function LoadError({ message, onRetry, isLoading }) {
  return (
    <Card className="flex flex-wrap items-center justify-between gap-3 p-4">
      <p role="alert" className="text-sm text-danger">{message}</p>
      <Button variant="outline" size="sm" onClick={onRetry} isLoading={isLoading}>Try again</Button>
    </Card>
  )
}

function FriendsContent() {
  const location = useLocation()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const requestedTab = params.get('tab')
  const activeTab = ['my-friends', 'requests', 'discover'].includes(requestedTab) ? requestedTab : 'my-friends'

  const {
    friends,
    incomingRequests,
    outgoingRequests,
    incomingCount,
    isLoadingFriends,
    isLoadingRequests,
    hasLoadedFriends,
    hasLoadedRequests,
    friendsError,
    requestsError,
    refreshFriends,
    refreshRequests,
    acceptRequest,
    declineRequest,
    cancelRequest,
  } = useFriends()

  // Search in "My Friends"
  const [friendsSearchQuery, setFriendsSearchQuery] = useState('')

  // Search in "Find Friends"
  const [discoverQuery, setDiscoverQuery] = useState('')
  const [searchState, setSearchState] = useState({ query: '', items: [], isLoading: false, hasLoaded: false, error: '' })
  const [searchAttempt, setSearchAttempt] = useState(0)
  const [suggestions, setSuggestions] = useState([])
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false)
  const [hasLoadedSuggestions, setHasLoadedSuggestions] = useState(false)
  const [suggestionsError, setSuggestionsError] = useState('')
  const [pendingAction, setPendingAction] = useState(null)
  const [actionError, setActionError] = useState('')
  const actionPending = useRef(false)
  const query = discoverQuery.trim()
  const currentSearch = searchState.query === query
    ? searchState
    : { items: [], isLoading: query.length >= 2, hasLoaded: false, error: '' }
  const searchResults = currentSearch.items
  const isSearching = currentSearch.isLoading

  const setTab = (tab) => {
    const nextParams = new URLSearchParams(params)
    nextParams.set('tab', tab)
    navigate({ pathname: location.pathname, search: `?${nextParams}`, hash: location.hash })
  }

  const runRequestAction = async (action, requestId, label) => {
    if (actionPending.current) return
    actionPending.current = true
    setPendingAction(`${label}-${requestId}`)
    setActionError('')
    try {
      await action(requestId)
    } catch {
      setActionError(`We couldn’t ${label} this request. Please try again.`)
    } finally {
      actionPending.current = false
      setPendingAction(null)
    }
  }

  // Load suggestions when discover tab opens
  useEffect(() => {
    if (activeTab !== 'discover' || hasLoadedSuggestions || suggestionsError) return
    let cancelled = false
    setIsLoadingSuggestions(true)
    friendsApi.getSuggestions()
      .then((res) => {
        if (cancelled) return
        setSuggestions(res || [])
        setHasLoadedSuggestions(true)
        setIsLoadingSuggestions(false)
      })
      .catch(() => {
        if (cancelled) return
        setSuggestionsError('We couldn’t load friend suggestions. Please try again.')
        setIsLoadingSuggestions(false)
      })
    return () => { cancelled = true }
  }, [activeTab, hasLoadedSuggestions, suggestionsError])

  // Debounced search for find friends
  useEffect(() => {
    if (query.length < 2) return

    let cancelled = false
    setSearchState((previous) => ({
      ...(previous.query === query ? previous : { query, items: [], hasLoaded: false }),
      isLoading: true,
      error: '',
    }))
    const timer = setTimeout(async () => {
      try {
        const results = await friendsApi.findUsers(query)
        if (!cancelled) setSearchState({ query, items: results || [], isLoading: false, hasLoaded: true, error: '' })
      } catch {
        if (!cancelled) setSearchState((previous) => ({ ...previous, isLoading: false, error: 'We couldn’t search for people. Please try again.' }))
      }
    }, 300)

    return () => { cancelled = true; clearTimeout(timer) }
  }, [query, searchAttempt])

  // Filtered friends
  const filteredFriends = friends.filter((f) => {
    if (!friendsSearchQuery) return true
    const q = friendsSearchQuery.toLowerCase()
    return (f.name || '').toLowerCase().includes(q) || (f.username || '').toLowerCase().includes(q)
  })

  return (
    <>
      {/* Tabs Bar */}
      <div className="flex bg-surface border border-line p-1 rounded-2xl text-xs font-bold sm:text-sm">
        <button
          type="button"
          onClick={() => setTab('my-friends')}
          className={`flex-1 py-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 ${
            activeTab === 'my-friends'
              ? 'bg-elevated text-white shadow-xs border border-line/60'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Users size={16} />
          <span>My Friends</span>
          <span className="text-[11px] px-1.5 py-0.2 rounded-full bg-line text-slate-300">
            {friends.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setTab('requests')}
          className={`flex-1 py-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 relative ${
            activeTab === 'requests'
              ? 'bg-elevated text-white shadow-xs border border-line/60'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Clock size={16} />
          <span>Requests</span>
          {incomingCount > 0 && (
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-brand text-on-brand font-bold animate-pulse">
              {incomingCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setTab('discover')}
          className={`flex-1 py-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 ${
            activeTab === 'discover'
              ? 'bg-elevated text-white shadow-xs border border-line/60'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <UserPlus size={16} />
          <span>Find Friends</span>
        </button>
      </div>

      {/* ──────────────── TAB 1: MY FRIENDS ──────────────── */}
      {activeTab === 'my-friends' && (
        <div className="space-y-4">
          {/* Search within friends */}
          {friends.length > 0 && (
            <div className="relative">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search your friends..."
                value={friendsSearchQuery}
                onChange={(e) => setFriendsSearchQuery(e.target.value)}
                className="w-full bg-surface border border-line rounded-xl pl-10 pr-4 py-2.5 text-sm text-ink placeholder:text-muted focus:border-brand focus:outline-none"
              />
            </div>
          )}

          {friendsError && <LoadError message={friendsError} onRetry={() => refreshFriends()} isLoading={isLoadingFriends} />}
          {(isLoadingFriends || (!hasLoadedFriends && !friendsError)) && (
            <div role="status" className="py-6 text-center text-sm text-slate-400">{hasLoadedFriends ? 'Refreshing your friends...' : 'Loading your friends...'}</div>
          )}
          {hasLoadedFriends && (filteredFriends.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {filteredFriends.map((friend) => (
                <UserCard
                  key={friend.id}
                  user={friend}
                  onActionComplete={() => refreshFriends()}
                />
              ))}
            </div>
          ) : friends.length > 0 ? (
            <Card className="p-8 text-center">
              <p className="text-sm text-slate-500">No friends match &ldquo;{friendsSearchQuery}&rdquo;</p>
            </Card>
          ) : (
            <Card className="p-8 text-center space-y-4">
              <div className="size-14 mx-auto rounded-2xl bg-brand/10 flex items-center justify-center text-brand">
                <Users size={28} />
              </div>
              <div className="max-w-xs mx-auto">
                <h3 className="text-base font-semibold text-white">Your friend circle is empty</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Connect with friends across Jashore to join group buying drops and share recommendations!
                </p>
              </div>
              <Button
                variant="drop-fire"
                size="md"
                onClick={() => setTab('discover')}
                className="gap-2"
              >
                <UserPlus size={16} />
                <span>Find Friends in Jashore</span>
              </Button>
            </Card>
          ))}
        </div>
      )}

      {/* ──────────────── TAB 2: REQUESTS ──────────────── */}
      {activeTab === 'requests' && (
        <div className="space-y-6">
          {requestsError && <LoadError message={requestsError} onRetry={() => refreshRequests()} isLoading={isLoadingRequests} />}
          {actionError && <p role="alert" className="text-sm text-danger">{actionError}</p>}
          {(isLoadingRequests || (!hasLoadedRequests && !requestsError)) && (
            <div role="status" className="py-6 text-center text-sm text-slate-400">{hasLoadedRequests ? 'Refreshing your requests...' : 'Loading your requests...'}</div>
          )}
          {hasLoadedRequests && <>
          {/* Incoming Requests */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Received Requests</span>
                <Badge variant="unlocked">{incomingRequests.length}</Badge>
              </h3>
            </div>

            {incomingRequests.length > 0 ? (
              <div className="space-y-2.5">
                {incomingRequests.map((req) => (
                  <Card key={req.id} className="p-4 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar
                        name={req.user.name}
                        src={resolveImageUrl(req.user.avatar_url || req.user.profile?.avatar_url)}
                        size="lg"
                        className="shrink-0"
                      />
                      <div className="min-w-0">
                        <h4 className="text-sm font-semibold text-white truncate">{req.user.name}</h4>
                        <p className="text-xs text-slate-400 truncate">@{req.user.username}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
                          <MapPin size={11} /> {req.user.locality || 'Jashore'}
                          {req.user.mutual_friends_count > 0 && ` • ${req.user.mutual_friends_count} mutual`}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        variant="drop-fire"
                        size="sm"
                        onClick={() => runRequestAction(acceptRequest, req.id, 'accept')}
                        isLoading={pendingAction === `accept-${req.id}`}
                        disabled={pendingAction !== null}
                        className="gap-1 text-xs"
                      >
                        <Check size={14} />
                        <span>Accept</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => runRequestAction(declineRequest, req.id, 'decline')}
                        isLoading={pendingAction === `decline-${req.id}`}
                        disabled={pendingAction !== null}
                        className="text-xs text-slate-400 hover:text-red-400 hover:border-red-500/40"
                      >
                        <X size={14} />
                        <span>Decline</span>
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-6 text-center text-xs text-slate-400">
                No pending incoming friend requests.
              </Card>
            )}
          </div>

          {/* Outgoing Requests */}
          {outgoingRequests.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                  <span>Sent Requests</span>
                  <span className="text-xs text-slate-400">({outgoingRequests.length})</span>
                </h3>
              </div>

              <div className="space-y-2.5">
                {outgoingRequests.map((req) => (
                  <Card key={req.id} className="p-3.5 flex items-center justify-between gap-3 bg-surface border-line">
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar
                        name={req.user.name}
                        src={resolveImageUrl(req.user.avatar_url || req.user.profile?.avatar_url)}
                        size="md"
                        className="shrink-0"
                      />
                      <div className="min-w-0">
                        <h4 className="text-xs font-semibold text-white truncate">{req.user.name}</h4>
                        <p className="text-[11px] text-slate-400 truncate">@{req.user.username}</p>
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => runRequestAction(cancelRequest, req.id, 'cancel')}
                      isLoading={pendingAction === `cancel-${req.id}`}
                      disabled={pendingAction !== null}
                      className="text-xs text-slate-400 hover:text-red-400 hover:border-red-500/40"
                    >
                      Cancel Request
                    </Button>
                  </Card>
                ))}
              </div>
            </div>
          )}
          </>}
        </div>
      )}

      {/* ──────────────── TAB 3: FIND FRIENDS ──────────────── */}
      {activeTab === 'discover' && (
        <div className="space-y-6">
          {/* Search Box */}
          <div className="space-y-2">
            <label htmlFor="find-friends-search" className="text-xs font-bold text-slate-300">Search People</label>
            <div className="relative">
              <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                id="find-friends-search"
                type="text"
                placeholder="Search by full name, @username, or mobile number..."
                value={discoverQuery}
                onChange={(e) => setDiscoverQuery(e.target.value)}
                className="w-full bg-surface border border-line rounded-xl pl-11 pr-4 py-3 text-sm text-ink placeholder:text-muted focus:border-brand focus:outline-none"
              />
              {isSearching && (
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 animate-pulse">
                  Searching...
                </div>
              )}
            </div>
          </div>

          {/* Search Results */}
          {discoverQuery.trim().length >= 2 && (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                Search Results {currentSearch.hasLoaded ? `(${searchResults.length})` : ''}
              </h3>
              {currentSearch.error && <LoadError message={currentSearch.error} onRetry={() => setSearchAttempt((previous) => previous + 1)} isLoading={isSearching} />}
              {isSearching && <p role="status" className="mb-3 text-sm text-slate-400">Searching for people...</p>}
              {currentSearch.hasLoaded && (searchResults.length > 0 ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  {searchResults.map((user) => (
                    <UserCard
                      key={user.id}
                      user={user}
                      onActionComplete={() => refreshRequests()}
                    />
                  ))}
                </div>
              ) : (
                <Card className="p-6 text-center text-sm text-slate-400">
                  No people found matching &ldquo;{discoverQuery}&rdquo;.
                </Card>
              ))}
            </div>
          )}

          {/* Suggestions */}
          <div>
            <div className="flex items-center gap-1.5 mb-3 text-white font-bold text-sm">
              <Sparkles size={16} className="text-amber-500" />
              <span>Suggested for You in Jashore</span>
            </div>

            {suggestionsError && <LoadError message={suggestionsError} onRetry={() => setSuggestionsError('')} isLoading={isLoadingSuggestions} />}
            {(isLoadingSuggestions || (!hasLoadedSuggestions && !suggestionsError)) && (
              <div role="status" className="py-8 text-center text-xs text-slate-400">Loading recommendations...</div>
            )}
            {hasLoadedSuggestions && (suggestions.length > 0 ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {suggestions.map((user) => (
                  <UserCard
                    key={user.id}
                    user={user}
                    onActionComplete={() => refreshRequests()}
                  />
                ))}
              </div>
            ) : (
              <Card className="p-6 text-center text-xs text-slate-400">
                No new suggestions at the moment.
              </Card>
            ))}
          </div>
        </div>
      )}
    </>
  )
}

export default function FriendsHubPage() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const location = useLocation()
  const { t } = useLocale()

  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Friends & Social Circle</h1>
        <p className="mt-1 text-sm text-slate-400">Connect with trusted friends in Jashore to unlock group discounts and share favorite picks.</p>
      </div>
      <Link to="/friend-picks" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-line bg-surface px-4 py-2.5 text-sm font-medium text-brand hover:bg-elevated">
        {t('friends.viewFriendPicks')} <ArrowUpRight size={16} aria-hidden="true" />
      </Link>
      {isLoading ? (
        <div role="status" className="py-12 text-center text-sm text-slate-400">Loading your friend circle...</div>
      ) : isAuthenticated ? (
        <FriendsContent key={user?.id ?? user?.username} />
      ) : (
        <Card className="space-y-4 p-8 text-center">
          <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-brand/10 text-brand"><Users size={28} /></div>
          <h2 className="text-base font-semibold text-white">Sign in to connect with friends</h2>
          <p className="mx-auto max-w-xs text-sm text-slate-400">See your friend circle, manage requests, and find people you know in Jashore.</p>
          <Link to="/auth" state={{ from: { pathname: location.pathname, search: location.search, hash: location.hash } }} className="inline-flex min-h-11 items-center justify-center rounded-xl bg-brand px-4 py-2.5 text-sm font-medium text-on-brand">Sign in</Link>
        </Card>
      )}
    </div>
  )
}
