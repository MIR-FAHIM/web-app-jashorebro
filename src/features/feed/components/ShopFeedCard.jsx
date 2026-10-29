import { useNavigate } from 'react-router-dom'
import { Store, ArrowUpRight, CheckCircle2, ShoppingBag } from 'lucide-react'
import { FeedCardShell } from './FeedCardShell'
import { Button } from '@/shared/ui/Button'
import { formatCurrency } from '@/shared/lib/formatCurrency'
import { resolveImageUrl } from '@/shared/lib/mediaUrl'

export function ShopFeedCard({
  item,
  onOpenFeedback,
}) {
  const navigate = useNavigate()
  const shop = item.shop || {}
  const shopUrl = shop.slug ? `/shop/${shop.slug}` : '#'
  const showcaseItems = shop.showcase_items || []

  return (
    <FeedCardShell item={item} onOpenFeedback={onOpenFeedback}>
      {/* Shop Info Container */}
      <div className="mb-4">
        {/* Banner if available */}
        {shop.banner_url && (
          <div className="mb-3.5 h-28 w-full overflow-hidden rounded-2xl border border-line bg-surface">
            <img
              src={resolveImageUrl(shop.banner_url)}
              alt={shop.name}
              className="size-full object-cover"
            />
          </div>
        )}

        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <Store size={16} className="text-brand shrink-0" />
              <h3 className="truncate text-base font-bold text-ink">
                {shop.name}
              </h3>
              {shop.is_verified && (
                <span className="inline-flex items-center gap-0.5 text-[11px] font-medium text-brand">
                  <CheckCircle2 size={13} /> Verified
                </span>
              )}
            </div>
            {item.caption && (
              <p className="mt-1 text-xs text-muted line-clamp-2 leading-relaxed">
                {item.caption}
              </p>
            )}
          </div>

          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={() => navigate(shopUrl)}
            className="shrink-0 gap-1 text-xs"
          >
            <span>Visit Shop</span>
            <ArrowUpRight size={13} />
          </Button>
        </div>
      </div>

      {/* Horizontal Showcase Items Row */}
      {showcaseItems.length > 0 && (
        <div className="rounded-2xl border border-line bg-field-bg p-3">
          <div className="mb-2 flex items-center justify-between text-xs text-muted">
            <span className="font-semibold text-ink flex items-center gap-1">
              <ShoppingBag size={12} className="text-brand" /> Top Shop Items
            </span>
            <span>{showcaseItems.length} curated picks</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {showcaseItems.map((prod) => (
              <div
                key={prod.id || prod.product_id}
                onClick={() => navigate(shopUrl)}
                className="group/item flex flex-col overflow-hidden rounded-xl border border-line bg-surface p-2 transition hover:border-brand/40 cursor-pointer"
              >
                <div className="aspect-square w-full overflow-hidden rounded-lg bg-field-bg mb-1.5">
                  <img
                    src={resolveImageUrl(prod.image)}
                    alt=""
                    className="size-full object-cover transition-transform duration-300 group-hover/item:scale-105"
                  />
                </div>
                <h5 className="truncate text-xs font-medium text-ink group-hover/item:text-brand">
                  {prod.title}
                </h5>
                <p className="text-xs font-bold text-brand">
                  {formatCurrency(prod.price)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </FeedCardShell>
  )
}
