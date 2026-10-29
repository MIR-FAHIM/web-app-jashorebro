import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { MessageSquare, ArrowUpRight, CheckCircle2, Image as ImageIcon } from 'lucide-react'
import { FeedCardShell } from './FeedCardShell'
import { Badge } from '@/shared/ui/Badge'
import { Button } from '@/shared/ui/Button'
import { ReactionButtonsBar } from '@/features/catalog/components/comments/ReactionButtonsBar'
import { formatCurrency } from '@/shared/lib/formatCurrency'
import { resolveImageUrl } from '@/shared/lib/mediaUrl'

export function DiscussionFeedCard({
  item,
  onOpenFeedback,
}) {
  const navigate = useNavigate()
  const [userReaction, setUserReaction] = useState(item.viewer_state?.user_reaction || null)
  const [reactionsCount, setReactionsCount] = useState(item.social_context?.reactions_count || 0)

  const product = item.product
  const productUrl = product ? `/products/${product.slug || product.id}#comments` : '#'

  const handleReactionChange = ({ userReaction: newReaction, reactionsCount: newCount }) => {
    setUserReaction(newReaction)
    if (newCount !== undefined) {
      setReactionsCount(newCount)
    }
  }

  const getIntentVariant = (intent) => {
    switch (intent) {
      case 'question': return 'info'
      case 'experience': return 'unlocked'
      case 'deal': return 'fire'
      case 'alternative': return 'brand'
      default: return 'default'
    }
  }

  return (
    <FeedCardShell item={item} onOpenFeedback={onOpenFeedback}>
      {/* Intent Tag & Verification */}
      <div className="mb-2.5 flex items-center gap-2">
        {item.intent_label && (
          <Badge variant={getIntentVariant(item.intent_type)} size="sm">
            {item.intent_label}
          </Badge>
        )}
        {item.is_verified_purchase && (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-success">
            <CheckCircle2 size={13} /> Verified Buyer
          </span>
        )}
      </div>

      {/* Discussion Excerpt */}
      <p className="mb-3.5 text-[15px] leading-relaxed text-ink font-normal">
        {item.content_excerpt || item.caption}
      </p>

      {/* Attachment Image (if buyer uploaded proof) */}
      {item.attachment_url && (
        <div className="mb-4 overflow-hidden rounded-2xl border border-line bg-field-bg max-w-sm">
          <img
            src={resolveImageUrl(item.attachment_url)}
            alt="Buyer attachment"
            className="max-h-60 w-full object-cover"
          />
        </div>
      )}

      {/* Attached Product Mini Pill */}
      {product && (
        <div
          onClick={() => navigate(productUrl)}
          className="mb-4 flex items-center justify-between gap-3 rounded-2xl border border-line bg-field-bg p-2.5 transition hover:border-brand/30 hover:bg-brand/5 cursor-pointer"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <img
              src={resolveImageUrl(product.image)}
              alt=""
              className="size-11 shrink-0 rounded-lg object-cover border border-line"
            />
            <div className="min-w-0">
              <h4 className="truncate text-xs font-semibold text-ink">
                {product.title}
              </h4>
              <p className="text-xs font-bold text-brand">
                {formatCurrency(product.base_price)}
              </p>
            </div>
          </div>
          <span className="flex shrink-0 items-center gap-1 text-xs font-medium text-brand hover:underline pr-2">
            View <ArrowUpRight size={13} />
          </span>
        </div>
      )}

      {/* Reaction Bar & Replies CTA */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line/60 pt-3">
        <ReactionButtonsBar
          commentId={item.source_id}
          userReaction={userReaction}
          reactionCounts={{
            reactions_count: reactionsCount,
            helpful_count: item.social_context?.helpful_count || 0,
          }}
          onReactionChange={handleReactionChange}
        />

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => navigate(productUrl)}
          className="gap-1.5 text-xs text-muted hover:text-ink"
        >
          <MessageSquare size={14} />
          <span>
            {item.social_context?.replies_count > 0
              ? `${item.social_context.replies_count} answers`
              : 'Answer question'}
          </span>
        </Button>
      </div>
    </FeedCardShell>
  )
}
