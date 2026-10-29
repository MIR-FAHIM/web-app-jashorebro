import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight, HeartHandshake, Package, Quote, Star } from 'lucide-react'
import { Avatar } from '@/shared/ui/Avatar'
import { formatCurrency } from '@/shared/lib/formatCurrency'
import { getProductImageUrl, resolveImageUrl } from '@/shared/lib/mediaUrl'
import { getRecommendationPath } from '@/features/referrals/model/referralAttribution'
import { useAuth } from '@/features/auth/model/authContext'

export function FriendPickedProductCard({ pick, friend }) {
  const { user } = useAuth()
  const [failedImage, setFailedImage] = useState(null)
  const product = pick.product
  const name = friend.name || friend.username || 'Your friend'
  const firstName = name.split(' ')[0]
  const productKey = product?.slug || product?.id
  const imageUrl = getProductImageUrl(product)
  const title = product?.title || 'Product unavailable'
  const hasPrice = product?.base_price !== null && product?.base_price !== undefined && product?.base_price !== '' && Number.isFinite(Number(product.base_price))
  const category = typeof product?.category === 'string' ? product.category : product?.category?.name
  const recommendationEnabled = product?.is_recommendation_enabled !== false && product?.is_recommendation_enabled !== 0 && product?.is_recommendation_enabled !== '0'
  const code = recommendationEnabled ? pick.recommendation_code : null
  const hasReward = Number(product?.recommendation_commission) > 0
  const isSelf = user?.id && String(user.id) === String(pick.user_id ?? friend.id)
  const isPublic = [true, 1, '1'].includes(pick.is_public)
  const maySupportFriend = Boolean(code && isPublic && !isSelf && hasReward && pick.is_support_eligible !== false)
  const productPath = productKey
    ? getRecommendationPath(product, code)
    : null

  const productImage = (
    <>
      {imageUrl && failedImage !== imageUrl ? (
        <img
          src={imageUrl}
          alt={title}
          loading="lazy"
          onError={() => setFailedImage(imageUrl)}
          className="h-full w-full object-cover transition-transform duration-300 motion-safe:group-hover:scale-[1.03]"
        />
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-muted">
          <Package size={36} strokeWidth={1.25} aria-hidden="true" />
          <span className="text-xs">Image unavailable</span>
        </div>
      )}
      {pick.is_featured && (
        <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full border border-line bg-canvas/95 px-2.5 py-1 text-xs font-medium text-brand">
          <Star size={12} aria-hidden="true" /> Featured pick
        </span>
      )}
    </>
  )

  return (
    <article className="flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border border-line bg-surface">
      {productPath ? (
        <Link to={productPath} className="group relative block aspect-[4/3] overflow-hidden bg-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand" aria-label={`View ${title}`}>
          {productImage}
        </Link>
      ) : (
        <div className="relative aspect-[4/3] overflow-hidden bg-elevated">{productImage}</div>
      )}

      <div className="flex flex-1 flex-col p-4">
        {category && <p className="mb-1.5 text-xs text-muted">{category}</p>}
        <h3 className="text-base font-semibold leading-snug text-ink">
          {productPath ? (
            <Link to={productPath} className="rounded-sm transition-colors hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand">{title}</Link>
          ) : title}
        </h3>
        <p className="mt-2 text-lg font-semibold text-ink">
          {hasPrice ? formatCurrency(product.base_price) : <span className="text-sm font-normal text-muted">{productPath ? 'See product for price' : 'This product is no longer available'}</span>}
        </p>

        <div className="my-4 rounded-xl border border-line bg-canvas/60 p-3">
          <div className="flex items-center gap-2">
            <Avatar src={resolveImageUrl(friend.avatar_url)} name={name} size="xs" />
            <p className="min-w-0 truncate text-xs text-soft">Picked by <span className="font-medium text-ink">{name}</span></p>
          </div>
          {pick.personal_caption && (
            <div className="mt-2.5 flex items-start gap-2">
              <Quote size={13} className="mt-0.5 shrink-0 text-brand" aria-hidden="true" />
              <p className="break-words whitespace-pre-line text-sm leading-relaxed text-soft">{pick.personal_caption}</p>
            </div>
          )}
        </div>

        <div className="mt-auto space-y-3">
          {maySupportFriend && productPath && (
            <p className="flex items-center gap-1.5 text-xs text-success">
              <HeartHandshake size={14} className="shrink-0" aria-hidden="true" />
              <span>May support {firstName}</span>
            </p>
          )}
          {productPath && (
            <Link to={productPath} className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-elevated px-4 py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-brand hover:text-on-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-surface">
              {maySupportFriend ? 'Shop this pick' : 'View product'}
              <ArrowUpRight size={16} aria-hidden="true" />
            </Link>
          )}
        </div>
      </div>
    </article>
  )
}
