import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowUpRight, Bookmark, BookmarkCheck, Share2, Check, Users, Sparkles } from 'lucide-react'
import { FeedCardShell } from './FeedCardShell'
import { Button } from '@/shared/ui/Button'
import { formatCurrency } from '@/shared/lib/formatCurrency'
import { resolveImageUrl } from '@/shared/lib/mediaUrl'
import { Avatar } from '@/shared/ui/Avatar'
import { getRecommendationPath } from '@/features/referrals/model/referralAttribution'

export function RecommendationFeedCard({
  item,
  onOpenFeedback,
  onOpenSaveModal,
}) {
  const navigate = useNavigate()
  const [copied, setCopied] = useState(false)

  const product = item.product
  const commerce = item.commerce
  const recCode = commerce?.recommendation_code
  const friendsWhoPicked = item.social_context?.friends_who_picked || []
  const friendsCount = item.social_context?.friends_who_picked_count || 0
  const isSaved = item.viewer_state?.is_saved

  const productUrl = product
    ? getRecommendationPath(product, recCode)
    : '#'

  const handleShare = async (e) => {
    e.stopPropagation()
    const fullUrl = `${window.location.origin}${productUrl}`
    try {
      await navigator.clipboard.writeText(fullUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch {
      // fallback
    }
  }

  return (
    <FeedCardShell item={item} onOpenFeedback={onOpenFeedback}>
      {/* Author Commentary */}
      {item.caption && (
        <p className="mb-4 text-[15px] leading-relaxed text-ink font-normal">
          &ldquo;{item.caption}&rdquo;
        </p>
      )}

      {/* Attached Product Card */}
      {product && (
        <div
          onClick={() => navigate(productUrl)}
          className="group/product flex flex-col sm:flex-row items-start sm:items-center gap-4 rounded-2xl border border-line bg-field-bg p-3.5 transition hover:border-brand/40 hover:bg-brand/5 cursor-pointer"
        >
          <div className="relative size-20 sm:size-24 shrink-0 overflow-hidden rounded-xl border border-line bg-surface">
            <img
              src={resolveImageUrl(product.image)}
              alt={product.title}
              className="size-full object-cover transition-transform duration-300 group-hover/product:scale-105"
            />
          </div>

          <div className="min-w-0 flex-1">
            <span className="text-[11px] font-medium text-brand uppercase tracking-wider">
              {product.category || 'Featured Pick'}
            </span>
            <h3 className="line-clamp-1 text-base font-semibold text-ink group-hover/product:text-brand transition-colors">
              {product.title}
            </h3>
            {product.seller_name && (
              <p className="text-xs text-muted">Sold by {product.seller_name}</p>
            )}

            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-lg font-bold text-ink">
                {formatCurrency(commerce?.price ?? product.base_price)}
              </span>
              {commerce?.original_price && commerce.original_price > commerce.price && (
                <span className="text-xs text-muted line-through">
                  {formatCurrency(commerce.original_price)}
                </span>
              )}
            </div>
          </div>

          <div className="flex w-full sm:w-auto items-center justify-end gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-line">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                onOpenSaveModal?.(product)
              }}
              className="gap-1.5"
            >
              {isSaved ? <BookmarkCheck size={14} className="text-brand" /> : <Bookmark size={14} />}
              <span className="text-xs">{isSaved ? 'Saved' : 'Save'}</span>
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                navigate(productUrl)
              }}
              className="gap-1"
            >
              <span>{product.has_variants ? 'Choose Options' : 'View'}</span>
              <ArrowUpRight size={14} />
            </Button>
          </div>
        </div>
      )}

      {/* Friends Social Proof & Share Bar */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-line/60 pt-3">
        {friendsCount > 0 ? (
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2 overflow-hidden">
              {friendsWhoPicked.map((friend) => (
                <Avatar
                  key={friend.id}
                  src={friend.avatar_url}
                  name={friend.name}
                  size="xs"
                  className="border-2 border-surface"
                />
              ))}
            </div>
            <span className="text-xs text-muted">
              <strong className="text-ink font-semibold">
                {friendsWhoPicked[0]?.name || 'Your friend'}
              </strong>
              {friendsCount > 1 ? ` and ${friendsCount - 1} other friends picked this` : ' picked this'}
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-xs text-muted">
            <Sparkles size={13} className="text-brand" />
            <span>Curator recommendation in Jashore</span>
          </div>
        )}

        <button
          type="button"
          onClick={handleShare}
          className="flex items-center gap-1.5 text-xs font-medium text-muted hover:text-ink transition cursor-pointer"
        >
          {copied ? <Check size={14} className="text-success" /> : <Share2 size={14} />}
          <span>{copied ? 'Link Copied' : 'Share'}</span>
        </button>
      </div>
    </FeedCardShell>
  )
}
