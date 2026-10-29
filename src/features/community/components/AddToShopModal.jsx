import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { Dialog } from '@/shared/ui/Dialog'
import { Button } from '@/shared/ui/Button'
import { Input } from '@/shared/ui/Input'
import { communityApi } from '../api/communityApi'
import { formatCurrency } from '@/shared/lib/formatCurrency'
import { getProductImageUrl } from '@/shared/lib/mediaUrl'
import { Store, TrendingUp, CheckCircle, ExternalLink, Sparkles } from 'lucide-react'

export function AddToShopModal({ isOpen, onClose, product, onListingAdded }) {
  if (!isOpen || !product) return null

  return <ShopListingDialog key={product.id} product={product} onClose={onClose} onListingAdded={onListingAdded} />
}

function ShopListingDialog({ onClose, product, onListingAdded }) {
  const [shop, setShop] = useState(null)
  const [isLoadingShop, setIsLoadingShop] = useState(true)
  const [shopError, setShopError] = useState('')
  const [shopAttempt, setShopAttempt] = useState(0)
  const [terms, setTerms] = useState(null)
  const [isLoadingTerms, setIsLoadingTerms] = useState(true)
  const [termsError, setTermsError] = useState('')
  const [termsAttempt, setTermsAttempt] = useState(0)
  const isMounted = useRef(false)
  const actionPending = useRef(false)

  // Shop creation state if user doesn't have one
  const [isCreatingShop, setIsCreatingShop] = useState(false)
  const [newShopName, setNewShopName] = useState('')
  const [newShopBio, setNewShopBio] = useState('')
  const [createShopError, setCreateShopError] = useState('')

  // Listing configuration
  const [sellingPrice, setSellingPrice] = useState('')
  const [curatorNote, setCuratorNote] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [listingSuccess, setListingSuccess] = useState(null)
  const [listingError, setListingError] = useState('')

  const basePrice = Number(product.base_price ?? 0)
  const isResaleConfigured = terms?.is_enabled === true && terms?.is_configured === true
  const supplierPrice = Number(terms?.supplier_allocation_price ?? 0)
  const minPrice = Math.max(1, Number(terms?.min_selling_price ?? 0))
  const maxPrice = Number(terms?.max_selling_price ?? 0)
  const feePercent = Number(terms?.platform_fee_percent ?? 0)
  const canList = isResaleConfigured && maxPrice >= minPrice

  useEffect(() => {
    isMounted.current = true
    return () => { isMounted.current = false }
  }, [])

  // A fresh dialog is mounted for each opening and product.
  useEffect(() => {
    let active = true

    communityApi.shop.getMyShop()
      .then((res) => {
        if (active) setShop(res.shop ?? res.data ?? null)
      })
      .catch((err) => {
        if (active) setShopError(err.message || 'Unable to load your store. Please try again.')
      })
      .finally(() => {
        if (active) setIsLoadingShop(false)
      })

    return () => { active = false }
  }, [shopAttempt])

  // Resale terms are protected owner data, separate from the public catalog.
  useEffect(() => {
    if (!shop) return
    let active = true

    communityApi.shop.getProductResaleTerms(product.id)
      .then((data) => {
        if (!active) return
        if (!data || typeof data.is_enabled !== 'boolean' || typeof data.is_configured !== 'boolean') {
          throw new Error('Unable to load the saved resale terms. Please try again.')
        }
        if (data.is_configured && (
          [data.supplier_allocation_price, data.min_selling_price, data.max_selling_price, data.platform_fee_percent]
            .some((value) => value == null || !Number.isFinite(Number(value)))
        )) {
          throw new Error('The resale terms response is incomplete. Please try again.')
        }
        setTerms(data)
        if (data.is_configured) {
          const floor = Math.max(1, Number(data.min_selling_price))
          const ceiling = Number(data.max_selling_price)
          setSellingPrice(String(Math.min(ceiling, Math.max(floor, Number.isFinite(basePrice) ? basePrice : floor))))
        }
      })
      .catch((err) => {
        if (active) setTermsError(err.message || 'Unable to load the saved resale terms. Please try again.')
      })
      .finally(() => {
        if (active) setIsLoadingTerms(false)
      })

    return () => { active = false }
  }, [shop, product.id, basePrice, termsAttempt])

  // Live margin calculations
  const priceNum = Number(sellingPrice)
  const isPriceValid = canList && sellingPrice.trim() !== '' && Number.isFinite(priceNum)
    && priceNum >= minPrice && priceNum <= maxPrice
    && Math.abs(priceNum * 100 - Math.round(priceNum * 100)) < 0.000001
  const grossMarkup = isPriceValid ? Math.round(Math.max(0, priceNum - supplierPrice) * 100) / 100 : 0
  const platformFee = Math.round(grossMarkup * (feePercent / 100) * 100) / 100
  const netEarnings = Math.max(0, Math.round((grossMarkup - platformFee) * 100) / 100)

  const retryShop = () => {
    setShopError('')
    setIsLoadingShop(true)
    setShopAttempt((attempt) => attempt + 1)
  }

  const retryTerms = () => {
    setTerms(null)
    setTermsError('')
    setListingError('')
    setIsLoadingTerms(true)
    setTermsAttempt((attempt) => attempt + 1)
  }

  const handleCreateShop = async (e) => {
    e.preventDefault()
    if (!newShopName.trim() || actionPending.current) return

    actionPending.current = true
    setIsCreatingShop(true)
    setCreateShopError('')

    try {
      const res = await communityApi.shop.createShop({
        name: newShopName.trim(),
        bio: newShopBio.trim() || undefined,
      })
      if (isMounted.current) setShop(res.shop)
    } catch (err) {
      if (isMounted.current) setCreateShopError(err.getFirstError?.() || err.message || 'Failed to create community shop.')
    } finally {
      actionPending.current = false
      if (isMounted.current) setIsCreatingShop(false)
    }
  }

  const handleAddListing = async (e) => {
    e.preventDefault()
    if (actionPending.current || isLoadingTerms || termsError || !canList) return
    if (!isPriceValid) {
      setListingError('Enter a retail price within the approved range, with up to two decimal places.')
      return
    }
    actionPending.current = true
    setIsSubmitting(true)
    setListingError('')

    try {
      const listing = await communityApi.shop.addListing({
        product_id: product.id,
        selling_price: priceNum,
        caption: curatorNote.trim() || undefined,
      })
      if (!isMounted.current) return
      setListingSuccess(listing)
      onListingAdded?.(listing)
    } catch (err) {
      if (isMounted.current) setListingError(err.getFirstError?.() || err.message || 'Failed to add item to your storefront.')
    } finally {
      actionPending.current = false
      if (isMounted.current) setIsSubmitting(false)
    }
  }

  const handleModalClose = () => {
    setListingSuccess(null)
    setListingError('')
    onClose()
  }

  return (
    <Dialog
      isOpen
      onClose={handleModalClose}
      title={
        listingSuccess
          ? 'Listed in Your Store!'
          : !shop && !isLoadingShop && !shopError
          ? 'Launch Your Free Store'
          : 'List on Your Storefront'
      }
      description={
        listingSuccess
          ? 'This product is now live on your personal storefront.'
          : !shop && !isLoadingShop && !shopError
          ? 'Start your personal store with one click. No inventory or shipping headaches.'
          : 'Set your retail price within approved bounds. JashoreBro handles delivery & customer care.'
      }
    >
      {isLoadingShop ? (
        <div className="py-8 text-center text-xs text-slate-400">
          <div className="size-6 mx-auto border-2 border-brand border-t-transparent rounded-full animate-spin mb-2" />
          <span>Verifying community store credentials...</span>
        </div>
      ) : shopError ? (
        <div className="space-y-3 py-4 text-center">
          <p role="alert" className="text-sm text-red-300">{shopError}</p>
          <Button variant="secondary" size="sm" onClick={retryShop}>Try Again</Button>
        </div>
      ) : listingSuccess ? (
        <div className="space-y-4">
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5 text-center">
            <div className="mx-auto flex size-12 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400">
              <CheckCircle size={28} />
            </div>
            <h4 className="mt-2 text-sm font-bold text-white">Item Live in Your Store</h4>
            <p className="mt-1 text-xs text-slate-300">
              Listed at <strong className="text-white">{formatCurrency(listingSuccess.selling_price)}</strong>.{' '}
              Estimated net margin on a sale to another customer:{' '}
              <strong className="text-emerald-400">
                {formatCurrency(netEarnings)}
              </strong>{' '}
              per item.
            </p>
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleModalClose}
              className="flex-1"
            >
              Continue Browsing
            </Button>
            {shop && (
              <Link to={`/shop/${shop.slug}`} className="flex-1">
                <Button type="button" variant="primary" size="sm" className="w-full gap-1.5">
                  <ExternalLink size={14} />
                  <span>View My Store</span>
                </Button>
              </Link>
            )}
          </div>
        </div>
      ) : !shop ? (
        /* Create Shop Form */
        <form onSubmit={handleCreateShop} className="space-y-4">
          {createShopError && (
            <div className="rounded-xl border border-red-500/30 bg-red-950/50 p-3 text-xs text-red-300">
              {createShopError}
            </div>
          )}

          <div className="rounded-2xl border border-brand/30 bg-brand/10 p-4 text-xs text-slate-300 space-y-1.5">
            <p className="font-bold text-white flex items-center gap-1.5">
              <Store size={15} className="text-brand" />
              <span>Turn your network into a thriving micro-business</span>
            </p>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Curate products from master artisans, set your margins, and share your personal shop URL.
              All warehousing, packing, bKash payments, and deliveries are handled by JashoreBro.
            </p>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Store Name *</label>
            <Input
              type="text"
              required
              placeholder="e.g. Maya's Artisan Finds"
              value={newShopName}
              onChange={(e) => setNewShopName(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Short Bio / Tagline</label>
            <Input
              type="text"
              placeholder="e.g. Hand-picked authentic goodies from local artisans"
              value={newShopBio}
              onChange={(e) => setNewShopBio(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
            <Button type="button" variant="secondary" size="sm" onClick={handleModalClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={isCreatingShop || !newShopName.trim()}
              className="gap-1.5"
            >
              <Sparkles size={14} />
              <span>{isCreatingShop ? 'Setting up...' : 'Create My Store'}</span>
            </Button>
          </div>
        </form>
      ) : (
        /* Add Listing Form */
        <form onSubmit={handleAddListing} className="space-y-4">
          {listingError && (
            <div className="rounded-xl border border-red-500/30 bg-red-950/50 p-3 text-xs text-red-300">
              {listingError}
            </div>
          )}

          <div className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-900/60 p-3">
            <img
              src={getProductImageUrl(product)}
              alt=""
              className="size-14 rounded-xl object-cover border border-slate-700 bg-slate-950"
            />
            <div className="min-w-0 flex-1">
              <h4 className="truncate text-sm font-bold text-white">{product.title}</h4>
              <p className="text-xs text-slate-400">
                Store: <span className="text-white font-semibold">{shop.name}</span>
              </p>
            </div>
          </div>

          {isLoadingTerms ? (
            <p role="status" className="py-3 text-center text-xs text-slate-400">Loading your saved resale terms...</p>
          ) : termsError ? (
            <div className="rounded-xl border border-red-500/30 bg-red-950/50 p-3 text-xs text-red-300 space-y-2">
              <p role="alert">{termsError}</p>
              <Button variant="secondary" size="sm" onClick={retryTerms}>Retry Loading Terms</Button>
            </div>
          ) : !canList && (
            <div className="rounded-2xl border border-amber-500/30 bg-amber-950/40 p-4 text-xs text-amber-200 space-y-1.5">
              <p className="font-bold text-white flex items-center gap-1.5">
                <Store size={15} className="text-amber-400" />
                <span>{terms?.is_enabled === false ? 'Community storefront listing is disabled' : 'Resale terms need an admin update'}</span>
              </p>
              <p className="text-[11px] leading-relaxed text-amber-300">
                {terms?.message || 'Ask the admin to set an approved retail price range that allows a selling price of at least ৳1.'}
              </p>
              <Button variant="secondary" size="sm" onClick={retryTerms}>Refresh Saved Terms</Button>
            </div>
          )}

          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <label className="font-semibold text-slate-300">Your Retail Selling Price</label>
              <span className="text-[11px] text-slate-400">
                {canList ? `Allowed: ${formatCurrency(minPrice)} – ${formatCurrency(maxPrice)}` : 'Pricing bounds unavailable'}
              </span>
            </div>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">৳</span>
              <input
                type="number"
                min={canList ? minPrice : undefined}
                max={canList ? maxPrice : undefined}
                step="0.01"
                required
                disabled={!canList || isSubmitting}
                value={sellingPrice}
                onChange={(e) => setSellingPrice(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-900 py-2.5 pl-8 pr-4 text-sm font-bold text-white focus:border-brand focus:outline-none disabled:opacity-50"
              />
            </div>
            {canList && (
              <input
                type="range"
                min={minPrice}
                max={maxPrice}
                step="0.01"
                disabled={isSubmitting}
                value={isPriceValid ? priceNum : minPrice}
                onChange={(e) => setSellingPrice(e.target.value)}
                className="w-full accent-brand mt-1"
              />
            )}
          </div>

          {/* Live Commercial Breakdown */}
          {canList && isPriceValid ? (
            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-3.5 space-y-2 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Customer Selling Price:</span>
                <span className="font-bold text-white">{formatCurrency(priceNum)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Supplier Wholesale Allocation:</span>
                <span className="text-slate-300">-{formatCurrency(supplierPrice)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Gross Markup:</span>
                <span className="text-slate-200">{formatCurrency(grossMarkup)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Platform Fulfillment Fee ({feePercent}%):</span>
                <span className="text-slate-400">-{formatCurrency(platformFee)}</span>
              </div>
              <div className="border-t border-slate-800 pt-2 flex justify-between items-center font-bold">
                <span className="text-emerald-400 flex items-center gap-1">
                  <TrendingUp size={14} />
                  <span>Estimated Net Earning / Item:</span>
                </span>
                <span className="text-base text-emerald-400">{formatCurrency(netEarnings)}</span>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-3 text-center text-xs text-slate-400">
              {canList ? 'Enter a price within the approved range to preview your estimated earnings.' : 'An earnings preview will appear when approved resale terms are available.'}
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">
              Personal Recommendation Note <span className="text-slate-500">(Optional)</span>
            </label>
            <input
              type="text"
              disabled={!canList || isSubmitting}
              maxLength={1000}
              placeholder="e.g. My top personal favorite for festive cooking!"
              value={curatorNote}
              onChange={(e) => setCuratorNote(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-brand focus:outline-none disabled:opacity-50"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
            <Button type="button" variant="secondary" size="sm" onClick={handleModalClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={isSubmitting || isLoadingTerms || Boolean(termsError) || !isPriceValid}
              className="gap-1.5"
            >
              <Store size={14} />
              <span>{isSubmitting ? 'Publishing...' : 'Publish to My Store'}</span>
            </Button>
          </div>
        </form>
      )}
    </Dialog>
  )
}
