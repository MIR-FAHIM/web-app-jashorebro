import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import {
  MessageSquare,
  Sparkles,
  HelpCircle,
  Tag,
  Repeat,
  CheckCircle2,
  Flame,
  ArrowUpDown,
  RefreshCw,
  SlidersHorizontal,
} from 'lucide-react'
import { Card } from '@/shared/ui/Card'
import { Button } from '@/shared/ui/Button'
import { Badge } from '@/shared/ui/Badge'
import { formatCurrency } from '@/shared/lib/formatCurrency'
import { CommentCard } from './CommentCard'
import { CommentComposer } from './CommentComposer'
import { commentApi } from '../../api/commentApi'

const FILTER_PILLS = [
  { id: 'all', label: 'All Community Feed' },
  { id: 'experience', label: '⭐ Real Experiences' },
  { id: 'question', label: '❓ Questions' },
  { id: 'deal', label: '🏷️ Deal Suggestions' },
  { id: 'alternative', label: '🔄 Alternatives' },
  { id: 'verified', label: '✓ Verified Buyers' },
]

const SORT_OPTIONS = [
  { id: 'latest', label: 'Latest First' },
  { id: 'most_helpful', label: 'Most Helpful' },
  { id: 'most_reacted', label: 'Most Reacted' },
  { id: 'oldest', label: 'Oldest First' },
]

export function ProductCommentsSection({ product }) {
  const [comments, setComments] = useState([])
  const [summary, setSummary] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [activeFilter, setActiveFilter] = useState('all')
  const [activeSort, setActiveSort] = useState('latest')

  const productId = product.id

  const loadSummary = useCallback(async () => {
    try {
      const sumData = await commentApi.getSummary(productId)
      setSummary(sumData)
    } catch {
      // Quiet fail
    }
  }, [productId])

  const loadComments = useCallback(async (targetPage = 1, append = false) => {
    if (append) {
      setIsLoadingMore(true)
    } else {
      setIsLoading(true)
    }

    try {
      const typeParam = activeFilter === 'verified' || activeFilter === 'all' ? '' : activeFilter
      const verifiedParam = activeFilter === 'verified'

      const res = await commentApi.getComments(productId, {
        page: targetPage,
        per_page: 15,
        sort: activeSort,
        type: typeParam,
        verified_only: verifiedParam,
      })

      if (res && res.data) {
        setComments((prev) => (append ? [...prev, ...res.data] : res.data))
        setPage(targetPage)
        setHasMore(Boolean(res.meta?.has_more))
      }
    } catch {
      // Keep existing comments on error
    } finally {
      setIsLoading(false)
      setIsLoadingMore(false)
    }
  }, [productId, activeFilter, activeSort])

  useEffect(() => {
    loadSummary()
  }, [loadSummary])

  useEffect(() => {
    loadComments(1, false)
  }, [loadComments])

  const handleCommentCreated = (newComment) => {
    setComments((prev) => [newComment, ...prev])
    loadSummary()
  }

  const handleCommentUpdated = (updated) => {
    setComments((prev) =>
      prev.map((c) => (c.id === updated.id ? { ...c, ...updated } : c))
    )
  }

  const handleCommentDeleted = (deletedId) => {
    setComments((prev) => prev.filter((c) => c.id !== deletedId))
    loadSummary()
  }

  const handleReplyAdded = (parentId, newReply) => {
    setComments((prev) =>
      prev.map((c) => {
        if (c.id === parentId) {
          const currentReplies = c.replies || []
          return {
            ...c,
            replies_count: (c.replies_count || 0) + 1,
            replies: [...currentReplies, newReply],
          }
        }
        return c
      })
    )
    loadSummary()
  }

  return (
    <div id="product-community-center" className="space-y-4 pt-2 min-w-0 max-w-full">
      {/* Section Header & Metrics */}
      <Card className="p-4 bg-slate-900 border-slate-800 text-white space-y-3.5">
        <div className="space-y-2.5">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="flex size-8 items-center justify-center rounded-xl bg-orange-500/15 text-orange-400 border border-orange-500/30 shrink-0">
              <MessageSquare size={17} />
            </span>
            <div className="min-w-0 flex-1">
              <h2 className="text-sm font-black tracking-tight text-white truncate">
                Community Discussion & Feedback
              </h2>
              <p className="text-[11px] text-slate-400 truncate">
                Experiences, questions, alternatives & deals
              </p>
            </div>
          </div>

          {/* Social Stats Counter Pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-[11px] font-semibold text-slate-300">
              💬 {summary?.total_comments ?? comments.length} Discussions
            </span>
            {summary?.verified_purchases_count > 0 && (
              <span className="px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-[11px] font-semibold text-emerald-400">
                ✓ {summary.verified_purchases_count} Verified Buyers
              </span>
            )}
            {summary?.total_reactions > 0 && (
              <span className="px-2.5 py-1 rounded-lg bg-orange-500/15 border border-orange-500/30 text-[11px] font-semibold text-orange-400">
                ❤️ {summary.total_reactions} Reactions
              </span>
            )}
          </div>
        </div>

        {/* Live Community Drop Link Banner */}
        {summary?.active_drop && (
          <div className="p-3 rounded-xl bg-gradient-to-r from-orange-950/70 via-slate-950 to-orange-950/40 border border-orange-500/40 flex items-center justify-between gap-2.5 min-w-0">
            <div className="flex items-center gap-2 min-w-0">
              <span className="size-7 rounded-lg bg-orange-500 text-white flex items-center justify-center shrink-0 shadow-xs shadow-orange-600/30">
                <Flame size={15} className="fill-white" />
              </span>
              <div className="min-w-0">
                <p className="font-extrabold text-[11px] text-white truncate">
                  {summary.active_drop.title}
                </p>
                <p className="text-[10px] text-orange-300 truncate">
                  Target: {summary.active_drop.remaining_needed} more needed for{' '}
                  <span className="font-bold text-white">
                    {formatCurrency(summary.active_drop.group_price)}
                  </span>
                </p>
              </div>
            </div>

            <Link
              to={`/drops/${summary.active_drop.campaign_id}`}
              className="inline-flex items-center justify-center text-[11px] font-bold px-2.5 py-1 rounded-lg bg-orange-600 hover:bg-orange-500 text-white transition-colors shrink-0 shadow-xs"
            >
              <span>Join Drop</span>
            </Link>
          </div>
        )}
      </Card>

      {/* Main Comment Composer */}
      <CommentComposer
        productId={productId}
        onCommentCreated={handleCommentCreated}
      />

      {/* Filter and Sort Toolbar */}
      <div className="space-y-2 min-w-0">
        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none min-w-0">
          {FILTER_PILLS.map((pill) => (
            <button
              key={pill.id}
              type="button"
              onClick={() => setActiveFilter(pill.id)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold shrink-0 transition-colors ${
                activeFilter === pill.id
                  ? 'bg-orange-600 text-white shadow-xs'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {pill.label}
            </button>
          ))}
        </div>

        {/* Sort Selector Bar */}
        <div className="flex items-center justify-between text-[11px] text-slate-400 px-0.5">
          <span>Sort discussions</span>
          <div className="flex items-center gap-1.5 shrink-0">
            <ArrowUpDown size={12} className="text-slate-500" />
            <select
              value={activeSort}
              onChange={(e) => setActiveSort(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-[11px] text-slate-300 focus:outline-none focus:border-orange-500"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Comments List */}
      <div className="space-y-3.5">
        {isLoading ? (
          <div className="py-12 text-center text-xs text-slate-400 space-y-2">
            <RefreshCw size={22} className="animate-spin text-orange-500 mx-auto" />
            <p>Loading community conversations...</p>
          </div>
        ) : comments.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-slate-900 border border-slate-800 space-y-2 text-slate-400">
            <MessageSquare size={32} className="mx-auto text-slate-600" />
            <p className="font-bold text-white text-xs">No comments yet in this category</p>
            <p className="text-[11px] max-w-sm mx-auto text-slate-500">
              Be the first to share your experience, ask a question, or discuss pricing with the Jashore community!
            </p>
          </div>
        ) : (
          comments.map((comment) => (
            <CommentCard
              key={comment.id}
              comment={comment}
              productId={productId}
              onCommentUpdated={handleCommentUpdated}
              onCommentDeleted={handleCommentDeleted}
              onReplyAdded={handleReplyAdded}
            />
          ))
        )}

        {/* Load More Trigger */}
        {hasMore && !isLoading && (
          <div className="pt-2 text-center">
            <Button
              variant="secondary"
              size="sm"
              disabled={isLoadingMore}
              onClick={() => loadComments(page + 1, true)}
              className="text-xs font-bold border-slate-700 bg-slate-900 text-slate-300 hover:text-white px-5"
            >
              {isLoadingMore ? (
                <span className="flex items-center gap-1.5">
                  <RefreshCw size={13} className="animate-spin" />
                  <span>Loading more...</span>
                </span>
              ) : (
                <span>Load More Discussions</span>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
