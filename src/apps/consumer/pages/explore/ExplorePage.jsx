import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ArrowUpRight, Search, Users, X, Sparkles, Store } from 'lucide-react'
import { Card } from '@/shared/ui/Card'
import { Badge } from '@/shared/ui/Badge'
import { Button } from '@/shared/ui/Button'
import { formatCurrency } from '@/shared/lib/formatCurrency'
import { calculateDropTier } from '@/features/drops/model/dropStatuses'
import { useDropInterests } from '@/features/drops/model/useDropInterest'
import { catalogApi } from '@/features/catalog/api/catalogApi'
import { MOCK_DROPS, MOCK_PRODUCTS } from '../mockCatalog'

export default function ExplorePage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const drops = useDropInterests(MOCK_DROPS)

  const activeTab = searchParams.get('tab') === 'products' ? 'product' : searchParams.get('tab') === 'drops' ? 'drop' : 'all'
  const searchQuery = searchParams.get('q') || ''
  const selectedCategorySlug = searchParams.get('cat') || 'all'

  // Live API states
  const [liveCategories, setLiveCategories] = useState([])
  const [liveProducts, setLiveProducts] = useState([])
  const [isLoadingApi, setIsLoadingApi] = useState(false)

  // Fetch categories on mount
  useEffect(() => {
    catalogApi.getCategories()
      .then((cats) => {
        if (cats && cats.length > 0) setLiveCategories(cats)
      })
      .catch(() => {})
  }, [])

  // Fetch live products based on search & category
  useEffect(() => {
    let isMounted = true
    setIsLoadingApi(true)

    catalogApi.getProducts({
      query: searchQuery,
      category: selectedCategorySlug !== 'all' ? selectedCategorySlug : undefined,
    })
      .then((res) => {
        if (isMounted && res.data) {
          setLiveProducts(res.data)
        }
      })
      .catch(() => {
        // Quiet fallback to mock data
      })
      .finally(() => {
        if (isMounted) setIsLoadingApi(false)
      })

    return () => {
      isMounted = false
    }
  }, [searchQuery, selectedCategorySlug])

  const setSearchQuery = (value) => {
    const next = new URLSearchParams(searchParams)
    if (value) next.set('q', value)
    else next.delete('q')
    setSearchParams(next, { replace: true })
  }

  const setActiveTab = (value) => {
    const next = new URLSearchParams(searchParams)
    if (value === 'all') next.delete('tab')
    else next.set('tab', value === 'product' ? 'products' : 'drops')
    setSearchParams(next, { replace: true })
  }

  const setCategory = (slug) => {
    const next = new URLSearchParams(searchParams)
    if (slug === 'all') next.delete('cat')
    else next.set('cat', slug)
    setSearchParams(next, { replace: true })
  }

  // Combine items: prefer live products when available, supplemented by active drops
  const catalogProducts = liveProducts.length > 0
    ? liveProducts.map((p) => ({
        id: p.slug || p.id,
        slug: p.slug,
        title: p.title,
        price: p.base_price,
        retailPrice: p.compare_price || p.base_price,
        category: p.category?.name || 'Local Goods',
        categorySlug: p.category?.slug,
        image: p.image,
        seller: p.seller?.store_name,
        locality: p.seller?.locality,
        type: 'product',
      }))
    : MOCK_PRODUCTS.map((item) => ({ ...item, type: 'product', price: item.retailPrice }))

  const dropItems = drops.map((item) => ({
    ...item,
    type: 'drop',
    price: calculateDropTier(item.tiers, item.currentParticipants).currentTier.price,
  }))

  const allItems = [...dropItems, ...catalogProducts]

  const filteredItems = allItems.filter((item) => {
    const matchesTab = activeTab === 'all' || item.type === activeTab
    const matchesCategory = selectedCategorySlug === 'all'
      || (item.categorySlug && item.categorySlug === selectedCategorySlug)
      || (item.category && item.category.toLowerCase().includes(selectedCategorySlug.toLowerCase()))
    const matchesSearch = !searchQuery || `${item.title} ${item.category} ${item.seller || ''}`.toLowerCase().includes(searchQuery.trim().toLowerCase())
    return matchesTab && matchesCategory && matchesSearch
  })

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <p className="mb-2 text-xs font-semibold tracking-wide text-brand uppercase">
          DISCOVER YOUR NEXT FAVORITE IN JASHORE
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-ink">Explore & Catalog</h1>
        <p className="mt-1 text-sm text-muted">
          Authentic local artisans, group buying drops, and community picks across Jashore.
        </p>
      </div>

      {/* Search & Type Filter Card */}
      <div className="space-y-4 rounded-2xl border border-line bg-surface p-4 sm:p-5">
        <div className="relative">
          <Search size={20} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
          <input
            aria-label="Search products and categories"
            type="search"
            placeholder="Search Patali Gur, Handloom, Gadkhali flowers, or gear..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="h-13 w-full rounded-xl border border-field-border bg-elevated pl-12 pr-12 text-sm text-ink placeholder:text-muted focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              aria-label="Clear search"
              className="absolute right-1 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-lg text-muted hover:text-ink cursor-pointer"
            >
              <X size={18} />
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-2" aria-label="Item type">
          {[
            ['all', 'Everything'],
            ['drop', 'Active Drops'],
            ['product', 'Products & Artisans'],
          ].map(([value, label]) => (
            <button
              key={value}
              onClick={() => setActiveTab(value)}
              aria-pressed={activeTab === value}
              className={`min-h-11 rounded-xl px-4 text-xs sm:text-sm font-semibold cursor-pointer transition-colors ${
                activeTab === value
                  ? 'bg-brand text-on-brand shadow-xs'
                  : 'bg-elevated text-soft hover:text-ink'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Category Pills Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1" aria-label="Product category">
        <button
          aria-pressed={selectedCategorySlug === 'all'}
          onClick={() => setCategory('all')}
          className={`min-h-11 whitespace-nowrap rounded-full border px-4 text-xs font-semibold cursor-pointer transition-colors ${
            selectedCategorySlug === 'all'
              ? 'border-brand bg-brand text-on-brand shadow-xs'
              : 'border-line text-muted hover:text-ink bg-surface'
          }`}
        >
          All categories
        </button>

        {liveCategories.map((cat) => (
          <button
            key={cat.id}
            aria-pressed={selectedCategorySlug === cat.slug}
            onClick={() => setCategory(cat.slug)}
            className={`min-h-11 whitespace-nowrap rounded-full border px-4 text-xs font-medium cursor-pointer transition-colors flex items-center gap-1.5 ${
              selectedCategorySlug === cat.slug
                ? 'border-brand bg-brand text-on-brand shadow-xs'
                : 'border-line text-muted hover:text-ink bg-surface'
            }`}
          >
            <span>{cat.name}</span>
            {cat.products_count > 0 && (
              <span className="text-[10px] opacity-75">({cat.products_count})</span>
            )}
          </button>
        ))}
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm sm:text-base font-bold text-ink">
          {selectedCategorySlug === 'all' ? 'Featured Jashore Selection' : 'Filtered Collection'}
        </h2>
        <p className="text-xs text-muted" aria-live="polite">
          {filteredItems.length} {filteredItems.length === 1 ? 'item' : 'items'}
        </p>
      </div>

      {/* Items Grid */}
      {filteredItems.length ? (
        <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3">
          {filteredItems.map((item) => (
            <Card key={item.id} className="group flex flex-col overflow-hidden hover:border-slate-300 transition-colors">
              <Link
                to={item.type === 'drop' ? `/drops/${item.id}` : `/products/${item.slug || item.id}`}
                className="relative block aspect-square overflow-hidden bg-elevated"
              >
                <img
                  src={item.image}
                  alt={item.title}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-500 motion-safe:group-hover:scale-105"
                />
                <span className="absolute left-2 top-2 sm:left-3 sm:top-3">
                  <Badge variant={item.type === 'drop' ? 'brand' : 'unlocked'}>
                    {item.type === 'drop' ? 'Active Drop' : 'Local Artisan'}
                  </Badge>
                </span>
              </Link>

              <div className="flex flex-1 flex-col p-3 sm:p-4">
                <div className="flex items-center justify-between gap-1 text-[11px] text-muted">
                  <span className="truncate">{item.category}</span>
                  {item.locality && <span className="shrink-0 text-slate-400">• {item.locality}</span>}
                </div>

                <Link
                  to={item.type === 'drop' ? `/drops/${item.id}` : `/products/${item.slug || item.id}`}
                  className="mt-1.5 line-clamp-2 text-xs sm:text-sm font-bold leading-snug text-ink hover:text-brand"
                >
                  {item.title}
                </Link>

                {item.seller && (
                  <p className="mt-1 text-[11px] text-slate-500 flex items-center gap-1 truncate">
                    <Store size={11} className="shrink-0 text-slate-400" />
                    <span>{item.seller}</span>
                  </p>
                )}

                <div className="mt-auto pt-4">
                  <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                    <span className="text-base sm:text-lg font-bold tracking-tight text-ink">
                      {formatCurrency(item.price)}
                    </span>
                    {item.retailPrice > item.price && (
                      <span className="text-xs text-muted line-through">
                        {formatCurrency(item.retailPrice)}
                      </span>
                    )}
                  </div>

                  <div className="mt-3 flex items-center justify-between gap-1 border-t border-line pt-2.5">
                    <span className="flex items-center gap-1 text-[11px] text-muted font-medium">
                      {item.type === 'drop' ? (
                        <>
                          <Users size={13} className="text-brand" />
                          <span>{item.currentParticipants} backed</span>
                        </>
                      ) : (
                        'In Stock'
                      )}
                    </span>

                    <Link
                      className="flex min-h-8 items-center gap-1 text-xs font-semibold text-brand hover:underline"
                      to={item.type === 'drop' ? `/drops/${item.id}` : `/products/${item.slug || item.id}`}
                    >
                      {item.type === 'drop' ? 'Join Drop' : 'View'}
                      <ArrowUpRight size={13} />
                    </Link>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="px-6 py-12 text-center">
          <Search size={28} className="mx-auto mb-4 text-muted" />
          <h2 className="text-lg font-semibold text-ink">No items found</h2>
          <p className="mt-2 text-sm text-muted">Try another keyword or select All categories.</p>
          <Button
            className="mt-5"
            variant="outline"
            onClick={() => {
              setSearchParams({})
            }}
          >
            Reset filters
          </Button>
        </Card>
      )}
    </div>
  )
}
