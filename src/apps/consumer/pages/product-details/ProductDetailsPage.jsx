import { useState, useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Bookmark, Check, PlusCircle, ShoppingBag, Store, Users, MapPin, ShieldCheck } from 'lucide-react'
import { PageHeader } from '@/shared/patterns/PageHeader'
import { Card } from '@/shared/ui/Card'
import { Badge } from '@/shared/ui/Badge'
import { Button } from '@/shared/ui/Button'
import { useCart } from '@/features/cart/model/cartContext'
import { formatCurrency } from '@/shared/lib/formatCurrency'
import { catalogApi } from '@/features/catalog/api/catalogApi'
import { getProduct, toCartItem } from '../mockCatalog'

function ProductView({ product }) {
  const navigate = useNavigate()
  const { addItem } = useCart()
  const [isPicked, setIsPicked] = useState(false)
  const [isRequested, setIsRequested] = useState(false)
  const [selectedVariant, setSelectedVariant] = useState(
    product.variants && product.variants.length > 0 ? product.variants[0] : null
  )

  const effectivePrice = selectedVariant?.price ?? product.retailPrice ?? product.base_price

  const handleAddToCart = () => {
    const item = {
      id: selectedVariant ? `${product.id}-${selectedVariant.id}` : product.id,
      title: selectedVariant ? `${product.title} (${selectedVariant.name})` : product.title,
      price: effectivePrice,
      image: product.image,
      seller: product.seller?.name || product.seller?.store_name,
      variant: selectedVariant?.name,
    }
    addItem(item)
    navigate('/cart')
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader title="Product details" subtitle="Authentic artisan selection from Jashore." showBack />
      <div className="grid gap-6 lg:grid-cols-2 lg:gap-8">
        {/* Product Photo Gallery */}
        <div className="space-y-3">
          <div className="relative aspect-square overflow-hidden rounded-3xl border border-line bg-elevated shadow-xs">
            <img src={product.image} alt={product.title} className="h-full w-full object-cover" />
            <span className="absolute left-4 top-4">
              <Badge variant="unlocked">{product.category}</Badge>
            </span>
          </div>

          {/* Multiple gallery thumbnails if present */}
          {product.images && product.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {product.images.map((img) => (
                <div
                  key={img.id}
                  className="size-16 rounded-xl border border-line overflow-hidden shrink-0 bg-slate-100"
                >
                  <img src={img.image_url} alt="" className="size-full object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Product Details & Actions */}
        <div className="space-y-5">
          <Card className="space-y-6 p-5 sm:p-6">
            <div>
              <div className="flex items-center gap-2">
                <Badge variant="default">Verified Merchant</Badge>
                {product.is_drop_ready && (
                  <Badge variant="brand">Drop Eligible</Badge>
                )}
              </div>

              <h1 className="mt-3 text-2xl font-bold leading-tight tracking-tight text-ink sm:text-3xl">
                {product.title}
              </h1>

              <div className="mt-3 flex items-center justify-between text-xs text-muted">
                <p className="flex items-center gap-1.5 font-medium text-slate-700">
                  <Store size={15} className="text-brand" />
                  <span>{product.seller?.name || product.seller?.store_name}</span>
                </p>
                {product.seller?.locality && (
                  <span className="flex items-center gap-1 text-slate-400">
                    <MapPin size={13} />
                    <span>{product.seller.locality}, Jashore</span>
                  </span>
                )}
              </div>

              {/* Price display */}
              <div className="mt-5 border-t border-line pt-5 flex items-baseline gap-3">
                <p className="text-3xl font-extrabold tracking-tight text-ink">
                  {formatCurrency(effectivePrice)}
                </p>
                {product.compare_price > effectivePrice && (
                  <span className="text-sm text-muted line-through">
                    {formatCurrency(product.compare_price)}
                  </span>
                )}
              </div>
            </div>

            {/* Variants Selector */}
            {product.variants && product.variants.length > 0 && (
              <div className="space-y-2 border-t border-line pt-4">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Select Option / Size
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((variant) => (
                    <button
                      key={variant.id}
                      type="button"
                      onClick={() => setSelectedVariant(variant)}
                      className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                        selectedVariant?.id === variant.id
                          ? 'border-brand bg-brand-soft text-brand ring-1 ring-brand'
                          : 'border-line text-slate-600 hover:border-slate-300 bg-surface'
                      }`}
                    >
                      <span>{variant.name}</span>
                      {variant.price && (
                        <span className="ml-1 opacity-75 font-normal">
                          ({formatCurrency(variant.price)})
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Add to Cart */}
            <Button className="w-full" size="lg" onClick={handleAddToCart}>
              <ShoppingBag size={18} />
              <span>Add to Cart ({formatCurrency(effectivePrice)})</span>
            </Button>

            {/* Save to My Picks */}
            <Button
              variant={isPicked ? 'secondary' : 'outline'}
              className="w-full"
              onClick={() => setIsPicked(!isPicked)}
              aria-pressed={isPicked}
            >
              {isPicked ? <Check size={17} /> : <Bookmark size={17} />}
              <span>{isPicked ? 'Saved to My Shelf' : 'Add to My Picks Shelf'}</span>
            </Button>

            {/* Community Drop Interest Banner */}
            <div className="rounded-2xl border border-brand/20 bg-brand-soft p-4">
              <div className="flex items-center gap-2 text-brand">
                <Users size={18} />
                <h2 className="text-sm font-bold">Group Drop Discount?</h2>
              </div>
              <p className="mt-1.5 text-xs leading-relaxed text-soft">
                Signal interest for a community Drop. When enough friends join in Jashore, volume pricing tiers unlock automatically!
              </p>
              <Button
                variant="outline"
                className="mt-3 w-full border-brand/30 text-brand text-xs font-semibold"
                onClick={() => setIsRequested(!isRequested)}
                aria-pressed={isRequested}
              >
                {isRequested ? <Check size={16} /> : <PlusCircle size={16} />}
                <span>{isRequested ? 'Interest noted for next Drop' : 'Demand a Community Drop'}</span>
              </Button>
            </div>
          </Card>

          {/* Description Card */}
          <Card className="p-5 space-y-3">
            <h2 className="text-base font-bold text-ink">Product Story & Craft</h2>
            <p className="text-sm leading-relaxed text-muted whitespace-pre-line">
              {product.description || product.short_description || 'Handcrafted authentic product from local artisan makers in Jashore.'}
            </p>
            <div className="border-t border-line pt-3 flex items-center gap-2 text-xs text-slate-400">
              <ShieldCheck size={14} className="text-emerald-600" />
              <span>Direct fulfillment from verified producer in Jashore</span>
            </div>
          </Card>
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

    // Attempt to fetch from live API
    catalogApi.getProduct(id)
      .then((data) => {
        if (isMounted && data) {
          setProduct({
            id: data.id,
            title: data.title,
            slug: data.slug,
            retailPrice: data.base_price,
            base_price: data.base_price,
            compare_price: data.compare_price,
            category: data.category?.name || 'Local Goods',
            image: data.image,
            images: data.images,
            description: data.description,
            short_description: data.short_description,
            is_drop_ready: data.is_drop_ready,
            variants: data.variants,
            seller: {
              name: data.seller?.store_name,
              locality: data.seller?.locality,
            },
          })
        }
      })
      .catch(() => {
        // Fallback to mock product
        if (isMounted) {
          const fallback = getProduct(id)
          setProduct(fallback)
        }
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
      <div className="mx-auto max-w-lg py-16 text-center text-sm text-slate-400">
        Loading product details...
      </div>
    )
  }

  if (!product) {
    return (
      <Card className="mx-auto max-w-lg p-8 text-center">
        <h1 className="text-xl font-bold text-ink">This product is unavailable</h1>
        <p className="my-3 text-sm text-muted">Browse the catalog for another good find.</p>
        <Link to="/explore" className="inline-flex min-h-11 items-center text-brand font-semibold">
          Back to Explore
        </Link>
      </Card>
    )
  }

  return <ProductView key={product.id} product={product} />
}
