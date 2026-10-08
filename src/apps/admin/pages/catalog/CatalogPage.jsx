import { useState, useEffect } from 'react'
import {
  ShoppingBag,
  Search,
  Plus,
  Edit,
  Trash2,
  Flame,
  Layers,
  ArrowUpRight,
  Filter,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react'
import { Card } from '@/shared/ui/Card'
import { Badge } from '@/shared/ui/Badge'
import { Button } from '@/shared/ui/Button'
import { formatCurrency } from '@/shared/lib/formatCurrency'
import { adminCatalogApi } from '../../api/adminCatalogApi'
import { ProductFormModal } from './ProductFormModal'
import { AttributesManagerModal } from './AttributesManagerModal'

export default function CatalogPage() {
  const [products, setProducts] = useState([])
  const [meta, setMeta] = useState({ total: 0, current_page: 1 })
  const [isLoading, setIsLoading] = useState(false)
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  // Modals
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [productToEdit, setProductToEdit] = useState(null)
  const [isAttributesOpen, setIsAttributesOpen] = useState(false)

  const loadProducts = async () => {
    setIsLoading(true)
    try {
      const res = await adminCatalogApi.getProducts({
        q: query,
        status: statusFilter,
        per_page: 50,
      })
      if (res && res.data) {
        setProducts(res.data)
        if (res.meta) setMeta(res.meta)
      }
    } catch {
      // Keep existing
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadProducts()
  }, [query, statusFilter])

  const handleCreate = () => {
    setProductToEdit(null)
    setIsFormOpen(true)
  }

  const handleEdit = async (productId) => {
    try {
      const fullProduct = await adminCatalogApi.getProduct(productId)
      setProductToEdit(fullProduct)
      setIsFormOpen(true)
    } catch (err) {
      alert(err.message || 'Failed to fetch product details.')
    }
  }

  const handleArchive = async (id, title) => {
    if (!confirm(`Are you sure you want to archive '${title}'?`)) return
    try {
      await adminCatalogApi.archiveProduct(id)
      loadProducts()
    } catch (err) {
      alert(err.message || 'Failed to archive product.')
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'published':
        return (
          <Badge size="sm" className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30">
            Published
          </Badge>
        )
      case 'archived':
        return (
          <Badge size="sm" className="bg-red-500/15 text-red-400 border-red-500/30">
            Archived
          </Badge>
        )
      default:
        return (
          <Badge size="sm" className="bg-amber-500/15 text-amber-400 border-amber-500/30">
            Draft
          </Badge>
        )
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShoppingBag size={18} className="text-orange-500" />
            <span className="text-xs font-bold uppercase tracking-wider text-orange-400">
              Admin Inventory & Merchandising
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Product Catalog Management
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-400 max-w-2xl">
            Create and edit artisan marketplace goods, manage variants, and configure Volume Drop rules.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsAttributesOpen(true)}
            className="border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700 font-bold gap-1.5"
          >
            <Layers size={15} />
            <span>Manage Attributes</span>
          </Button>

          <Button
            variant="drop-fire"
            size="sm"
            onClick={handleCreate}
            className="font-bold gap-1.5"
          >
            <Plus size={16} />
            <span>Create Product</span>
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          {['all', 'published', 'draft', 'archived'].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition-all capitalize ${
                statusFilter === st
                  ? 'bg-orange-500/15 text-orange-400 border border-orange-500/30'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:max-w-xs">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by title, SKU, brand..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder:text-slate-500 focus:border-brand focus:outline-none"
          />
        </div>
      </div>

      {/* Catalog Table */}
      <Card className="bg-slate-900 border-slate-800 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[750px] text-left text-xs">
            <thead className="bg-slate-950/60 text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th scope="col" className="px-5 py-3.5">Product & SKU</th>
                <th scope="col" className="px-5 py-3.5">Category</th>
                <th scope="col" className="px-5 py-3.5">Base Retail</th>
                <th scope="col" className="px-5 py-3.5">Stock Quantity</th>
                <th scope="col" className="px-5 py-3.5">Status</th>
                <th scope="col" className="px-5 py-3.5">Modes</th>
                <th scope="col" className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {products.map((item) => (
                <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="px-5 py-4 max-w-[260px]">
                    <div className="flex items-center gap-3">
                      {item.primary_image?.image_url && (
                        <img
                          src={item.primary_image.image_url}
                          alt=""
                          className="size-10 rounded-lg object-cover bg-slate-800 border border-slate-700 shrink-0"
                        />
                      )}
                      <div className="min-w-0">
                        <p className="font-bold text-white truncate">{item.title}</p>
                        <p className="text-[11px] font-mono text-slate-400 mt-0.5">
                          {item.sku || `SKU-${item.id}`} · {item.variants_count ?? 0} variants
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-5 py-4 text-slate-300">
                    {item.category?.name || 'General Goods'}
                  </td>

                  <td className="px-5 py-4 font-bold text-white text-sm">
                    {formatCurrency(item.base_price)}
                    {item.cost_price && (
                      <span className="block text-[10px] text-slate-500 font-normal">
                        Cost: {formatCurrency(item.cost_price)}
                      </span>
                    )}
                  </td>

                  <td className="px-5 py-4">
                    <span className="font-semibold text-slate-200">{item.stock_quantity ?? 0}</span>
                    <span className="text-[10px] text-slate-500 ml-1">units</span>
                  </td>

                  <td className="px-5 py-4">
                    {getStatusBadge(item.status)}
                  </td>

                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1.5">
                      {item.is_group_buy_enabled && (
                        <span className="p-1 rounded bg-orange-500/20 text-orange-400" title="Group Buy Eligible">
                          <Flame size={13} />
                        </span>
                      )}
                      {item.is_normal_purchase_enabled && (
                        <span className="p-1 rounded bg-blue-500/20 text-blue-400" title="Direct Purchase Enabled">
                          <ShoppingBag size={13} />
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        variant="ghost"
                        size="xs"
                        onClick={() => handleEdit(item.id)}
                        className="text-slate-300 hover:text-white hover:bg-slate-800 gap-1"
                      >
                        <Edit size={13} />
                        <span>Edit</span>
                      </Button>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleArchive(item.id, item.title)}
                        className="text-slate-500 hover:text-red-400 hover:bg-red-500/10"
                        title="Archive Product"
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modals */}
      <ProductFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        productToEdit={productToEdit}
        onSaved={loadProducts}
      />

      <AttributesManagerModal
        isOpen={isAttributesOpen}
        onClose={() => setIsAttributesOpen(false)}
        onAttributesUpdated={loadProducts}
      />
    </div>
  )
}
