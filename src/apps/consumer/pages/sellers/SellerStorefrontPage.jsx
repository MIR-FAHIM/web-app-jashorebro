import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Store, MapPin, Star, ShieldCheck, ArrowUpRight, Phone, Mail, ArrowLeft } from 'lucide-react'
import { Card } from '@/shared/ui/Card'
import { Badge } from '@/shared/ui/Badge'
import { Button } from '@/shared/ui/Button'
import { formatCurrency } from '@/shared/lib/formatCurrency'
import { catalogApi } from '@/features/catalog/api/catalogApi'

export default function SellerStorefrontPage() {
  const { slug } = useParams()
  const [data, setData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    setIsLoading(true)

    catalogApi.getSeller(slug)
      .then((res) => {
        if (isMounted) setData(res)
      })
      .catch(() => {})
      .finally(() => {
        if (isMounted) setIsLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [slug])

  if (isLoading) {
    return <div className="py-20 text-center text-sm text-slate-400">Loading storefront...</div>
  }

  if (!data || !data.seller) {
    return (
      <Card className="mx-auto max-w-md p-8 text-center space-y-4">
        <h2 className="text-lg font-bold text-slate-900">Producer Not Found</h2>
        <p className="text-xs text-slate-500">This store is not available or undergoing verification.</p>
        <Link to="/merchants">
          <Button variant="outline">Browse All Producers</Button>
        </Link>
      </Card>
    )
  }

  const { seller, products } = data

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-12">
      {/* Back button */}
      <Link to="/merchants" className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900">
        <ArrowLeft size={14} /> Back to Producers
      </Link>

      {/* Storefront Hero Card */}
      <Card className="overflow-hidden border-slate-200">
        <div className="h-32 sm:h-44 bg-gradient-to-r from-orange-600 via-amber-600 to-red-600 relative">
          <div className="absolute inset-0 bg-black/15" />
          <div className="absolute top-4 right-4">
            <Badge variant="unlocked" className="bg-white/95 text-slate-800 font-semibold shadow-xs">
              <ShieldCheck size={14} className="text-emerald-600" />
              <span>Verified Jashore Maker</span>
            </Badge>
          </div>
        </div>

        <div className="p-5 sm:p-7">
          <div className="-mt-14 sm:-mt-16 flex items-end gap-4 mb-4">
            <div className="size-20 sm:size-24 rounded-2xl bg-white border-4 border-white shadow-md flex items-center justify-center text-brand">
              <Store size={40} />
            </div>
            <div className="pb-1">
              <h1 className="text-xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {seller.store_name}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 flex items-center gap-1.5 mt-0.5">
                <MapPin size={13} className="text-slate-400" />
                <span>{seller.upazila || seller.district}, Jashore, Bangladesh</span>
              </p>
            </div>
          </div>

          <p className="text-sm text-slate-700 leading-relaxed max-w-2xl">
            {seller.description || seller.tagline}
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-4 text-xs text-slate-600 border-t border-line pt-4">
            <span className="flex items-center gap-1 font-bold text-slate-900">
              <Star size={14} className="text-amber-500 fill-amber-500" />
              <span>{seller.rating_avg.toFixed(1)} rating</span>
              <span className="text-slate-400 font-normal">({seller.rating_count} reviews)</span>
            </span>

            {seller.contact_phone && (
              <span className="flex items-center gap-1.5 font-mono">
                <Phone size={13} className="text-slate-400" />
                <span>{seller.contact_phone}</span>
              </span>
            )}
          </div>
        </div>
      </Card>

      {/* Catalog Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">
            Products from {seller.store_name}
          </h2>
          <span className="text-xs text-slate-400">{products.length} available</span>
        </div>

        {products.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3">
            {products.map((item) => (
              <Card key={item.id} className="group overflow-hidden hover:border-slate-300 transition-colors">
                <Link to={`/products/${item.slug || item.id}`} className="block aspect-square overflow-hidden bg-slate-100">
                  <img
                    src={item.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80'}
                    alt={item.title}
                    className="size-full object-cover group-hover:scale-103 transition-transform duration-300"
                  />
                </Link>

                <div className="p-4 space-y-2">
                  <p className="text-[11px] font-semibold uppercase text-slate-400">{item.category}</p>
                  <Link to={`/products/${item.slug || item.id}`} className="block text-sm font-bold text-slate-900 hover:text-brand line-clamp-1">
                    {item.title}
                  </Link>

                  <div className="pt-2 border-t border-line flex items-center justify-between">
                    <span className="text-base font-extrabold text-slate-900">
                      {formatCurrency(item.base_price)}
                    </span>
                    <Link
                      to={`/products/${item.slug || item.id}`}
                      className="text-xs font-semibold text-brand flex items-center gap-1 hover:underline"
                    >
                      Details <ArrowUpRight size={13} />
                    </Link>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-8 text-center text-sm text-slate-500">
            No products published yet.
          </Card>
        )}
      </div>
    </div>
  )
}
