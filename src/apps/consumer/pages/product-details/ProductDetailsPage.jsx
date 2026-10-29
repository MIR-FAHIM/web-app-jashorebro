import { useState, useEffect, useRef } from 'react'
import { Link, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import {
  Flame,
  ShoppingBag,
  Store,
  MapPin,
  Check,
  Truck,
  RotateCcw,
  Sparkles,
  ArrowRight,
  AlertCircle,
  BookmarkPlus,
} from 'lucide-react'
import { PageHeader } from '@/shared/patterns/PageHeader'
import { Card } from '@/shared/ui/Card'
import { Badge } from '@/shared/ui/Badge'
import { Button } from '@/shared/ui/Button'
import { useCart, normalizeCartItem } from '@/features/cart/model/cartContext'
import { useAuth } from '@/features/auth/model/authContext'
import { formatCurrency } from '@/shared/lib/formatCurrency'
import { resolveImageUrl } from '@/shared/lib/mediaUrl'
import { catalogApi } from '@/features/catalog/api/catalogApi'
import { SaveToPicksModal } from '@/features/community/components/SaveToPicksModal'
import { AddToShopModal } from '@/features/community/components/AddToShopModal'
import { StartDropModal } from '@/features/community/components/StartDropModal'
import { ProductCommentsSection } from '@/features/catalog/components/comments/ProductCommentsSection'
import { FriendsWhoPickedSection } from '@/features/catalog/components/friends-picked/FriendsWhoPickedSection'
import { UI_FEATURES } from '@/shared/config/features'
import { prepareReferralForCart, resolveReferralVisit } from '@/features/referrals/model/referralAttribution'
import { communityApi } from '@/features/community/api/communityApi'
import { dropFacts, formatDropDeadline } from '@/features/drops/model/dropLifecycle'

function ProductView({ product }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const { addItem, items } = useCart()
  const { isAuthenticated, isLoading: isAuthLoading, user } = useAuth()

  // Track referral parameters
  const referralCode = searchParams.get('rec') || null
  const [referralState, setReferralState] = useState({ status: 'idle', context: null })
  const [isAdding, setIsAdding] = useState(false)
  const [referralFailed, setReferralFailed] = useState(false)
  const purchaseRequest = useRef(0)
  const dropAdding = useRef(false)
  useEffect(() => {
    let current = true
    if (isAuthLoading) return
    setReferralState({ status: 'checking', context: null })
    resolveReferralVisit(product, referralCode)
      .then((context) => { if (current) setReferralState({ status: context ? 'verified' : 'none', context }) })
      .catch(() => { if (current) setReferralState({ status: 'error', context: null }) })
    return () => { current = false }
  }, [product.id, referralCode, isAuthenticated, isAuthLoading, user?.id])
  useEffect(() => () => { purchaseRequest.current += 1 }, [product.id])

  // Modals state
  const [isPicksModalOpen, setIsPicksModalOpen] = useState(false)
  const [isShopModalOpen, setIsShopModalOpen] = useState(false)
  const [isDropModalOpen, setIsDropModalOpen] = useState(false)

  const hasVariants = product.variants && product.variants.length > 0
  const [selectedVariant, setSelectedVariant] = useState(hasVariants ? product.variants[0] : null)
  const [activeImage, setActiveImage] = useState(
    selectedVariant?.image_url || product.image || product.images?.[0]?.image_url || ''
  )
  const [purchaseError, setPurchaseError] = useState('')

  // Update active image if selected variant has its own image
  const handleVariantSelect = (variant) => {
    if (isAdding) return
    setSelectedVariant(variant)
    setPurchaseError('')
    if (variant.image_url) {
      setActiveImage(variant.image_url)
    }
  }

  const effectivePrice = selectedVariant?.price ?? product.base_price ?? product.retailPrice ?? 0
  const comparePrice = selectedVariant?.compare_price ?? product.compare_price
  const effectiveStock = selectedVariant ? selectedVariant.stock_quantity : product.stock_quantity
  const hasKnownStock = product.track_inventory === true
    && effectiveStock !== null
    && effectiveStock !== undefined
    && effectiveStock !== ''
    && Number.isFinite(Number(effectiveStock))
  const isOutOfStock = hasKnownStock && Number(effectiveStock) <= 0
  const hasShippingCharge = product.is_free_shipping === false
    && product.shipping_charge !== null
    && product.shipping_charge !== undefined
    && product.shipping_charge !== ''
    && Number.isFinite(Number(product.shipping_charge))
    && Number(product.shipping_charge) > 0
  const hasReturnPolicy = typeof product.is_returnable === 'boolean'

  const handleNormalAddToCart = async (withoutReferral = false) => {
    if (isAdding) return
    if (hasVariants && !selectedVariant) {
      setPurchaseError('Please select an option before adding to cart.')
      return
    }
    if (isOutOfStock) {
      setPurchaseError('This item is currently sold out.')
      return
    }

    const requestId = ++purchaseRequest.current
    setIsAdding(true)
    setReferralFailed(false)
    setPurchaseError('')
    try {
      const baseLine = normalizeCartItem(product, { variant: selectedVariant, purchase_mode: 'normal', quantity: 1 })
      const existingLine = items.find((item) => item.lineId === baseLine.lineId)
      const source = !existingLine && withoutReferral !== true
        ? await prepareReferralForCart(product, referralCode, { existingVisit: true, context: referralState.context })
        : null
      if (purchaseRequest.current !== requestId) return
      addItem(source ? normalizeCartItem(product, { variant: selectedVariant, purchase_mode: 'normal', quantity: 1, ...source }) : baseLine)
      navigate('/cart')
    } catch {
      if (purchaseRequest.current !== requestId) return
      setReferralFailed(true)
      setPurchaseError('We couldn’t verify this recommendation. Try again, or add the product without recommendation credit.')
    } finally {
      if (purchaseRequest.current === requestId) setIsAdding(false)
    }
  }

  const handleJoinGroupBuy = async () => {
    if (dropAdding.current || isAdding) return
    if (hasVariants && !selectedVariant) {
      setPurchaseError('Please select an option for this Drop.')
      return
    }
    if (!product.active_campaign) return
    dropAdding.current = true
    const requestId = ++purchaseRequest.current
    setIsAdding(true)
    setPurchaseError('')
    try {
      const latest = await communityApi.drops.getDrop(product.active_campaign.id)
      if (purchaseRequest.current !== requestId) return
      if (!latest || Number(latest.product?.id) !== Number(product.id) || !dropFacts(latest).canOrder) throw new Error(latest?.unavailability_reason || 'This Drop is no longer accepting orders. Open its details for the latest status.')
      if (latest.variant && Number(latest.variant.id) !== Number(selectedVariant?.id)) throw new Error(`This Drop applies to ${latest.variant.name || latest.variant.title || 'a different option'}. Select that option before adding it.`)
      addItem(normalizeCartItem(product, { variant: selectedVariant, purchase_mode: 'group_buy', campaign: latest, quantity: 1 }))
      navigate('/cart')
    } catch (failure) {
      if (purchaseRequest.current === requestId) setPurchaseError(failure.message || 'Unable to check Drop availability. Please retry.')
    } finally {
      dropAdding.current = false
      if (purchaseRequest.current === requestId) setIsAdding(false)
    }
  }

  const campaign = product.active_campaign
  const campaignFacts = campaign ? dropFacts(campaign) : null

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader title="Product details" showBack />

      <div className="grid gap-6 lg:grid-cols-2 lg:gap-8 items-start">
        {/* Product Photo Gallery */}
        <div className="space-y-4 min-w-0">
          <div className="relative h-[min(26vh,12rem)] overflow-hidden rounded-3xl border border-line bg-elevated shadow-xs sm:aspect-square sm:h-auto">
            <img
              src={resolveImageUrl(activeImage || product.image)}
              alt={product.title}
              className="h-full w-full object-contain transition-all duration-300"
            />
            <div className="absolute inset-x-3 top-3 flex flex-wrap items-start justify-between gap-2">
              {product.category?.name && (
                <Badge variant="unlocked" className="max-w-full whitespace-normal break-words">{product.category.name}</Badge>
              )}
              {product.is_free_shipping === true && (
                <Badge variant="brand">Free Shipping</Badge>
              )}
            </div>
          </div>

          {/* Multiple gallery thumbnails */}
          {product.images && product.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {product.images.map((img, index) => (
                <button
                  key={img.id}
                  type="button"
                  onClick={() => setActiveImage(img.image_url)}
                  aria-label={`View product image ${index + 1}${img.alt_text ? `: ${img.alt_text}` : ''}`}
                  aria-pressed={activeImage === img.image_url}
                  className={`size-14 rounded-xl border overflow-hidden shrink-0 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-canvas sm:size-16 ${
                    activeImage === img.image_url
                      ? 'border-brand ring-2 ring-brand/30'
                      : 'border-line opacity-75 hover:opacity-100'
                  }`}
                >
                  <img src={resolveImageUrl(img.image_url)} alt="" className="size-full object-cover" />
                </button>
              ))}
            </div>
          )}

        </div>

        {/* Product Details & Actions */}
        <div className="space-y-5 min-w-0">
          <Card className="space-y-6 p-5 sm:p-6 bg-slate-900 border-slate-800 text-white">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                {product.is_group_buy_enabled && (
                  <Badge variant="brand" className="bg-orange-500/20 text-orange-400 border-orange-500/30">
                    <Flame size={12} />
                    <span>Drop Ready</span>
                  </Badge>
                )}
                {product.brand && (
                  <span className="min-w-0 break-words text-xs text-slate-400 font-semibold [overflow-wrap:anywhere]">{product.brand}</span>
                )}
              </div>

              <h1 className="mt-3 break-words text-xl font-extrabold leading-tight tracking-tight text-white [overflow-wrap:anywhere] sm:text-3xl">
                {product.title}
              </h1>

              <div className="mt-3 flex flex-wrap items-start justify-between gap-x-3 gap-y-2 text-xs text-slate-400">
                {(product.seller?.store_name || product.seller?.name) && (
                  <p className="flex min-w-0 max-w-full items-start gap-1.5 font-medium text-slate-300">
                    <Store size={15} className="shrink-0 text-orange-400" />
                    <span className="break-words [overflow-wrap:anywhere]">{product.seller.store_name || product.seller.name}</span>
                  </p>
                )}
                {product.seller?.locality && (
                  <span className="flex min-w-0 max-w-full items-start gap-1 text-slate-400">
                    <MapPin size={13} className="shrink-0" />
                    <span className="break-words [overflow-wrap:anywhere]">{product.seller.locality}</span>
                  </span>
                )}
              </div>

              {/* Price display */}
              <div className="mt-5 border-t border-slate-800 pt-5 flex flex-wrap items-baseline gap-x-3 gap-y-2">
                <p className="min-w-0 max-w-full break-words text-3xl font-black tracking-tight text-white [overflow-wrap:anywhere]">
                  {formatCurrency(effectivePrice)}
                </p>
                {comparePrice > effectivePrice && (
                  <span className="min-w-0 max-w-full break-words text-sm text-slate-400 line-through [overflow-wrap:anywhere]">
                    {formatCurrency(comparePrice)}
                  </span>
                )}
                {hasKnownStock && (
                  <div className="max-w-full text-xs font-semibold [overflow-wrap:anywhere]">
                    {isOutOfStock ? (
                      <span className="text-red-400">Out of Stock</span>
                    ) : (
                      <span className="text-emerald-400">{effectiveStock} in stock</span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Error Message */}
            {purchaseError && (
              <div role="alert" className="p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
                <AlertCircle size={15} className="text-red-400 shrink-0" />
                <span>{purchaseError}</span>
              </div>
            )}
            {referralFailed && <Button variant="outline" size="sm" disabled={isAdding} onClick={() => handleNormalAddToCart(true)}>Add without recommendation</Button>}

            {/* Variant Selector */}
            {hasVariants && (
              <fieldset className="min-w-0 space-y-2 border-t border-slate-800 pt-4">
                <legend className="text-xs font-bold text-slate-300">
                  Select an option
                </legend>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((v) => {
                    const isSelected = selectedVariant?.id === v.id
                    return (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => handleVariantSelect(v)}
                        disabled={isAdding}
                        aria-pressed={isSelected}
                        className={`min-h-11 min-w-11 max-w-full rounded-xl px-3.5 py-2 text-left text-xs font-semibold border transition-all [overflow-wrap:anywhere] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 ${
                          isSelected
                            ? 'border-orange-500 bg-orange-500/20 text-orange-400 shadow-sm'
                            : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700 hover:text-white'
                        }`}
                      >
                        <span>{v.name}</span>
                        {v.price !== null && v.price !== undefined && (
                          <span className="ml-1.5 opacity-75">· {formatCurrency(v.price)}</span>
                        )}
                      </button>
                    )
                  })}
                </div>
              </fieldset>
            )}

            {/* Standard Purchase Button */}
            {product.is_normal_purchase_enabled !== false && (
              <Button
                type="button"
                variant="primary"
                size="lg"
                disabled={isOutOfStock}
                isLoading={isAdding || referralState.status === 'checking'}
                onClick={handleNormalAddToCart}
                className="w-full font-bold gap-2"
              >
                <ShoppingBag size={18} className="shrink-0" />
                <span>{isOutOfStock ? 'Sold Out' : 'Add to cart'}</span>
              </Button>
            )}

            {/* Group Buy Campaign Callout */}
            {campaign && campaign.status === 'active' && (
              <div className="rounded-2xl border border-orange-500/40 bg-gradient-to-br from-orange-500/10 via-slate-900 to-slate-950 p-4 space-y-3">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex min-w-0 max-w-full items-start gap-2">
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-orange-500 text-white shadow-sm">
                      <Flame size={16} className="fill-white" />
                    </span>
                    <div className="min-w-0 [overflow-wrap:anywhere]">
                      <h4 className="text-xs font-bold text-white">Conditional Price Drop</h4>
                      <p className="text-[10px] text-orange-400">{campaign.title}</p>
                    </div>
                  </div>
                  <div className="min-w-0 max-w-full [overflow-wrap:anywhere]">
                    <p className="text-sm font-extrabold text-orange-400">{formatCurrency(campaign.group_price)}</p>
                    {Number(effectivePrice) > Number(campaign.group_price) && <p className="text-[10px] text-slate-400">Potential saving {formatCurrency(effectivePrice - campaign.group_price)}</p>}
                  </div>
                </div>

                {/* Progress bar */}
                <div>
                  <div className="flex flex-wrap justify-between gap-1 text-[11px] font-medium text-slate-300 mb-1">
                    <span>{campaignFacts.qualifying} qualifying buyers</span>
                    <span className="font-bold text-orange-400">{campaignFacts.progress}% toward target</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-orange-500 to-red-500"
                      style={{ width: `${campaignFacts.progress}%` }}
                    />
                  </div>
                  <p className="mt-1 text-[10px] text-slate-400 flex flex-wrap items-center justify-between gap-1">
                    <span>Target: {campaign.target_participants} distinct buyers</span>
                    <span>{campaignFacts.remaining} more needed</span>
                  </p>
                </div>

                <Button
                  type="button"
                  variant="drop-fire"
                  size="sm"
                  className="w-full min-w-0 font-bold gap-2 [overflow-wrap:anywhere]"
                  onClick={handleJoinGroupBuy}
                  disabled={isAdding || isOutOfStock || !campaignFacts.canOrder}
                  isLoading={isAdding && dropAdding.current}
                >
                  <Flame size={16} className="shrink-0" />
                  <span className="min-w-0">Add conditional order · {formatCurrency(campaign.group_price)}</span>
                </Button>
                <p className="text-[11px] leading-relaxed text-slate-400">Interest does not place an order. Accepted conditional orders count once per customer, including unpaid cash on delivery. The target confirms accepted orders and closes new orders.</p>
                {campaign.end_at && <p className="text-[11px] text-slate-400">Deadline: {formatDropDeadline(campaign.end_at)} · Bangladesh time</p>}
                {!campaignFacts.canOrder && <p className="text-[11px] text-slate-400">{campaignFacts.unavailableReason}</p>}
                <Link to={`/drops/${campaign.id}`} className="inline-flex min-h-11 items-center text-xs font-semibold text-orange-400">View Drop terms and availability</Link>
              </div>
            )}

            {/* Trust and Policy Badges */}
            {(product.is_free_shipping === true || hasShippingCharge || hasReturnPolicy) && (
              <div className="flex flex-wrap gap-x-5 gap-y-3 border-t border-slate-800 pt-4 text-xs text-slate-300">
                {(product.is_free_shipping === true || hasShippingCharge) && (
                  <div className="flex min-w-0 max-w-full items-start gap-2">
                    <Truck size={16} className="shrink-0 text-slate-400" />
                    <span className="break-words [overflow-wrap:anywhere]">{product.is_free_shipping === true ? 'Free shipping' : `Shipping ${formatCurrency(product.shipping_charge)}`}</span>
                  </div>
                )}
                {hasReturnPolicy && (
                  <div className="flex min-w-0 max-w-full items-start gap-2">
                    <RotateCcw size={16} className="shrink-0 text-slate-400" />
                    <span>{product.is_returnable ? 'Returns available' : 'Not returnable'}</span>
                  </div>
                )}
              </div>
            )}
          </Card>
        </div>
      </div>

      <div className="space-y-5 min-w-0">
          {/* Description */}
          {product.description && (
            <Card className="p-5 bg-slate-900 border-slate-800 text-white space-y-2">
              <h2 className="text-sm font-bold text-white">About this item</h2>
              <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line break-words [overflow-wrap:anywhere]">
                {product.description}
              </p>
            </Card>
          )}

          {/* Specifications List */}
          {product.specifications && product.specifications.length > 0 && (
            <Card className="p-5 bg-slate-900 border-slate-800 text-white space-y-3">
              <h2 className="text-sm font-bold text-white">Product specifications</h2>
              <dl className="grid gap-3 text-sm sm:grid-cols-2">
                {product.specifications.map((spec) => (
                  <div key={spec.id} className="min-w-0 p-2.5 rounded-lg bg-slate-950 border border-slate-800 [overflow-wrap:anywhere]">
                    <dt className="text-slate-400 text-xs">{spec.attribute_name}</dt>
                    <dd className="font-semibold text-white mt-0.5 flex items-start gap-1.5">
                      {spec.color_code && (
                        <span className="mt-1 size-3 shrink-0 rounded-full border border-slate-700" style={{ backgroundColor: spec.color_code }} />
                      )}
                      <span className="min-w-0">{spec.value}</span>
                    </dd>
                  </div>
                ))}
              </dl>
            </Card>
          )}

          {/* Community Comments & Discussions */}
          <ProductCommentsSection product={product} />

          {/* Community Commerce Engine Card */}
          <Card className="p-4 sm:p-5 bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/40 border-slate-800 text-white space-y-3 shadow-lg">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex min-w-0 max-w-full items-start gap-2">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                  <Sparkles size={15} />
                </span>
                <div className="min-w-0 [overflow-wrap:anywhere]">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    Pick it. Share it with friends.
                  </h3>
                  <p className="text-[11px] text-slate-400">Save your favorites and share your recommendations.</p>
                </div>
              </div>
              {product.is_recommendation_enabled !== false && (
                <Badge variant="unlocked" className="max-w-full whitespace-normal break-words bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[10px] [overflow-wrap:anywhere]">
                  Eligible reward: {formatCurrency(product.recommendation_commission || 0)} / sale
                </Badge>
              )}
            </div>

              {referralState.status === 'verified' && (
              <div className="inline-flex max-w-full items-start gap-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 px-3 py-2 text-xs font-semibold text-emerald-400">
                <Sparkles size={13} className="mt-0.5 shrink-0" />
                <span className="min-w-0 break-words">Recommended by {referralState.context.recommender?.name || 'a community member'}. Eligible purchases within seven days may support them.</span>
              </div>
            )}

            {product.picked_by_friends?.count > 0 && (
              <a
                href="#friends-who-picked"
                className="flex min-h-11 flex-wrap items-center justify-between gap-2 rounded-2xl bg-gradient-to-r from-emerald-500/15 via-emerald-500/10 to-transparent border border-emerald-500/30 p-3 text-xs text-emerald-300 hover:border-emerald-500/50 hover:bg-emerald-500/20 transition-all group"
              >
                <div className="flex min-w-0 max-w-full items-start gap-2">
                  <div className="flex -space-x-2 shrink-0">
                    {product.picked_by_friends.users.slice(0, 3).map((u) => (
                      <img
                        key={u.id}
                        src={u.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(u.name)}`}
                        alt={u.name}
                        className="size-5 rounded-full ring-2 ring-slate-900 object-cover"
                      />
                    ))}
                  </div>
                  <div className="min-w-0 break-words [overflow-wrap:anywhere]">
                    <span className="font-semibold text-white">
                      {product.picked_by_friends.users[0]?.name}
                    </span>
                    {product.picked_by_friends.count > 1 ? (
                      <span className="text-slate-300">
                        {' '}and {product.picked_by_friends.count - 1} other {product.picked_by_friends.count === 2 ? 'friend' : 'friends'} picked this
                      </span>
                    ) : (
                      <span className="text-slate-300"> picked this</span>
                    )}
                  </div>
                </div>
                <span className="shrink-0 flex items-center gap-1 text-xs font-bold text-emerald-400 group-hover:translate-x-0.5 transition-transform">
                  <span>See friends</span>
                  <ArrowRight size={12} />
                </span>
              </a>
            )}

            <div className={`grid grid-cols-1 gap-2 pt-1 ${UI_FEATURES.personalStores ? 'sm:grid-cols-3' : 'sm:grid-cols-2'}`}>
              {product.is_recommendation_enabled !== false && (
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    if (!isAuthenticated) {
                      navigate('/auth', { state: { from: location } })
                      return
                    }
                    setIsPicksModalOpen(true)
                  }}
                  className={`w-full text-xs font-semibold gap-1.5 ${
                    product.current_user?.has_picked
                      ? 'border-emerald-500/50 bg-emerald-950/50 text-emerald-300 hover:bg-emerald-900/60'
                      : 'border-slate-700 bg-slate-800/80 hover:bg-slate-700'
                  }`}
                >
                  {product.current_user?.has_picked ? (
                    <>
                      <Check size={14} className="text-emerald-400" />
                      <span>In Your Picks ✓</span>
                    </>
                  ) : (
                    <>
                      <BookmarkPlus size={14} className="text-emerald-400" />
                      <span>Add to Picks</span>
                    </>
                  )}
                </Button>
              )}

              {UI_FEATURES.personalStores && product.is_community_shop_enabled !== false && (
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    if (!isAuthenticated) {
                      navigate('/auth', { state: { from: location } })
                      return
                    }
                    setIsShopModalOpen(true)
                  }}
                  className="w-full text-xs font-semibold gap-1.5 border-indigo-500/40 bg-indigo-950/40 hover:bg-indigo-900/60 text-indigo-200 hover:text-white"
                >
                  <Store size={14} className="text-indigo-400" />
                  <span>List on My Store</span>
                </Button>
              )}

              {product.is_group_drop_enabled !== false && (
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    if (!isAuthenticated) {
                      navigate('/auth', { state: { from: location } })
                      return
                    }
                    setIsDropModalOpen(true)
                  }}
                  className="w-full text-xs font-semibold gap-1.5 border-slate-700 bg-slate-800/80 hover:bg-slate-700"
                >
                  <Flame size={14} className="text-orange-400" />
                  <span>Start Drop</span>
                </Button>
              )}
            </div>
          </Card>

          {/* Friends Who Picked This Section */}
          <div id="friends-who-picked">
            <FriendsWhoPickedSection
              product={product}
              onOpenPicksModal={() => {
                if (!isAuthenticated) {
                  navigate('/auth', { state: { from: location } })
                  return
                }
                setIsPicksModalOpen(true)
              }}
            />
          </div>

      </div>
      {/* Community Modals */}
      <SaveToPicksModal
        isOpen={isPicksModalOpen}
        onClose={() => setIsPicksModalOpen(false)}
        product={product}
      />
      {UI_FEATURES.personalStores && <AddToShopModal
        isOpen={isShopModalOpen}
        onClose={() => setIsShopModalOpen(false)}
        product={product}
      />}
      <StartDropModal
        isOpen={isDropModalOpen}
        onClose={() => setIsDropModalOpen(false)}
        product={product}
      />
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
        <span>Loading product details...</span>
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
