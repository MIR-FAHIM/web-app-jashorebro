import { useState, useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  Flame,
  ShoppingBag,
  Store,
  MapPin,
  Check,
  ShieldCheck,
  Truck,
  RotateCcw,
  Sparkles,
  Users,
  Clock,
  ArrowRight,
  AlertCircle,
} from 'lucide-react'
import { PageHeader } from '@/shared/patterns/PageHeader'
import { Card } from '@/shared/ui/Card'
import { Badge } from '@/shared/ui/Badge'
import { Button } from '@/shared/ui/Button'
import { useCart, normalizeCartItem } from '@/features/cart/model/cartContext'
import { formatCurrency } from '@/shared/lib/formatCurrency'
import { catalogApi } from '@/features/catalog/api/catalogApi'

function ProductView({ product }) {
  const navigate = useNavigate()
  const { addItem } = useCart()

  const hasVariants = product.variants && product.variants.length > 0
  const [selectedVariant, setSelectedVariant] = useState(hasVariants ? product.variants[0] : null)
  const [activeImage, setActiveImage] = useState(
    selectedVariant?.image_url || product.image || product.images?.[0]?.image_url || ''
  )
  const [purchaseError, setPurchaseError] = useState('')

  // Update active image if selected variant has its own image
  const handleVariantSelect = (variant) => {
    setSelectedVariant(variant)
    setPurchaseError('')
    if (variant.image_url) {
      setActiveImage(variant.image_url)
    }
  }

  const effectivePrice = selectedVariant?.price ?? product.base_price ?? product.retailPrice ?? 0
  const effectiveStock = selectedVariant ? selectedVariant.stock_quantity : (product.stock_quantity ?? 0)
  const isOutOfStock = product.track_inventory && effectiveStock <= 0

  const handleNormalAddToCart = () => {
    if (hasVariants && !selectedVariant) {
      setPurchaseError('Please select an option before adding to cart.')
      return
    }
    if (isOutOfStock) {
      setPurchaseError('This item is currently sold out.')
      return
    }

    const line = normalizeCartItem(product, {
      variant: selectedVariant,
      purchase_mode: 'normal',
      quantity: 1,
    })

    addItem(line)
    navigate('/cart')
  }

  const handleJoinGroupBuy = () => {
    if (hasVariants && !selectedVariant) {
      setPurchaseError('Please select an option before joining the drop.')
      return
    }
    if (!product.active_campaign) return

    const line = normalizeCartItem(product, {
      variant: selectedVariant,
      purchase_mode: 'group_buy',
      campaign: product.active_campaign,
      quantity: 1,
    })

    addItem(line)
    navigate('/checkout')
  }

  const campaign = product.active_campaign

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader title="Product details" subtitle="Authentic artisan selection from Jashore." showBack />

      <div className="grid gap-6 lg:grid-cols-2 lg:gap-8">
        {/* Product Photo Gallery */}
        <div className="space-y-3">
          <div className="relative aspect-square overflow-hidden rounded-3xl border border-line bg-elevated shadow-xs">
            <img
              src={activeImage || product.image}
              alt={product.title}
              className="h-full w-full object-cover transition-all duration-300"
            />
            {product.category?.name && (
              <span className="absolute left-4 top-4">
                <Badge variant="unlocked">{product.category.name}</Badge>
              </span>
            )}
            {product.is_free_shipping && (
              <span className="absolute right-4 top-4">
                <Badge variant="brand">Free Shipping</Badge>
              </span>
            )}
          </div>

          {/* Multiple gallery thumbnails */}
          {product.images && product.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {product.images.map((img) => (
                <button
                  key={img.id}
                  type="button"
                  onClick={() => setActiveImage(img.image_url)}
                  className={`size-16 rounded-xl border overflow-hidden shrink-0 transition-all ${
                    activeImage === img.image_url
                      ? 'border-brand ring-2 ring-brand/30 scale-105'
                      : 'border-line opacity-75 hover:opacity-100'
                  }`}
                >
                  <img src={img.image_url} alt="" className="size-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Details & Actions */}
        <div className="space-y-5">
          <Card className="space-y-6 p-5 sm:p-6 bg-slate-900 border-slate-800 text-white">
            <div>
              <div className="flex items-center gap-2">
                <Badge variant="default" className="bg-slate-800 text-slate-300 border-slate-700">
                  <ShieldCheck size={12} className="text-emerald-400" />
                  <span>Verified Merchant</span>
                </Badge>
                {product.is_group_buy_enabled && (
                  <Badge variant="brand" className="bg-orange-500/20 text-orange-400 border-orange-500/30">
                    <Flame size={12} />
                    <span>Drop Ready</span>
                  </Badge>
                )}
                {product.brand && (
                  <span className="text-xs text-slate-400 font-semibold">{product.brand}</span>
                )}
              </div>

              <h1 className="mt-3 text-2xl font-extrabold leading-tight tracking-tight text-white sm:text-3xl">
                {product.title}
              </h1>

              <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
                <p className="flex items-center gap-1.5 font-medium text-slate-300">
                  <Store size={15} className="text-orange-400" />
                  <span>{product.seller?.store_name || product.seller?.name || 'Jashore Producer'}</span>
                </p>
                {product.seller?.locality && (
                  <span className="flex items-center gap-1 text-slate-500">
                    <MapPin size={13} />
                    <span>{product.seller.locality}, Jashore</span>
                  </span>
                )}
              </div>

              {/* Price display */}
              <div className="mt-5 border-t border-slate-800 pt-5 flex items-baseline gap-3">
                <p className="text-3xl font-black tracking-tight text-white">
                  {formatCurrency(effectivePrice)}
                </p>
                {product.compare_price > effectivePrice && (
                  <span className="text-sm text-slate-500 line-through">
                    {formatCurrency(product.compare_price)}
                  </span>
                )}
                <div className="ml-auto text-xs font-semibold">
                  {isOutOfStock ? (
                    <span className="text-red-400">Out of Stock</span>
                  ) : (
                    <span className="text-emerald-400">{effectiveStock} in stock</span>
                  )}
                </div>
              </div>
            </div>

            {/* Error Message */}
            {purchaseError && (
              <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
                <AlertCircle size={15} className="text-red-400 shrink-0" />
                <span>{purchaseError}</span>
              </div>
            )}

            {/* Variant Selector */}
            {hasVariants && (
              <div className="space-y-2 border-t border-slate-800 pt-4">
                <label className="block text-xs font-bold text-slate-300">
                  Select Option:
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((v) => {
                    const isSelected = selectedVariant?.id === v.id
                    return (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => handleVariantSelect(v)}
                        className={`rounded-xl px-3.5 py-2 text-xs font-semibold border transition-all ${
                          isSelected
                            ? 'border-orange-500 bg-orange-500/20 text-orange-400 shadow-sm'
                            : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700 hover:text-white'
                        }`}
                      >
                        <span>{v.name}</span>
                        {v.price && (
                          <span className="ml-1.5 opacity-75">· {formatCurrency(v.price)}</span>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Group Buy Campaign Callout */}
            {campaign && campaign.status === 'active' && (
              <div className="rounded-2xl border border-orange-500/40 bg-gradient-to-br from-orange-500/10 via-slate-900 to-slate-950 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex size-7 items-center justify-center rounded-lg bg-orange-500 text-white shadow-sm">
                      <Flame size={16} className="fill-white" />
                    </span>
                    <div>
                      <h4 className="text-xs font-bold text-white">Active Community Drop</h4>
                      <p className="text-[10px] text-orange-400">{campaign.title}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-extrabold text-orange-400">{formatCurrency(campaign.group_price)}</p>
                    <p className="text-[10px] text-slate-400">Save {formatCurrency(effectivePrice - campaign.group_price)}</p>
                  </div>
                </div>

                {/* Progress bar */}
                <div>
                  <div className="flex justify-between text-[11px] font-medium text-slate-300 mb-1">
                    <span>{campaign.distinct_participants} joined</span>
                    <span className="font-bold text-orange-400">{campaign.progress_percent}% unlocked</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-orange-500 to-red-500"
                      style={{ width: `${campaign.progress_percent}%` }}
                    />
                  </div>
                  <p className="mt-1 text-[10px] text-slate-400 flex items-center justify-between">
                    <span>Target: {campaign.target_participants} distinct buyers</span>
                    <span>{campaign.remaining_needed} more needed</span>
                  </p>
                </div>

                <Button
                  type="button"
                  variant="drop-fire"
                  size="sm"
                  className="w-full font-bold gap-2"
                  onClick={handleJoinGroupBuy}
                >
                  <Flame size={16} />
                  <span>Join Volume Drop at {formatCurrency(campaign.group_price)}</span>
                </Button>
              </div>
            )}

            {/* Standard Purchase Button */}
            {product.is_normal_purchase_enabled !== false && (
              <Button
                type="button"
                variant="primary"
                size="lg"
                disabled={isOutOfStock}
                onClick={handleNormalAddToCart}
                className="w-full font-bold gap-2 bg-white text-slate-950 hover:bg-slate-200"
              >
                <ShoppingBag size={18} />
                <span>{isOutOfStock ? 'Sold Out' : 'Add to Cart / Buy Now'}</span>
              </Button>
            )}

            {/* Trust and Policy Badges */}
            <div className="grid grid-cols-2 gap-3 border-t border-slate-800 pt-4 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <Truck size={16} className="text-slate-500" />
                <span>{product.is_free_shipping ? 'Free Shipping' : `Shipping BDT ${product.shipping_charge ?? 60}`}</span>
              </div>
              <div className="flex items-center gap-2">
                <RotateCcw size={16} className="text-slate-500" />
                <span>{product.is_returnable ? `${product.return_window_days ?? 7}-day returns` : 'Final sale'}</span>
              </div>
            </div>
          </Card>

          {/* Specifications List */}
          {product.specifications && product.specifications.length > 0 && (
            <Card className="p-5 bg-slate-900 border-slate-800 text-white space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Product Specifications
              </h3>
              <dl className="grid grid-cols-2 gap-3 text-xs">
                {product.specifications.map((spec) => (
                  <div key={spec.id} className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                    <dt className="text-slate-500 text-[11px]">{spec.attribute_name}</dt>
                    <dd className="font-bold text-white mt-0.5 flex items-center gap-1.5">
                      {spec.color_code && (
                        <span className="size-3 rounded-full border border-slate-700" style={{ backgroundColor: spec.color_code }} />
                      )}
                      <span>{spec.value}</span>
                    </dd>
                  </div>
                ))}
              </dl>
            </Card>
          )}

          {/* Description */}
          {product.description && (
            <Card className="p-5 bg-slate-900 border-slate-800 text-white space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                About this Item
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                {product.description}
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

export default function ProductDetailsPage() {
  const { id } = useParams()
  const [product, setProduct] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    setIsLoading(true)

    catalogApi.getProduct(id)
      .then((data) => {
        if (isMounted && data) {
          setProduct(data)
        }
      })
      .catch(() => {
        if (isMounted) setProduct(null)
      })
      .finally(() => {
        if (isMounted) setIsLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [id])

  if (isLoading) {
    return (
      <div className="mx-auto max-w-lg py-20 text-center text-sm text-slate-400">
        <div className="size-8 mx-auto border-3 border-orange-500 border-t-transparent rounded-full animate-spin mb-3" />
        <span>Loading artisan product specifications...</span>
      </div>
    )
  }

  if (!product) {
    return (
      <Card className="mx-auto max-w-lg p-8 text-center bg-slate-900 border-slate-800 text-white space-y-3">
        <h1 className="text-xl font-bold">This product is unavailable</h1>
        <p className="text-xs text-slate-400">
          The requested item may be archived or temporarily unlisted by the producer.
        </p>
        <Link to="/explore" className="inline-flex min-h-11 items-center justify-center">
          <Button variant="secondary" size="sm">
            Back to Catalog
          </Button>
        </Link>
      </Card>
    )
  }

  return <ProductView key={product.id} product={product} />
}
