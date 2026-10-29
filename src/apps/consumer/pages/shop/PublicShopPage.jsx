import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  Store,
  ShieldCheck,
  UserCheck,
  UserPlus,
  ShoppingBag,
  Sparkles,
  Share2,
  Check,
  Truck,
  HeartHandshake,
  ArrowRight,
  AlertCircle,
} from 'lucide-react'
import { Card } from '@/shared/ui/Card'
import { Badge } from '@/shared/ui/Badge'
import { Button } from '@/shared/ui/Button'
import { PageHeader } from '@/shared/patterns/PageHeader'
import { communityApi } from '@/features/community/api/communityApi'
import { useCart, normalizeCartItem } from '@/features/cart/model/cartContext'
import { useAuth } from '@/features/auth/model/authContext'
import { formatCurrency } from '@/shared/lib/formatCurrency'
import { resolveImageUrl } from '@/shared/lib/mediaUrl'

export default function PublicShopPage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { addItem } = useCart()
  const { user, isAuthenticated } = useAuth()

  const [shop, setShop] = useState(null)
  const [listings, setListings] = useState([])
  const [isFollowing, setIsFollowing] = useState(false)
  const [followerCount, setFollowerCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [followLoading, setFollowLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [addedItemNotice, setAddedItemNotice] = useState(null)

  useEffect(() => {
    let isMounted = true
    setIsLoading(true)

    communityApi.shop.getBySlug(slug)
      .then((data) => {
        if (!isMounted) return
        setShop(data.shop)
        setListings(data.listings || [])
        setIsFollowing(Boolean(data.is_following))
        setFollowerCount(Number(data.follower_count || 0))
      })
      .catch((err) => {
        if (isMounted) setShop(null)
      })
      .finally(() => {
        if (isMounted) setIsLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [slug])

  const handleToggleFollow = async () => {
    if (!isAuthenticated) {
      navigate('/auth', { state: { from: { pathname: `/shop/${slug}` } } })
      return
    }
    if (!shop?.user_id || followLoading) return

    setFollowLoading(true)
    try {
      if (isFollowing) {
        await communityApi.social.unfollow(shop.user_id)
        setIsFollowing(false)
        setFollowerCount((prev) => Math.max(0, prev - 1))
      } else {
        await communityApi.social.follow(shop.user_id)
        setIsFollowing(true)
        setFollowerCount((prev) => prev + 1)
      }
    } catch (err) {
      // ignore follow errors
    } finally {
      setFollowLoading(false)
    }
  }

  const handleShareShop = () => {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  const handleAddToCart = (listing, buyNow = false) => {
    const product = listing.product
    if (!product) return

    const line = normalizeCartItem(product, {
      variant: null,
      purchase_mode: 'normal',
      quantity: 1,
      shop_listing_id: listing.id,
      community_shop_id: shop.id,
      shop_name: shop.name,
      custom_price: Number(listing.selling_price),
    })

    addItem(line)

    if (buyNow) {
      navigate('/checkout')
    } else {
      setAddedItemNotice(listing.id)
      setTimeout(() => setAddedItemNotice(null), 2500)
    }
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-5xl py-24 text-center text-sm text-slate-400">
        <div className="size-8 mx-auto border-3 border-brand border-t-transparent rounded-full animate-spin mb-3" />
        <span>Loading community storefront...</span>
      </div>
    )
  }

  if (!shop) {
    return (
      <Card className="mx-auto max-w-lg p-8 text-center bg-slate-900 border-slate-800 text-white space-y-3 mt-10">
        <Store size={36} className="mx-auto text-slate-500" />
        <h1 className="text-xl font-bold">Storefront not found</h1>
        <p className="text-xs text-slate-400">
          This community store may be suspended, inactive, or the URL might be mistyped.
        </p>
        <Link to="/explore" className="inline-flex min-h-11 items-center justify-center">
          <Button variant="secondary" size="sm">
            Explore JashoreBro Catalog
          </Button>
        </Link>
      </Card>
    )
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-16">
      {/* Store Banner & Brand Header */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 shadow-xl">
        {/* Banner backdrop */}
        <div className="h-36 sm:h-48 w-full bg-gradient-to-r from-orange-600/30 via-purple-600/20 to-slate-950 relative">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-brand/20 via-transparent to-transparent" />
        </div>

        {/* Store Profile Info */}
        <div className="relative px-6 pb-6 pt-0">
          <div className="-mt-14 sm:-mt-16 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div className="flex items-end gap-4">
              <div className="size-24 sm:size-28 rounded-2xl border-4 border-slate-900 bg-slate-800 overflow-hidden shadow-2xl flex items-center justify-center text-2xl font-black text-white shrink-0">
                {shop.logo_url ? (
                  <img src={shop.logo_url} alt={shop.name} className="size-full object-cover" />
                ) : (
                  <span>{shop.name.charAt(0).toUpperCase()}</span>
                )}
              </div>
              <div className="space-y-1 mb-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                    {shop.name}
                  </h1>
                  <Badge variant="unlocked" className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[10px]">
                    <ShieldCheck size={11} className="mr-1" />
                    Verified Partner
                  </Badge>
                </div>
                <p className="text-xs text-slate-400">
                  Curated by <span className="font-semibold text-slate-200">{shop.owner?.name || 'Community Seller'}</span>
                  {followerCount > 0 && ` · ${followerCount} followers`}
                </p>
              </div>
            </div>

            {/* Follow & Share Actions */}
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleShareShop}
                className="gap-1.5 border-slate-700 bg-slate-800 text-xs"
              >
                {copied ? <Check size={14} className="text-emerald-400" /> : <Share2 size={14} />}
                <span>{copied ? 'Link Copied' : 'Share Store'}</span>
              </Button>

              {user?.id !== shop.user_id && (
                <Button
                  type="button"
                  variant={isFollowing ? 'secondary' : 'primary'}
                  size="sm"
                  onClick={handleToggleFollow}
                  disabled={followLoading}
                  className="gap-1.5 text-xs font-semibold"
                >
                  {isFollowing ? (
                    <>
                      <UserCheck size={14} className="text-emerald-400" />
                      <span>Following</span>
                    </>
                  ) : (
                    <>
                      <UserPlus size={14} />
                      <span>Follow Store</span>
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>

          {shop.bio && (
            <p className="mt-4 text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              {shop.bio}
            </p>
          )}

          {/* JashoreBro Fulfillment Guarantee Bar */}
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-800 bg-slate-950/80 p-3.5 text-xs text-slate-300">
            <div className="flex items-center gap-2.5">
              <span className="flex size-7 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <Truck size={14} />
              </span>
              <div>
                <p className="font-bold text-white text-[12px]">Direct JashoreBro Fulfillment Guarantee</p>
                <p className="text-[11px] text-slate-400">
                  Every order is packed, quality-inspected, and shipped directly by JashoreBro central logistics.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-[11px] text-slate-400">
              <span className="flex items-center gap-1">
                <Check size={12} className="text-emerald-400" /> Authentic Origin
              </span>
              <span className="flex items-center gap-1">
                <Check size={12} className="text-emerald-400" /> Cash on Delivery
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Product Listings Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">Curated Collection</h2>
            <p className="text-xs text-slate-400">
              {listings.length} hand-picked authentic {listings.length === 1 ? 'item' : 'items'} available
            </p>
          </div>
        </div>

        {listings.length === 0 ? (
          <Card className="p-8 text-center bg-slate-900 border-slate-800 text-white space-y-2">
            <Sparkles size={32} className="mx-auto text-slate-600" />
            <h3 className="text-sm font-bold">No active listings yet</h3>
            <p className="text-xs text-slate-400">
              The store owner has not published any items in this showcase yet.
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {listings.map((listing) => {
              const product = listing.product
              if (!product) return null
              const isAdded = addedItemNotice === listing.id

              return (
                <Card
                  key={listing.id}
                  className="flex flex-col overflow-hidden bg-slate-900 border-slate-800 text-white hover:border-slate-700 transition-all shadow-md"
                >
                  <div className="relative aspect-4/3 w-full overflow-hidden bg-slate-950">
                    <img
                      src={resolveImageUrl(product.image || product.images?.[0]?.image_url)}
                      alt={product.title}
                      className="size-full object-cover transition-transform duration-300 hover:scale-105"
                    />
                    {(listing.caption ?? listing.curator_note) && (
                      <div className="absolute bottom-2 left-2 right-2 rounded-xl bg-slate-950/85 backdrop-blur-xs p-2 text-[11px] text-slate-200 border border-slate-800">
                        <span className="font-semibold text-brand">Seller note: </span>
                        <span>"{listing.caption ?? listing.curator_note}"</span>
                      </div>
                    )}
                  </div>

                  <div className="p-4 flex flex-1 flex-col justify-between space-y-3">
                    <div className="space-y-1">
                      <h3 className="font-bold text-sm text-white line-clamp-2 leading-snug">
                        {product.title}
                      </h3>
                      <p className="text-xs text-slate-400">
                        {product.category?.name || 'Artisan Goods'}
                      </p>
                    </div>

                    <div className="space-y-3 pt-2 border-t border-slate-800">
                      <div className="flex items-baseline justify-between">
                        <div>
                          <span className="text-lg font-black text-white">
                            {formatCurrency(listing.selling_price)}
                          </span>
                          {product.compare_price > listing.selling_price && (
                            <span className="ml-2 text-xs text-slate-500 line-through">
                              {formatCurrency(product.compare_price)}
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] font-semibold text-emerald-400">
                          In Stock
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          onClick={() => handleAddToCart(listing, false)}
                          className={`text-xs gap-1 border-slate-700 bg-slate-800 hover:bg-slate-700 ${
                            isAdded ? 'text-emerald-400 border-emerald-500/40' : ''
                          }`}
                        >
                          {isAdded ? <Check size={13} /> : <ShoppingBag size={13} />}
                          <span>{isAdded ? 'Added' : 'Add to Bag'}</span>
                        </Button>
                        <Button
                          type="button"
                          variant="primary"
                          size="sm"
                          onClick={() => handleAddToCart(listing, true)}
                          className="text-xs font-bold gap-1 bg-white text-slate-950 hover:bg-slate-200"
                        >
                          <span>Buy Now</span>
                          <ArrowRight size={13} />
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
