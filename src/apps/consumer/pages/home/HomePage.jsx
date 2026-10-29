import { useState, useEffect, useCallback, useRef } from 'react'
import { useLocale } from '@/shared/i18n/LocaleProvider'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  ArrowUpRight,
  Users,
  Flame,
  Sparkles,
  TrendingUp,
  UserCheck,
  Loader2,
  AlertCircle,
  UserPlus,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Compass,
  BookmarkPlus,
  CircleHelp,
} from 'lucide-react'
import { Card } from '@/shared/ui/Card'
import { Button } from '@/shared/ui/Button'
import { Dialog } from '@/shared/ui/Dialog'
import { communityApi } from '@/features/community/api/communityApi'
import { catalogApi } from '@/features/catalog/api/catalogApi'
import { useAuth } from '@/features/auth/model/authContext'
import {
  RecommendationFeedCard,
  DiscussionFeedCard,
  DropFeedCard,
  ShopFeedCard,
  CatalogFeedCard,
  FeedFeedbackModal,
} from '@/features/feed/components'
import { SaveToPicksModal } from '@/features/community/components/SaveToPicksModal'
import { UI_FEATURES } from '@/shared/config/features'

const HOME_GUIDE_STEPS = [
  {
    id: 'drop-price',
    Icon: Compass,
    title: 'Drop Price',
    description: 'অনেক সময় দোকানের নির্ধারিত দাম ক্রেতার কাছে বেশি মনে হয়, আবার বিক্রেতার পক্ষেও একটি পণ্যের অর্ডারের জন্য দাম কমানো কঠিন। উভয় পক্ষের এই সমস্যা সমাধানে JashoreBro এনেছে Drop Product—যেখানে সবাই মিলে একসঙ্গে পণ্য কিনলে, বড় অর্ডারের সুযোগে বিক্রেতাও দিতে পারেন আকর্ষণীয় ছাড়!',
    details: 'অনেক সময় দোকানের নির্ধারিত দাম ক্রেতার কাছে বেশি মনে হয়, আবার বিক্রেতার পক্ষেও একটি পণ্যের অর্ডারের জন্য দাম কমানো কঠিন। উভয় পক্ষের এই সমস্যা সমাধানে JashoreBro এনেছে Drop Product—যেখানে সবাই মিলে একসঙ্গে পণ্য কিনলে, বড় অর্ডারের সুযোগে বিক্রেতাও দিতে পারেন আকর্ষণীয় ছাড়!',
  },
  {
    id: 'friends',
    Icon: Users,
    title: 'Friends’ Picks',
    banglaTitle: 'বন্ধুদের পছন্দ দেখুন',
    description: 'বন্ধুরা কোন পণ্য পছন্দ করছে দেখুন, তাদের মতামত জানুন এবং নিজের অভিজ্ঞতা শেয়ার করুন।',
    details: 'বন্ধুদের সাথে যুক্ত হয়ে তাদের সেভ করা পণ্য ও রেকমেন্ডেশন দেখুন। পরিচিত মানুষের পছন্দ থেকে নিজের জন্য ভালো পণ্য খুঁজে নিন।',
  },
  {
    id: 'picks',
    Icon: BookmarkPlus,
    title: 'Build Your Picks',
    banglaTitle: 'নিজের পছন্দ সাজান',
    description: 'পছন্দের পণ্য My Picks-এ রাখুন এবং কেন ভালো লাগে তা বন্ধুদের জানান।',
    details: 'পছন্দের পণ্য My Picks-এ যোগ করুন, নিজের মতামত লিখুন এবং বন্ধুদের সাথে শেয়ার করুন। আপনার প্রোফাইলেই সবাই আপনার পছন্দের সংগ্রহ দেখতে পাবে।',
  },
]

export default function HomePage() {
  const { t } = useLocale()
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated } = useAuth()

  // Feed control states
  const [activeTab, setActiveTab] = useState('for_you') // 'for_you' | 'following' | 'trending'
  const [friendsOnly, setFriendsOnly] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [categories, setCategories] = useState([])

  // Data & pagination states
  const [feedItems, setFeedItems] = useState([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [error, setError] = useState(null)
  const [requiresAuth, setRequiresAuth] = useState(false)

  // Returning visitor hero collapse state
  const [hasVisitedBefore] = useState(() => {
    try {
      return Boolean(localStorage.getItem('jb_has_visited_feed'))
    } catch {
      return false
    }
  })
  const [isHeroExpanded, setIsHeroExpanded] = useState(false)

  // Modals state
  const [isGuideOpen, setIsGuideOpen] = useState(false)
  const [feedbackItem, setFeedbackItem] = useState(null)
  const [saveModalProduct, setSaveModalProduct] = useState(null)

  // Telemetry session ID
  const sessionIdRef = useRef(`sess_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`)

  // Remember the visit while keeping the first-visit introduction visible.
  useEffect(() => {
    try {
      localStorage.setItem('jb_has_visited_feed', '1')
    } catch {
      // ignore storage errors
    }
  }, [])

  // Load categories on mount
  useEffect(() => {
    let mounted = true
    catalogApi.getCategories()
      .then((data) => {
        if (mounted && Array.isArray(data)) {
          setCategories(data)
        }
      })
      .catch(() => {})
    return () => { mounted = false }
  }, [])

  // Load feed items
  const fetchFeed = useCallback(async (pageNum = 1, append = false) => {
    if (pageNum === 1) {
      setIsLoading(true)
      setError(null)
      setRequiresAuth(false)
    } else {
      setIsLoadingMore(true)
    }

    try {
      const params = {
        tab: activeTab,
        category: selectedCategory !== 'all' ? selectedCategory : undefined,
        friends_only: friendsOnly ? '1' : undefined,
        page: pageNum,
        per_page: 12,
      }

      let res
      if (activeTab === 'following') {
        if (!isAuthenticated) {
          setRequiresAuth(true)
          setFeedItems([])
          setIsLoading(false)
          return
        }
        res = await communityApi.feed.getFollowingFeed(params)
      } else if (activeTab === 'trending') {
        res = await communityApi.feed.getTrendingFeed(params)
      } else {
        res = await communityApi.feed.getCommunityFeed(params)
      }

      if (res.requires_auth) {
        setRequiresAuth(true)
        setFeedItems([])
        setIsLoading(false)
        return
      }

      const receivedItems = res.data || []
      const items = UI_FEATURES.personalStores
        ? receivedItems
        : receivedItems.filter((item) => !['shop', 'store', 'storefront', 'community_shop'].includes(item.type))
      const moreAvailable = Boolean(res.meta?.has_more ?? (receivedItems.length >= 12))

      setFeedItems((prev) => (append ? [...prev, ...items] : items))
      setHasMore(moreAvailable)
      setPage(pageNum)

      // Send telemetry impressions in background for new items
      if (items.length > 0) {
        const impressions = items.map((item, idx) => ({
          feed_item_id: item.feed_item_id || `item_${item.id}`,
          content_type: item.type || 'drop',
          source_id: item.source_id || item.id,
          tab: activeTab,
          position: (pageNum - 1) * 12 + idx,
          event_type: 'view',
        }))
        communityApi.feed.addImpressions(impressions, sessionIdRef.current).catch(() => {})
      }
    } catch (err) {
      setError(err?.message || 'Failed to load community discovery feed.')
      if (!append) setFeedItems([])
    } finally {
      setIsLoading(false)
      setIsLoadingMore(false)
    }
  }, [activeTab, selectedCategory, friendsOnly, isAuthenticated])

  // Reload feed whenever filters change
  useEffect(() => {
    fetchFeed(1, false)
  }, [fetchFeed])

  const handleLoadMore = () => {
    if (!isLoadingMore && hasMore) {
      fetchFeed(page + 1, true)
    }
  }

  // Handle feedback applied: remove suppressed item or author
  const handleFeedbackApplied = (feedItemId, action) => {
    if (action === 'hide' || action === 'mute_topic') {
      setFeedItems((prev) => prev.filter((i) => i.feed_item_id !== feedItemId))
    } else if (action === 'mute_author') {
      const targetItem = feedItems.find((i) => i.feed_item_id === feedItemId)
      const authorId = targetItem?.actor?.id
      if (authorId) {
        setFeedItems((prev) => prev.filter((i) => i.actor?.id !== authorId))
      } else {
        setFeedItems((prev) => prev.filter((i) => i.feed_item_id !== feedItemId))
      }
    }
  }

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight text-ink">{t('community.heading')}</h1>
      {/* ─── Hero Banner (Compact for returning users) ─── */}
      {!hasVisitedBefore || isHeroExpanded ? (
        <section
          id="jashorebro-intro"
          aria-labelledby="jashorebro-intro-heading"
          className="relative overflow-hidden rounded-3xl border border-line bg-surface p-5 sm:p-7"
        >
          <div className="pointer-events-none absolute -right-12 -top-16 h-64 w-64 rounded-full bg-brand/10 blur-3xl" />
          <div className="relative">
            <div className="mb-4 flex items-start justify-between gap-3">
              <span lang="en" className="inline-flex items-center gap-2 text-xs font-semibold text-brand">
                <Sparkles size={14} className="shrink-0" aria-hidden="true" />
                JashoreBro · Your community marketplace
              </span>
              {hasVisitedBefore && (
                <button
                  type="button"
                  onClick={() => setIsHeroExpanded(false)}
                  aria-expanded="true"
                  aria-controls="jashorebro-intro"
                  className="flex min-h-11 shrink-0 items-center gap-1 rounded-lg px-2 text-xs text-muted transition hover:bg-elevated hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                >
                  <span lang="bn">সংক্ষিপ্ত করুন</span>
                  <ChevronUp size={14} aria-hidden="true" />
                </button>
              )}
            </div>
            <h2 id="jashorebro-intro-heading" lang="en" className="text-3xl font-bold leading-tight tracking-tight text-ink sm:text-4xl">
              Discover. Connect.<br />
              <span className="text-brand">Pick Together.</span>
            </h2>
            <p lang="en" className="mt-3 max-w-2xl text-base font-medium leading-7 text-ink">
              JashoreBro is a Social Community Shopping Experience
            </p>
            <p lang="bn" className="mt-2 max-w-2xl text-sm leading-7 text-soft">
              JashoreBro-তে পণ্য খুঁজুন, My Picks-এ নিজের পছন্দ রাখুন এবং বন্ধুদের পছন্দ ও মতামত জানুন।
            </p>

            <ol className="mt-5 grid gap-3 sm:grid-cols-3">
              {HOME_GUIDE_STEPS.map(({ id, Icon, title, banglaTitle, description }) => (
                <li key={id} className="flex items-start gap-3 rounded-2xl border border-line bg-canvas/50 p-4 sm:block">
                  <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand sm:mb-3">
                    <Icon size={18} aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <h2 lang="en" className="text-sm font-semibold text-ink">{title}</h2>
                    {banglaTitle && <p lang="bn" className="mt-1 text-sm font-medium leading-6 text-brand">{banglaTitle}</p>}
                    <p lang="bn" className="mt-2 text-sm leading-7 text-soft">{description}</p>
                  </div>
                </li>
              ))}
            </ol>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Button onClick={() => navigate('/explore?tab=products')} size="md" className="gap-2">
                <Compass size={16} aria-hidden="true" />
                <span lang="en">Explore Products</span>
                <span aria-hidden="true">·</span>
                <span lang="bn">পণ্য দেখুন</span>
              </Button>
              <Button
                variant="outline"
                size="md"
                onClick={() => setIsGuideOpen(true)}
                aria-haspopup="dialog"
                className="gap-2"
              >
                <CircleHelp size={16} aria-hidden="true" />
                <span lang="en">How It Works</span>
                <span aria-hidden="true">·</span>
                <span lang="bn">যেভাবে কাজ করে</span>
              </Button>
            </div>
          </div>
        </section>
      ) : (
        /* Compact banner for returning users */
        <section id="jashorebro-intro" aria-label="About JashoreBro" className="flex items-center justify-between gap-3 rounded-2xl border border-line bg-surface px-4 py-3">
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-brand/10 text-brand">
              <Sparkles size={15} aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p lang="en" className="text-xs font-semibold text-ink">Discover. Connect. Pick Together.</p>
              <p lang="bn" className="mt-1 text-xs leading-6 text-soft">পণ্য খুঁজুন, নিজের পছন্দ রাখুন, বন্ধুদের পছন্দ দেখুন।</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsHeroExpanded(true)}
            aria-expanded="false"
            aria-controls="jashorebro-intro"
            className="flex min-h-11 shrink-0 items-center gap-1 rounded-lg px-2 text-xs font-semibold text-brand transition hover:bg-brand/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            <span lang="bn">বিস্তারিত</span>
            <ChevronDown size={14} aria-hidden="true" />
          </button>
        </section>
      )}

      {/* ─── Feed Navigation Bar: Tabs + Filters ─── */}
      <section className="space-y-3 sticky top-16 z-20 bg-canvas/90 backdrop-blur-md pt-2 pb-1">
        {/* Top Tab Bar */}
        <div className="flex items-center justify-between gap-3 border-b border-line pb-2 flex-wrap">
          <div className="flex items-center gap-1 sm:gap-2" role="tablist" aria-label="Feed Tabs">
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'for_you'}
              onClick={() => setActiveTab('for_you')}
              className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs sm:text-sm font-semibold transition cursor-pointer ${
                activeTab === 'for_you'
                  ? 'bg-ink text-canvas shadow-sm'
                  : 'text-muted hover:text-ink hover:bg-field-bg'
              }`}
            >
              <Sparkles size={15} />
              <span>For You</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'following'}
              onClick={() => setActiveTab('following')}
              className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs sm:text-sm font-semibold transition cursor-pointer ${
                activeTab === 'following'
                  ? 'bg-ink text-canvas shadow-sm'
                  : 'text-muted hover:text-ink hover:bg-field-bg'
              }`}
            >
              <UserCheck size={15} />
              <span>Following</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'trending'}
              onClick={() => setActiveTab('trending')}
              className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs sm:text-sm font-semibold transition cursor-pointer ${
                activeTab === 'trending'
                  ? 'bg-ink text-canvas shadow-sm'
                  : 'text-muted hover:text-ink hover:bg-field-bg'
              }`}
            >
              <TrendingUp size={15} />
              <span>Trending</span>
            </button>
          </div>

          {/* Friends Only Filter Toggle */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                if (!isAuthenticated && !friendsOnly) {
                  navigate('/auth', { state: { from: location } })
                  return
                }
                setFriendsOnly(!friendsOnly)
              }}
              className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition cursor-pointer ${
                friendsOnly
                  ? 'border-brand bg-brand/10 text-brand shadow-sm shadow-brand/10'
                  : 'border-line bg-surface text-muted hover:border-line-hover hover:text-ink'
              }`}
            >
              <Users size={13} />
              <span>Friends Only</span>
              {friendsOnly && <span className="size-1.5 rounded-full bg-brand ml-0.5" />}
            </button>
          </div>
        </div>

        {/* Dynamic Category Filter Pills */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none" aria-label="Filter by category">
          <button
            type="button"
            onClick={() => setSelectedCategory('all')}
            className={`min-h-8 shrink-0 whitespace-nowrap rounded-full px-3.5 text-xs font-medium transition cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-field-bg text-ink border border-field-border font-semibold'
                : 'border border-line bg-surface text-muted hover:text-ink'
            }`}
          >
            All Finds
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id || cat.slug}
              type="button"
              onClick={() => setSelectedCategory(cat.slug)}
              className={`min-h-8 shrink-0 whitespace-nowrap rounded-full px-3.5 text-xs font-medium transition cursor-pointer ${
                selectedCategory === cat.slug
                  ? 'bg-field-bg text-ink border border-field-border font-semibold'
                  : 'border border-line bg-surface text-muted hover:text-ink'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </section>

      {/* ─── Feed Content Section ─── */}
      <section aria-label="Community Feed Items" className="space-y-5">
        {/* Loading Initial State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20 space-y-3">
            <Loader2 className="size-8 animate-spin text-brand" />
            <p className="text-xs text-muted font-medium">Curating your discovery feed...</p>
          </div>
        )}

        {/* Error State */}
        {!isLoading && error && (
          <Card className="p-8 text-center space-y-3">
            <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-danger-soft text-danger">
              <AlertCircle size={22} />
            </div>
            <h3 className="text-base font-semibold text-ink">Could not load discovery feed</h3>
            <p className="text-xs text-muted max-w-sm mx-auto">{error}</p>
            <Button variant="outline" size="sm" onClick={() => fetchFeed(1, false)}>
              <RefreshCw size={14} className="mr-1.5" /> Try Again
            </Button>
          </Card>
        )}

        {/* Unauthenticated Following State */}
        {!isLoading && requiresAuth && (
          <Card className="p-8 text-center space-y-4">
            <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-brand/10 text-brand">
              <UserPlus size={22} />
            </div>
            <h3 className="text-base font-semibold text-ink">
              {friendsOnly ? 'Sign in to view your friends’ picks' : 'Sign in to view curators you follow'}
            </h3>
            <p className="mx-auto max-w-sm text-xs text-muted leading-relaxed">
              Connect with your friends and local curators in Jashore to see authentic recommendations and discussions tailored to your circle.
            </p>
            <div className="pt-1">
              <Button onClick={() => navigate('/auth', { state: { from: location } })} size="sm">
                Log In
              </Button>
            </div>
          </Card>
        )}

        {/* Empty State */}
        {!isLoading && !error && !requiresAuth && feedItems.length === 0 && (
          <Card className="p-8 text-center space-y-3">
            <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-field-bg text-muted">
              <Flame size={22} />
            </div>
            <h3 className="text-base font-semibold text-ink">
              {friendsOnly
                ? 'No activity from your friends yet'
                : activeTab === 'following'
                ? 'No posts from curators you follow'
                : 'No community activity found in this category'}
            </h3>
            <p className="mx-auto max-w-md text-xs text-muted leading-relaxed">
              {friendsOnly
                ? 'Your friends haven’t shared picks in this category yet. Explore the Friends tab to connect with them.'
                : activeTab === 'following'
                ? 'The people you follow haven’t shared new picks here yet. Explore the For You feed for product recommendations.'
                : 'Explore the product catalog, save your favorites, and share a pick with your friends.'}
            </p>
            <div className="pt-2 flex justify-center gap-2">
              {friendsOnly ? (
                <Button size="sm" onClick={() => navigate('/friends')}>
                  Find Friends
                </Button>
              ) : (
                <Button size="sm" onClick={() => { setActiveTab('for_you'); setSelectedCategory('all'); }}>
                  Explore All Finds
                </Button>
              )}
            </div>
          </Card>
        )}

        {/* Mixed Feed Cards */}
        {!isLoading && !error && (feedItems.length > 0 || hasMore) && (
          <div className="space-y-4">
            {feedItems.map((item) => {
              const key = item.feed_item_id || `${item.type || 'item'}_${item.id || item.source_id}`

              switch (item.type) {
                case 'recommendation':
                  return (
                    <RecommendationFeedCard
                      key={key}
                      item={item}
                      onOpenFeedback={(it) => setFeedbackItem(it)}
                      onOpenSaveModal={(prod) => setSaveModalProduct(prod)}
                    />
                  )

                case 'discussion':
                  return (
                    <DiscussionFeedCard
                      key={key}
                      item={item}
                      onOpenFeedback={(it) => setFeedbackItem(it)}
                    />
                  )

                case 'drop':
                  return (
                    <DropFeedCard
                      key={key}
                      item={item}
                      onOpenFeedback={(it) => setFeedbackItem(it)}
                    />
                  )

                case 'shop':
                  return UI_FEATURES.personalStores ? (
                    <ShopFeedCard
                      key={key}
                      item={item}
                      onOpenFeedback={(it) => setFeedbackItem(it)}
                    />
                  ) : null

                case 'catalog':
                  return (
                    <CatalogFeedCard
                      key={key}
                      item={item}
                      onOpenFeedback={(it) => setFeedbackItem(it)}
                      onOpenSaveModal={(prod) => setSaveModalProduct(prod)}
                    />
                  )

                default:
                  // Fallback to Drop card for backwards-compatibility
                  return (
                    <DropFeedCard
                      key={key}
                      item={item}
                      onOpenFeedback={(it) => setFeedbackItem(it)}
                    />
                  )
              }
            })}

            {/* Pagination / Load More */}
            {hasMore && (
              <div className="flex justify-center pt-4 pb-8">
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  disabled={isLoadingMore}
                  onClick={handleLoadMore}
                  className="min-w-44 gap-2"
                >
                  {isLoadingMore ? (
                    <>
                      <Loader2 size={16} className="animate-spin text-brand" />
                      <span>Loading more...</span>
                    </>
                  ) : (
                    <>
                      <span>Load More Finds</span>
                      <ArrowUpRight size={16} />
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        )}
      </section>

      {/* ─── Modals ─── */}
      <Dialog
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
        title="How JashoreBro Works"
        description={<span lang="bn">পণ্য খুঁজুন, নিজের পছন্দ সাজান, বন্ধুদের পছন্দ দেখুন—তিনটি সহজ ধাপে শুরু করুন।</span>}
        className="max-w-xl"
      >
        <ol className="space-y-5">
          {HOME_GUIDE_STEPS.map(({ id, title, banglaTitle, details }, index) => (
            <li key={id} className="flex items-start gap-3">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand/10 text-sm font-semibold text-brand" aria-hidden="true">
                {index + 1}
              </span>
              <div className="min-w-0">
                <h3 lang="en" className="text-sm font-semibold text-ink">{title}</h3>
                {banglaTitle && <p lang="bn" className="mt-1 text-sm font-medium leading-6 text-brand">{banglaTitle}</p>}
                <p lang="bn" className="mt-2 text-sm leading-7 text-soft">{details}</p>
              </div>
            </li>
          ))}
        </ol>
        <div className="mt-6 flex flex-col gap-3 border-t border-line pt-5 sm:flex-row">
          <Button onClick={() => { setIsGuideOpen(false); navigate('/explore?tab=products') }}>
            <Compass size={16} aria-hidden="true" />
            <span lang="en">Explore Products</span>
            <span aria-hidden="true">·</span>
            <span lang="bn">পণ্য দেখুন</span>
          </Button>
          <Button variant="outline" onClick={() => { setIsGuideOpen(false); navigate('/my-picks') }}>
            <BookmarkPlus size={16} aria-hidden="true" />
            <span lang="en">My Picks</span>
            <span aria-hidden="true">·</span>
            <span lang="bn">নিজের পছন্দ</span>
          </Button>
        </div>
      </Dialog>

      <FeedFeedbackModal
        isOpen={Boolean(feedbackItem)}
        onClose={() => setFeedbackItem(null)}
        item={feedbackItem}
        onFeedbackApplied={handleFeedbackApplied}
      />

      <SaveToPicksModal
        isOpen={Boolean(saveModalProduct)}
        onClose={() => setSaveModalProduct(null)}
        product={saveModalProduct}
      />
    </div>
  )
}
