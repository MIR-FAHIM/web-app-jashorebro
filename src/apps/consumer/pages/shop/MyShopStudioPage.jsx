import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Store,
  PlusCircle,
  ExternalLink,
  Copy,
  Check,
  TrendingUp,
  Package,
  Clock,
  ShieldAlert,
  Edit2,
  Trash2,
  Sparkles,
  ShoppingBag,
  Eye,
  CheckCircle2,
} from 'lucide-react'
import { Card } from '@/shared/ui/Card'
import { Badge } from '@/shared/ui/Badge'
import { Button } from '@/shared/ui/Button'
import { Input } from '@/shared/ui/Input'
import { Dialog } from '@/shared/ui/Dialog'
import { PageHeader } from '@/shared/patterns/PageHeader'
import { communityApi } from '@/features/community/api/communityApi'
import { useAuth } from '@/features/auth/model/authContext'
import { formatCurrency } from '@/shared/lib/formatCurrency'
import { resolveImageUrl, getProductImageUrl } from '@/shared/lib/mediaUrl'

export default function MyShopStudioPage() {
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuth()

  const [shop, setShop] = useState(null)
  const [listings, setListings] = useState([])
  const [sales, setSales] = useState([])
  const [activeTab, setActiveTab] = useState('listings') // 'listings' | 'sales' | 'settings'
  const [isLoading, setIsLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  // Edit Listing Dialog State
  const [editingListing, setEditingListing] = useState(null)
  const [newSellingPrice, setNewSellingPrice] = useState(0)
  const [editError, setEditError] = useState('')
  const [isUpdatingListing, setIsUpdatingListing] = useState(false)

  // Edit Shop Profile State
  const [shopForm, setShopForm] = useState({ name: '', bio: '', logo_url: '' })
  const [isSavingShop, setIsSavingShop] = useState(false)
  const [shopSaveNotice, setShopSaveNotice] = useState('')

  // Create Shop Onboarding State
  const [createForm, setCreateForm] = useState({ name: '', bio: '' })
  const [isCreatingShop, setIsCreatingShop] = useState(false)
  const [createError, setCreateError] = useState('')

  const fetchShopData = () => {
    setIsLoading(true)
    communityApi.shop.getMyShop()
      .then((data) => {
        const currentShop = data?.shop || (data?.id ? data : null)
        if (currentShop) {
          setShop(currentShop)
          setShopForm({
            name: currentShop.name || '',
            bio: currentShop.bio || currentShop.description || '',
            logo_url: currentShop.logo_url || '',
          })
          if (data?.listings && Array.isArray(data.listings) && data.listings.length > 0) {
            setListings(data.listings)
          } else {
            communityApi.shop.getListings()
              .then((listRes) => {
                const items = Array.isArray(listRes) ? listRes : (listRes?.data || listRes?.listings || [])
                setListings(items)
              })
              .catch(() => {})
          }
        } else {
          setShop(null)
          setListings([])
        }
      })
      .catch((err) => {
        if (err.status === 404 || err.message?.includes('not found') || err.message?.includes('No community shop')) {
          setShop(null)
        }
      })
      .finally(() => {
        setIsLoading(false)
      })
  }

  const fetchSalesData = () => {
    communityApi.shop.getSales()
      .then((data) => {
        setSales(data.sales || [])
      })
      .catch(() => {})
  }

  useEffect(() => {
    if (!isAuthenticated) return
    fetchShopData()
  }, [isAuthenticated])

  useEffect(() => {
    if (shop && activeTab === 'sales') {
      fetchSalesData()
    }
  }, [shop, activeTab])

  const handleCopyLink = () => {
    if (!shop) return
    const url = `${window.location.origin}/shop/${shop.slug}`
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  const handleCreateShop = async (e) => {
    e.preventDefault()
    if (!createForm.name.trim()) return

    setIsCreatingShop(true)
    setCreateError('')

    try {
      const res = await communityApi.shop.createShop({
        name: createForm.name.trim(),
        bio: createForm.bio.trim() || undefined,
      })
      const createdShop = res?.shop || res?.data || (res?.id ? res : null)
      if (createdShop) {
        setShop(createdShop)
        setShopForm({
          name: createdShop.name || '',
          bio: createdShop.bio || createdShop.description || '',
          logo_url: createdShop.logo_url || '',
        })
        setListings(res?.listings || [])
      } else {
        fetchShopData()
      }
    } catch (err) {
      if (err.message?.includes('already operate a community shop') || err.message?.includes('already operate')) {
        // Recover cleanly: the user already operates a shop, load it immediately
        fetchShopData()
      } else {
        setCreateError(err.message || 'Failed to create community store.')
      }
    } finally {
      setIsCreatingShop(false)
    }
  }

  const handleOpenEditListing = (listing) => {
    setEditingListing(listing)
    setNewSellingPrice(listing.selling_price)
    setEditError('')
  }

  const handleSaveListingPrice = async (e) => {
    e.preventDefault()
    if (!editingListing) return

    setIsUpdatingListing(true)
    setEditError('')

    try {
      const res = await communityApi.shop.updateListing(editingListing.id, {
        selling_price: Number(newSellingPrice),
      })
      const updatedListing = res.listing ?? res
      setListings((prev) =>
        prev.map((l) => (l.id === editingListing.id ? { ...l, ...updatedListing } : l))
      )
      setEditingListing(null)
    } catch (err) {
      setEditError(err.message || 'Failed to update retail price.')
    } finally {
      setIsUpdatingListing(false)
    }
  }

  const handleToggleListingActive = async (listing) => {
    try {
      const res = await communityApi.shop.updateListing(listing.id, {
        is_active: !listing.is_active,
      })
      const updatedListing = res.listing ?? res
      setListings((prev) =>
        prev.map((l) => (l.id === listing.id ? { ...l, ...updatedListing } : l))
      )
    } catch (err) {
      // ignore error
    }
  }

  const handleRemoveListing = async (listingId) => {
    if (!window.confirm('Are you sure you want to remove this item from your storefront?')) return
    try {
      await communityApi.shop.removeListing(listingId)
      setListings((prev) => prev.filter((l) => l.id !== listingId))
    } catch (err) {
      // ignore error
    }
  }

  const handleUpdateShopProfile = async (e) => {
    e.preventDefault()
    setIsSavingShop(true)
    setShopSaveNotice('')

    try {
      const res = await communityApi.shop.updateShop(shopForm)
      setShop(res.shop)
      setShopSaveNotice('Store details updated successfully.')
      setTimeout(() => setShopSaveNotice(''), 3000)
    } catch (err) {
      setShopSaveNotice(err.message || 'Failed to update store details.')
    } finally {
      setIsSavingShop(false)
    }
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-5xl py-24 text-center text-sm text-slate-400">
        <div className="size-8 mx-auto border-3 border-brand border-t-transparent rounded-full animate-spin mb-3" />
        <span>Loading your store studio...</span>
      </div>
    )
  }

  // Not logged in
  if (!isAuthenticated) {
    return (
      <Card className="mx-auto max-w-md p-8 text-center bg-slate-900 border-slate-800 text-white space-y-4 mt-12">
        <Store size={40} className="mx-auto text-brand" />
        <h1 className="text-xl font-bold">Community Store Studio</h1>
        <p className="text-xs text-slate-400">
          Sign in or create your account to launch and manage your personal artisan storefront.
        </p>
        <Link to="/auth" state={{ from: { pathname: '/my-shop' } }}>
          <Button variant="primary" size="sm" className="w-full">
            Sign In to Continue
          </Button>
        </Link>
      </Card>
    )
  }

  // Onboarding: No shop created yet
  if (!shop) {
    return (
      <div className="mx-auto max-w-xl py-12 px-4 space-y-6">
        <PageHeader
          title="Launch Your Micro-Store"
          subtitle="Turn your community network into an online business with zero risk."
        />

        <Card className="p-6 sm:p-8 bg-slate-900 border-slate-800 text-white space-y-6 shadow-xl">
          <div className="rounded-2xl border border-brand/30 bg-brand/10 p-5 space-y-2">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <Sparkles size={16} className="text-brand" />
              <span>How your store works:</span>
            </h3>
            <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
              <li>Pick artisan products from the verified master catalog.</li>
              <li>Set your retail margin within platform bounds.</li>
              <li>Share your store link on WhatsApp, Facebook, or with neighbors.</li>
              <li>JashoreBro packages, ships, and collects payment automatically.</li>
            </ul>
          </div>

          <form onSubmit={handleCreateShop} className="space-y-4">
            {createError && (
              <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-red-300 text-xs">
                {createError}
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Storefront Name *</label>
              <Input
                type="text"
                required
                placeholder="e.g. Maya's Authentic Finds"
                value={createForm.name}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, name: e.target.value }))}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Bio / Tagline</label>
              <Input
                type="text"
                placeholder="e.g. Hand-picked authentic date jaggery, oils and snacks from Jashore"
                value={createForm.bio}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, bio: e.target.value }))}
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={isCreatingShop || !createForm.name.trim()}
              className="w-full font-bold gap-2"
            >
              <Store size={18} />
              <span>{isCreatingShop ? 'Setting Up...' : 'Open My Free Store Now'}</span>
            </Button>
          </form>
        </Card>
      </div>
    )
  }

  // Shop Dashboard
  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-16">
      {/* Top Banner / Store Header */}
      <Card className="p-5 sm:p-6 bg-slate-900 border-slate-800 text-white space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="size-14 rounded-2xl bg-brand/20 border border-brand/40 flex items-center justify-center text-xl font-black text-brand shrink-0">
              {shop.logo_url ? (
                <img src={shop.logo_url} alt="" className="size-full rounded-2xl object-cover" />
              ) : (
                shop.name.charAt(0).toUpperCase()
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-black text-white">{shop.name}</h1>
                <Badge
                  variant={shop.status === 'active' ? 'unlocked' : 'brand'}
                  className={
                    shop.status === 'active'
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[10px]'
                      : 'text-[10px]'
                  }
                >
                  {shop.status === 'active' ? 'Live Storefront' : shop.status}
                </Badge>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Public URL: <span className="font-mono text-slate-300">/shop/{shop.slug}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleCopyLink}
              className="gap-1.5 border-slate-700 bg-slate-800 text-xs"
            >
              {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
              <span>{copied ? 'Link Copied' : 'Copy Link'}</span>
            </Button>
            <Link to={`/shop/${shop.slug}`} target="_blank">
              <Button type="button" variant="primary" size="sm" className="gap-1.5 text-xs font-semibold">
                <Eye size={14} />
                <span>View Store</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 border-t border-slate-800 pt-4">
          <button
            type="button"
            onClick={() => setActiveTab('listings')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'listings'
                ? 'bg-brand text-white shadow-sm'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            My Curated Listings ({listings.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('sales')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'sales'
                ? 'bg-brand text-white shadow-sm'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            Store Sales & Orders
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'settings'
                ? 'bg-brand text-white shadow-sm'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            Store Settings
          </button>
        </div>
      </Card>

      {/* Tab: Listings */}
      {activeTab === 'listings' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white">Active Store Listings</h2>
            <Link to="/explore">
              <Button type="button" variant="primary" size="sm" className="gap-1.5 text-xs">
                <PlusCircle size={14} />
                <span>Browse Catalog to Add Items</span>
              </Button>
            </Link>
          </div>

          {listings.length === 0 ? (
            <Card className="p-8 text-center bg-slate-900 border-slate-800 text-white space-y-3">
              <Package size={36} className="mx-auto text-slate-600" />
              <h3 className="text-sm font-bold">No products in your store yet</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Open any product in the catalog and click the <strong className="text-indigo-300">"List on My Store"</strong> button in the Micro-Business section.
              </p>
              <Link to="/explore">
                <Button variant="secondary" size="sm" className="gap-1.5 border-slate-700 bg-slate-800 hover:bg-slate-700 text-white">
                  <PlusCircle size={14} className="text-indigo-400" />
                  <span>Explore Catalog Now</span>
                </Button>
              </Link>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {listings.map((listing) => {
                const product = listing.product
                if (!product) return null

                const breakdown = listing.commercial_breakdown
                const supplierPrice = breakdown?.supplier_allocation_price != null
                  ? Number(breakdown.supplier_allocation_price)
                  : (product.supplier_allocation_price != null ? Number(product.supplier_allocation_price) : null)
                const netEarning = breakdown?.seller_earning != null
                  ? Number(breakdown.seller_earning)
                  : (supplierPrice != null ? Math.max(0, Number(listing.selling_price) - supplierPrice) : 0)

                return (
                  <Card
                    key={listing.id}
                    className="p-4 bg-slate-900 border-slate-800 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      {getProductImageUrl(product) ? (
                        <img
                          src={getProductImageUrl(product)}
                          alt={product.title || ''}
                          className="size-16 rounded-xl object-cover border border-slate-800 shrink-0 bg-slate-950"
                        />
                      ) : (
                        <div className="size-16 rounded-xl border border-slate-800 bg-slate-950 flex items-center justify-center shrink-0 text-slate-500">
                          <Package size={20} />
                        </div>
                      )}
                      <div className="min-w-0">
                        <h4 className="font-bold text-sm text-white truncate">{product.title}</h4>
                        <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-slate-400">
                          <span>Wholesale: {supplierPrice != null ? formatCurrency(supplierPrice) : 'Unset'}</span>
                          <span>·</span>
                          <span className="font-semibold text-white">
                            Your Retail: {formatCurrency(listing.selling_price)}
                          </span>
                          <span>·</span>
                          <span className="font-semibold text-emerald-400">
                            Net Margin: ~{formatCurrency(netEarning)}
                          </span>
                        </div>
                        {(listing.caption ?? listing.curator_note) && (
                          <p className="text-[11px] text-slate-400 mt-1 italic line-clamp-1">
                            "{listing.caption ?? listing.curator_note}"
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => handleOpenEditListing(listing)}
                        className="gap-1 text-xs border-slate-700 bg-slate-800"
                      >
                        <Edit2 size={13} />
                        <span>Edit Price</span>
                      </Button>
                      <button
                        type="button"
                        onClick={() => handleToggleListingActive(listing)}
                        className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                          listing.is_active
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : 'bg-slate-800 text-slate-500 border-slate-700'
                        }`}
                      >
                        {listing.is_active ? 'Active' : 'Paused'}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveListing(listing.id)}
                        className="p-2 rounded-xl text-slate-500 hover:text-red-400 hover:bg-slate-800 transition-all"
                        title="Remove from store"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab: Sales */}
      {activeTab === 'sales' && (
        <div className="space-y-4">
          <h2 className="text-base font-bold text-white">Attributed Store Sales</h2>

          {sales.length === 0 ? (
            <Card className="p-8 text-center bg-slate-900 border-slate-800 text-white space-y-2">
              <ShoppingBag size={36} className="mx-auto text-slate-600" />
              <h3 className="text-sm font-bold">No store sales yet</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Share your store link with friends and neighbors to generate your first community order.
              </p>
            </Card>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="border-b border-slate-800 bg-slate-950 text-slate-400 font-bold">
                  <tr>
                    <th className="p-3">Order Ref</th>
                    <th className="p-3">Item</th>
                    <th className="p-3">Qty</th>
                    <th className="p-3">Price</th>
                    <th className="p-3">Your Margin</th>
                    <th className="p-3">Fulfillment</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {sales.map((sale) => (
                    <tr key={sale.id} className="hover:bg-slate-800/40">
                      <td className="p-3 font-mono font-bold text-white">
                        {sale.order_number || `#${sale.order_id}`}
                      </td>
                      <td className="p-3 font-semibold text-white max-w-[180px] truncate">
                        {sale.product_title || 'Artisan Item'}
                      </td>
                      <td className="p-3">{sale.quantity}</td>
                      <td className="p-3">{formatCurrency(sale.line_total || sale.selling_price * sale.quantity)}</td>
                      <td className="p-3 font-bold text-emerald-400">
                        {formatCurrency(sale.seller_net_earning)}
                      </td>
                      <td className="p-3">
                        <Badge
                          variant={sale.order_status === 'delivered' ? 'unlocked' : 'default'}
                          className="text-[10px]"
                        >
                          {sale.order_status || 'processing'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab: Settings */}
      {activeTab === 'settings' && (
        <Card className="p-5 sm:p-6 bg-slate-900 border-slate-800 text-white space-y-4 max-w-xl">
          <h2 className="text-base font-bold text-white">Storefront Profile</h2>

          {shopSaveNotice && (
            <div className="p-3 rounded-xl bg-slate-800 border border-slate-700 text-xs text-emerald-400">
              {shopSaveNotice}
            </div>
          )}

          <form onSubmit={handleUpdateShopProfile} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Storefront Name</label>
              <Input
                type="text"
                required
                value={shopForm.name}
                onChange={(e) => setShopForm((prev) => ({ ...prev, name: e.target.value }))}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Bio / Tagline</label>
              <Input
                type="text"
                value={shopForm.bio}
                onChange={(e) => setShopForm((prev) => ({ ...prev, bio: e.target.value }))}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Store Logo URL (Optional)</label>
              <Input
                type="url"
                placeholder="https://..."
                value={shopForm.logo_url}
                onChange={(e) => setShopForm((prev) => ({ ...prev, logo_url: e.target.value }))}
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={isSavingShop}
              className="font-bold"
            >
              {isSavingShop ? 'Saving...' : 'Update Store Profile'}
            </Button>
          </form>
        </Card>
      )}

      {/* Edit Listing Modal */}
      {editingListing && (
        <Dialog
          isOpen={Boolean(editingListing)}
          onClose={() => setEditingListing(null)}
          title="Update Retail Price"
          description={`Set your retail price for ${editingListing.product?.title}.`}
        >
          <form onSubmit={handleSaveListingPrice} className="space-y-4">
            {editError && (
              <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-red-300 text-xs">
                {editError}
              </div>
            )}

            <div className="space-y-1">
              <div className="flex justify-between items-center text-xs">
                <label className="font-semibold text-slate-300">Selling Price</label>
                <span className="text-slate-400 text-[11px]">
                  Bounds: {formatCurrency(editingListing.product?.min_selling_price || 0)} –{' '}
                  {formatCurrency(editingListing.product?.max_selling_price || 99999)}
                </span>
              </div>
              <input
                type="number"
                min={editingListing.product?.min_selling_price || 1}
                max={editingListing.product?.max_selling_price || 99999}
                value={newSellingPrice}
                onChange={(e) => setNewSellingPrice(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-700 bg-slate-900 py-2.5 px-3 text-sm font-bold text-white focus:border-brand focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <Button type="button" variant="secondary" size="sm" onClick={() => setEditingListing(null)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" disabled={isUpdatingListing}>
                {isUpdatingListing ? 'Updating...' : 'Save New Price'}
              </Button>
            </div>
          </form>
        </Dialog>
      )}
    </div>
  )
}
