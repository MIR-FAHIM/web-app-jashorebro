import { useNavigate } from 'react-router-dom'
import { ArrowUpRight, Bookmark, BookmarkCheck, Sparkles, MapPin } from 'lucide-react'
import { FeedCardShell } from './FeedCardShell'
import { Button } from '@/shared/ui/Button'
import { formatCurrency } from '@/shared/lib/formatCurrency'
import { resolveImageUrl } from '@/shared/lib/mediaUrl'
import { Avatar } from '@/shared/ui/Avatar'

export function CatalogFeedCard({
  item,
  onOpenFeedback,
  onOpenSaveModal,
}) {
  const navigate = useNavigate()
  const product = item.product || {}
  const commerce = item.commerce || {}
  const friendsWhoPicked = item.social_context?.friends_who_picked || []
  const friendsCount = item.social_context?.friends_who_picked_count || 0
  const isSaved = item.viewer_state?.is_saved

  const productUrl = `/products/${product.slug || product.id}`

  return (
    <FeedCardShell item={item} onOpenFeedback={onOpenFeedback}>
      <div
        onClick={() => navigate(productUrl)}
        className="group/catalog flex flex-col sm:flex-row items-start sm:items-center gap-4 rounded-2xl border border-line bg-field-bg p-4 transition hover:border-brand/40 hover:bg-brand/5 cursor-pointer"
      >
        <div className="relative size-24 sm:size-28 shrink-0 overflow-hidden rounded-xl border border-line bg-surface">
          <img
            src={resolveImageUrl(product.image || item.image)}
            alt={product.title}
            className="size-full object-cover transition-transform duration-300 group-hover/catalog:scale-105"
          />
        </div>

        <div className="min-w-0 flex-1 space-y-1.5">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-brand">
            {product.category || 'Catalog Find'}
          </span>

          <h3 className="line-clamp-1 text-base font-semibold text-ink group-hover/catalog:text-brand transition-colors">
            {product.title}
          </h3>

          {item.caption && (
            <p className="line-clamp-2 text-xs text-muted leading-relaxed">
              {item.caption}
            </p>
          )}

          <div className="flex items-baseline gap-2.5 pt-1">
            <span className="text-xl font-bold tracking-tight text-ink">
              {formatCurrency(commerce.price ?? product.base_price)}
            </span>
            {commerce.original_price && commerce.original_price > commerce.price && (
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
            className="gap-1.5 text-xs"
          >
            {isSaved ? <BookmarkCheck size={14} className="text-brand" /> : <Bookmark size={14} />}
            <span>{isSaved ? 'Saved' : 'Save'}</span>
          </Button>

          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              navigate(productUrl)
            }}
            className="gap-1 text-xs"
          >
            <span>View</span>
            <ArrowUpRight size={13} />
          </Button>
        </div>
      </div>

      {/* Friends Social Proof / Merchant Locality */}
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
              {friendsCount > 1 ? ` and ${friendsCount - 1} friends picked this` : ' picked this'}
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-xs text-muted">
            <Sparkles size={13} className="text-brand" />
            <span>Curated catalog discovery in Jashore</span>
          </div>
        )}

        {product.seller_name && (
          <span className="text-xs text-muted">
            Merchant: <strong className="text-ink">{product.seller_name}</strong>
          </span>
        )}
      </div>
    </FeedCardShell>
  )
}
