import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Users, UserPlus, Clock, Search, MapPin, Sparkles, Check, X } from 'lucide-react'
import { Card } from '@/shared/ui/Card'
import { Button } from '@/shared/ui/Button'
import { Avatar } from '@/shared/ui/Avatar'
import { Badge } from '@/shared/ui/Badge'
import { UserCard } from '@/features/friends/components/UserCard'
import { useFriends } from '@/features/friends/model/friendsContext'
import { friendsApi } from '@/features/friends/api/friendsApi'
import { useAuth } from '@/features/auth/model/authContext'

export default function FriendsHubPage() {
  const { isAuthenticated } = useAuth()
  const [params, setParams] = useSearchParams()
  const activeTab = params.get('tab') || 'my-friends'

  const {
    friends,
    incomingRequests,
    outgoingRequests,
    incomingCount,
    isLoadingFriends,
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
  const [searchResults, setSearchResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [suggestions, setSuggestions] = useState([])
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false)

  const setTab = (tab) => {
    setParams({ tab })
  }

  // Load suggestions when discover tab opens
  useEffect(() => {
    if (activeTab === 'discover' && suggestions.length === 0) {
      setIsLoadingSuggestions(true)
      friendsApi.getSuggestions()
        .then((res) => setSuggestions(res || []))
        .catch(() => {})
        .finally(() => setIsLoadingSuggestions(false))
    }
  }, [activeTab, suggestions.length])

  // Debounced search for find friends
  useEffect(() => {
    if (!discoverQuery || discoverQuery.trim().length < 2) {
      setSearchResults([])
      return
    }

    const timer = setTimeout(async () => {
      setIsSearching(true)
      try {
        const results = await friendsApi.findUsers(discoverQuery)
        setSearchResults(results)
      } catch {
        setSearchResults([])
      } finally {
        setIsSearching(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [discoverQuery])

  // Filtered friends
  const filteredFriends = friends.filter((f) => {
    if (!friendsSearchQuery) return true
    const q = friendsSearchQuery.toLowerCase()
    return f.name.toLowerCase().includes(q) || f.username.toLowerCase().includes(q)
  })

  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-12">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Friends & Social Circle
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Connect with trusted friends in Jashore to unlock group discounts and share favorite picks.
        </p>
      </div>

      {/* Tabs Bar */}
      <div className="flex bg-slate-100 p-1 rounded-2xl text-xs font-bold sm:text-sm">
        <button
          type="button"
          onClick={() => setTab('my-friends')}
          className={`flex-1 py-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 ${
            activeTab === 'my-friends'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Users size={16} />
          <span>My Friends</span>
          <span className="text-[11px] px-1.5 py-0.2 rounded-full bg-slate-200/80 text-slate-700">
            {friends.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setTab('requests')}
          className={`flex-1 py-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 relative ${
            activeTab === 'requests'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-500 hover:text-slate-900'
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
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-500 hover:text-slate-900'
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

          {isLoadingFriends ? (
            <div className="py-12 text-center text-sm text-slate-400">Loading your friends...</div>
          ) : filteredFriends.length > 0 ? (
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
              <div className="size-14 mx-auto rounded-2xl bg-orange-100 flex items-center justify-center text-brand">
                <Users size={28} />
              </div>
              <div className="max-w-xs mx-auto">
                <h3 className="text-base font-semibold text-slate-900">Your friend circle is empty</h3>
                <p className="text-xs text-slate-500 mt-1">
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
          )}
        </div>
      )}

      {/* ──────────────── TAB 2: REQUESTS ──────────────── */}
      {activeTab === 'requests' && (
        <div className="space-y-6">
          {/* Incoming Requests */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span>Received Requests</span>
                <Badge variant="unlocked">{incomingRequests.length}</Badge>
              </h3>
            </div>

            {incomingRequests.length > 0 ? (
              <div className="space-y-2.5">
                {incomingRequests.map((req) => (
                  <Card key={req.id} className="p-4 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar name={req.user.name} size="lg" className="shrink-0" />
                      <div className="min-w-0">
                        <h4 className="text-sm font-semibold text-slate-900 truncate">{req.user.name}</h4>
                        <p className="text-xs text-slate-500 truncate">@{req.user.username}</p>
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
                        onClick={() => acceptRequest(req.id)}
                        className="gap-1 text-xs"
                      >
                        <Check size={14} />
                        <span>Accept</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => declineRequest(req.id)}
                        className="text-xs text-slate-500 hover:text-red-600"
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
                <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                  <span>Sent Requests</span>
                  <span className="text-xs text-slate-400">({outgoingRequests.length})</span>
                </h3>
              </div>

              <div className="space-y-2.5">
                {outgoingRequests.map((req) => (
                  <Card key={req.id} className="p-3.5 flex items-center justify-between gap-3 bg-slate-50/70 border-slate-200">
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar name={req.user.name} size="md" className="shrink-0" />
                      <div className="min-w-0">
                        <h4 className="text-xs font-semibold text-slate-800 truncate">{req.user.name}</h4>
                        <p className="text-[11px] text-slate-400 truncate">@{req.user.username}</p>
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => cancelRequest(req.id)}
                      className="text-xs text-slate-500 hover:text-red-600 hover:border-red-200"
                    >
                      Cancel Request
                    </Button>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ──────────────── TAB 3: FIND FRIENDS ──────────────── */}
      {activeTab === 'discover' && (
        <div className="space-y-6">
          {/* Search Box */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700">Search People</label>
            <div className="relative">
              <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
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
                Search Results ({searchResults.length})
              </h3>
              {searchResults.length > 0 ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  {searchResults.map((user) => (
                    <UserCard
                      key={user.id}
                      user={user}
                      onActionComplete={() => refreshRequests()}
                    />
                  ))}
                </div>
              ) : !isSearching ? (
                <Card className="p-6 text-center text-sm text-slate-500">
                  No people found matching &ldquo;{discoverQuery}&rdquo;.
                </Card>
              ) : null}
            </div>
          )}

          {/* Suggestions */}
          <div>
            <div className="flex items-center gap-1.5 mb-3 text-slate-900 font-bold text-sm">
              <Sparkles size={16} className="text-amber-500" />
              <span>Suggested for You in Jashore</span>
            </div>

            {isLoadingSuggestions ? (
              <div className="py-8 text-center text-xs text-slate-400">Loading recommendations...</div>
            ) : suggestions.length > 0 ? (
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
            )}
          </div>
        </div>
      )}
    </div>
  )
}
