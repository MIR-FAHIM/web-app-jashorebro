import { useState, useEffect } from 'react'
import { ShoppingBag, Search, Sparkles, Flame, Check, AlertCircle, ArrowUpRight } from 'lucide-react'
import { Card } from '@/shared/ui/Card'
import { Badge } from '@/shared/ui/Badge'
import { Button } from '@/shared/ui/Button'
import { Dialog } from '@/shared/ui/Dialog'
import { formatCurrency } from '@/shared/lib/formatCurrency'
import { catalogApi } from '@/features/catalog/api/catalogApi'

const fallbackProducts = [
  {
    id: 1,
    title: 'Vintage Oversized Corduroy Hoodie',
    sku: 'JB-HOOD-01',
    stock_quantity: 240,
    base_price: 1200,
    is_active: true,
    is_drop_ready: true,
    category: { name: 'Streetwear' },
    seller: { store_name: 'TrendFabric BD' },
  },
  {
    id: 2,
    title: 'Havit H2002D RGB Gaming Headset',
    sku: 'JB-AUDIO-02',
    stock_quantity: 85,
    base_price: 2600,
    is_active: true,
    is_drop_ready: true,
    category: { name: 'Tech & gadgets' },
    seller: { store_name: 'GadgetZone Jashore' },
  },
  {
    id: 3,
    title: 'Redragon K552 Mechanical Keyboard',
    sku: 'JB-TECH-03',
    stock_quantity: 50,
    base_price: 3200,
    is_active: true,
    is_drop_ready: false,
    category: { name: 'Tech & gadgets' },
    seller: { store_name: 'GadgetZone Jashore' },
  },
  {
    id: 4,
    title: 'Benapole Pure Leather Bifold Wallet',
    sku: 'JB-LEATH-04',
    stock_quantity: 110,
    base_price: 850,
    is_active: true,
    is_drop_ready: true,
    category: { name: 'Leathercraft' },
    seller: { store_name: 'Artisan Hub Jashore' },
  },
]

export default function CatalogPage() {
  const [products, setProducts] = useState(fallbackProducts)
  const [query, setQuery] = useState('')
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    async function loadCatalog() {
      setIsLoading(true)
      try {
        const res = await catalogApi.getProducts({ per_page: 50 })
        if (res && res.data && res.data.length > 0) {
          setProducts(res.data)
        }
      } catch {
        // keep fallback
      } finally {
        setIsLoading(false)
      }
    }
    loadCatalog()
  }, [])

  const filtered = products.filter((p) => {
    const term = query.toLowerCase()
    return (
      p.title?.toLowerCase().includes(term) ||
      p.sku?.toLowerCase().includes(term) ||
      p.seller?.store_name?.toLowerCase().includes(term)
    )
  })

  const toggleDropReady = (id) => {
    setProducts((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, is_drop_ready: !item.is_drop_ready } : item
      )
    )
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShoppingBag size={18} className="text-orange-500" />
            <span className="text-xs font-bold uppercase tracking-wider text-orange-400">
              Inventory & Merchandising
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Product Catalog
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-400 max-w-2xl">
            Browse products, track inventory across Jashore sellers, and designate Drop-Ready items.
          </p>
        </div>
      </div>

      {/* Search & Stats Bar */}
      <Card className="p-4 bg-slate-900 border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md">
        <div className="relative w-full sm:max-w-md">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by title, SKU, or seller..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder:text-slate-500 focus:border-brand focus:outline-none"
          />
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-400">
          <span>{filtered.length} products displayed</span>
          <span className="text-slate-600">·</span>
          <span className="text-orange-400 font-semibold">
            {filtered.filter((p) => p.is_drop_ready).length} Drop-Ready
          </span>
        </div>
      </Card>

      {/* Catalog Table */}
      <Card className="bg-slate-900 border-slate-800 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-left text-xs">
            <thead className="bg-slate-950/60 text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th scope="col" className="px-5 py-3.5">Product & SKU</th>
                <th scope="col" className="px-5 py-3.5">Producer</th>
                <th scope="col" className="px-5 py-3.5">Base Retail</th>
                <th scope="col" className="px-5 py-3.5">Stock Level</th>
                <th scope="col" className="px-5 py-3.5">Drop Status</th>
                <th scope="col" className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="max-w-[260px] px-5 py-4">
                    <p className="font-bold text-white truncate">{item.title}</p>
                    <p className="text-[11px] font-mono text-slate-400 mt-0.5">
                      {item.sku || `JB-SKU-${item.id}`} · <span className="text-slate-500">{item.category?.name || 'General'}</span>
                    </p>
                  </td>

                  <td className="px-5 py-4 text-slate-300">
                    {item.seller?.store_name || 'Independent Merchant'}
                  </td>

                  <td className="px-5 py-4 font-bold text-white text-sm">
                    {formatCurrency(item.base_price)}
                  </td>

                  <td className="px-5 py-4">
                    <span className="font-semibold text-slate-200">{item.stock_quantity ?? 0}</span>
                    <span className="text-[10px] text-slate-500 ml-1">in warehouse</span>
                  </td>

                  <td className="px-5 py-4">
                    <button
                      type="button"
                      onClick={() => toggleDropReady(item.id)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border transition-colors ${
                        item.is_drop_ready
                          ? 'bg-orange-500/15 text-orange-400 border-orange-500/30 hover:bg-orange-500/25'
                          : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                      }`}
                      title="Click to toggle drop eligibility"
                    >
                      <Flame size={12} className={item.is_drop_ready ? 'fill-orange-400' : ''} />
                      <span>{item.is_drop_ready ? 'Drop Ready' : 'Standard'}</span>
                    </button>
                  </td>

                  <td className="px-5 py-4 text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setSelectedProduct(item)}
                      className="text-slate-400 hover:text-white hover:bg-slate-800"
                    >
                      <ArrowUpRight size={16} />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Product Detail Dialog */}
      <Dialog
        isOpen={Boolean(selectedProduct)}
        onClose={() => setSelectedProduct(null)}
        title={selectedProduct?.title}
        description="Catalog inventory specifications"
      >
        {selectedProduct && (
          <div className="space-y-4 pt-2 text-xs">
            <div className="grid grid-cols-2 gap-3 bg-slate-900 p-3.5 rounded-xl border border-slate-800">
              <div>
                <span className="text-slate-500">SKU Code:</span>
                <p className="font-mono font-bold text-white mt-0.5">{selectedProduct.sku}</p>
              </div>
              <div>
                <span className="text-slate-500">Producer:</span>
                <p className="font-bold text-white mt-0.5">
                  {selectedProduct.seller?.store_name || 'N/A'}
                </p>
              </div>
              <div>
                <span className="text-slate-500">Base Retail:</span>
                <p className="font-bold text-emerald-400 mt-0.5">
                  {formatCurrency(selectedProduct.base_price)}
                </p>
              </div>
              <div>
                <span className="text-slate-500">Available Stock:</span>
                <p className="font-bold text-white mt-0.5">
                  {selectedProduct.stock_quantity} units
                </p>
              </div>
            </div>

            <div className="pt-2">
              <Button
                variant="drop-fire"
                size="sm"
                className="w-full font-bold gap-2"
                onClick={() => {
                  toggleDropReady(selectedProduct.id)
                  setSelectedProduct(null)
                }}
              >
                <Flame size={15} />
                <span>
                  {selectedProduct.is_drop_ready
                    ? 'Remove from Volume Drop Eligibility'
                    : 'Designate as Volume Drop Candidate'}
                </span>
              </Button>
            </div>
          </div>
        )}
      </Dialog>
    </div>
  )
}
