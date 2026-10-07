import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Store, MapPin, Star, ShieldCheck, ArrowUpRight, Search, PlusCircle } from 'lucide-react'
import { Card } from '@/shared/ui/Card'
import { Badge } from '@/shared/ui/Badge'
import { Button } from '@/shared/ui/Button'
import { catalogApi } from '@/features/catalog/api/catalogApi'

export default function SellersDirectoryPage() {
  const [sellers, setSellers] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    setIsLoading(true)

    catalogApi.getSellers({ query: searchQuery })
      .then((res) => {
        if (isMounted) setSellers(res.data || [])
      })
      .catch(() => {})
      .finally(() => {
        if (isMounted) setIsLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [searchQuery])

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="mb-1 text-xs font-bold tracking-wider text-brand uppercase">
            LOCAL ARTISANS & MERCHANTS
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-ink">Jashore Producers</h1>
          <p className="mt-1 text-sm text-muted">
            Direct from verified farmers, distillers, weavers, and producers in Jashore.
          </p>
        </div>

        <Link to="/merchant/apply">
          <Button variant="drop-fire" size="sm" className="gap-2">
            <PlusCircle size={16} />
            <span>Apply as Seller</span>
          </Button>
        </Link>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search stores in Keshabpur, Gadkhali, Noapara, Sadar..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-surface border border-line rounded-xl pl-10 pr-4 py-3 text-sm text-ink placeholder:text-muted focus:border-brand focus:outline-none"
        />
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="py-16 text-center text-sm text-slate-400">Loading verified producers...</div>
      ) : sellers.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {sellers.map((seller) => (
            <Card key={seller.id} className="p-5 flex flex-col justify-between hover:border-slate-300 transition-colors">
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="size-12 rounded-2xl bg-orange-100 flex items-center justify-center text-brand shrink-0">
                      <Store size={24} />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900 leading-tight">
                        {seller.store_name}
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                        <MapPin size={12} className="text-slate-400" />
                        <span>{seller.upazila || seller.district}, Jashore</span>
                      </p>
                    </div>
                  </div>

                  <Badge variant="unlocked" size="sm" className="shrink-0">
                    <ShieldCheck size={12} className="text-emerald-600" /> Verified
                  </Badge>
                </div>

                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {seller.tagline || seller.description || 'Verified local producer on JashoreBro.'}
                </p>

                <div className="flex items-center gap-3 text-xs text-slate-500 pt-2 border-t border-line">
                  <span className="flex items-center gap-1 font-semibold text-slate-800">
                    <Star size={13} className="text-amber-500 fill-amber-500" />
                    <span>{seller.rating_avg.toFixed(1)}</span>
                    <span className="text-slate-400 font-normal">({seller.rating_count})</span>
                  </span>
                  <span>•</span>
                  <span>{seller.products_count} active items</span>
                </div>
              </div>

              <div className="pt-4 mt-2">
                <Link
                  to={`/merchants/${seller.slug}`}
                  className="inline-flex items-center gap-1 text-xs font-bold text-brand hover:underline"
                >
                  Visit Storefront <ArrowUpRight size={14} />
                </Link>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-8 text-center text-sm text-slate-500">
          No producers found matching your search.
        </Card>
      )}
    </div>
  )
}
