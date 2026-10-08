import { useState, useEffect, useCallback } from 'react'
import {
  Flame,
  Plus,
  Clock,
  Users,
  ArrowUpRight,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Calendar,
  DollarSign,
  Package,
  RefreshCw,
} from 'lucide-react'
import { Card } from '@/shared/ui/Card'
import { Badge } from '@/shared/ui/Badge'
import { Button } from '@/shared/ui/Button'
import { Dialog } from '@/shared/ui/Dialog'
import { formatCurrency } from '@/shared/lib/formatCurrency'
import { adminCatalogApi } from '@/apps/admin/api/adminCatalogApi'

export default function DropManagementPage() {
  const [drops, setDrops] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('All')
  const [selectedDrop, setSelectedDrop] = useState(null)
  const [selectedDropDetails, setSelectedDropDetails] = useState(null)
  const [loadingDetails, setLoadingDetails] = useState(false)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [cancelling, setCancelling] = useState(false)
  const [cancelReason, setCancelReason] = useState('')

  // Product list for selecting when launching a drop
  const [productsList, setProductsList] = useState([])
  const [loadingProducts, setLoadingProducts] = useState(false)

  // New drop form state
  const [formData, setFormData] = useState({
    product_id: '',
    title: '',
    group_price: '',
    target_participants: '10',
    max_participants: '',
    quantity_limit_per_customer: '2',
    durationDays: '3',
  })
  const [formError, setFormError] = useState('')

  const fetchDrops = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const statusParam = activeTab === 'All' ? 'all' : activeTab.toLowerCase()
      const res = await adminCatalogApi.getDropCampaigns({ status: statusParam })
      setDrops(res.data || [])
    } catch (err) {
      setError(err?.message || 'Failed to load drop campaigns.')
    } finally {
      setLoading(false)
    }
  }, [activeTab])

  useEffect(() => {
    fetchDrops()
  }, [fetchDrops])

  // Load products lookup when create dialog opens
  useEffect(() => {
    if (isCreateOpen) {
      setLoadingProducts(true)
      adminCatalogApi
        .getProducts({ per_page: 100 })
        .then((res) => {
          setProductsList(res.data || [])
        })
        .catch(() => {})
        .finally(() => setLoadingProducts(false))
    }
  }, [isCreateOpen])

  // When selected product changes in form, prefill title and base price
  const handleProductSelect = (e) => {
    const prodId = e.target.value
    const found = productsList.find((p) => p.id.toString() === prodId.toString())
    if (found) {
      setFormData((prev) => ({
        ...prev,
        product_id: prodId,
        title: prev.title || `${found.title} - Jashore Volume Drop`,
        group_price: prev.group_price || Math.round(Number(found.base_price || 0) * 0.85),
      }))
    } else {
      setFormData((prev) => ({ ...prev, product_id: prodId }))
    }
  }

  // Load full details when inspecting a drop
  const handleInspectDrop = async (drop) => {
    setSelectedDrop(drop)
    setLoadingDetails(true)
    setCancelReason('')
    try {
      const details = await adminCatalogApi.getDropCampaign(drop.id)
      setSelectedDropDetails(details)
    } catch {
      setSelectedDropDetails(drop)
    } finally {
      setLoadingDetails(false)
    }
  }

  const handleCreateSubmit = async (e) => {
    e.preventDefault()
    setFormError('')
    if (!formData.product_id) {
      setFormError('Please select a product for this volume drop.')
      return
    }

    setSubmitting(true)
    try {
      const startDate = new Date()
      const endDate = new Date()
      endDate.setDate(startDate.getDate() + Number(formData.durationDays || 3))

      const payload = {
        product_id: Number(formData.product_id),
        title: formData.title,
        group_price: Number(formData.group_price),
        target_participants: Number(formData.target_participants),
        max_participants: formData.max_participants ? Number(formData.max_participants) : null,
        quantity_limit_per_customer: formData.quantity_limit_per_customer
          ? Number(formData.quantity_limit_per_customer)
          : 2,
        start_at: startDate.toISOString().slice(0, 19).replace('T', ' '),
        end_at: endDate.toISOString().slice(0, 19).replace('T', ' '),
        status: 'active',
      }

      await adminCatalogApi.createDropCampaign(payload)
      setIsCreateOpen(false)
      setFormData({
        product_id: '',
        title: '',
        group_price: '',
        target_participants: '10',
        max_participants: '',
        quantity_limit_per_customer: '2',
        durationDays: '3',
      })
      fetchDrops()
    } catch (err) {
      setFormError(err?.message || 'Failed to launch drop campaign.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleCloseEarly = async (id) => {
    if (!window.confirm('Are you sure you want to conclude or cancel this drop early? Customer reservations will be released.')) {
      return
    }

    setCancelling(true)
    try {
      await adminCatalogApi.cancelDropCampaign(id, cancelReason || 'Concluded early by administrator')
      setSelectedDrop(null)
      setSelectedDropDetails(null)
      fetchDrops()
    } catch (err) {
      alert(err?.message || 'Failed to cancel drop campaign.')
    } finally {
      setCancelling(false)
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return (
          <Badge size="sm" className="bg-orange-500/15 text-orange-400 border-orange-500/30">
            Active
          </Badge>
        )
      case 'succeeded':
        return (
          <Badge size="sm" className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30">
            Target Reached
          </Badge>
        )
      case 'cancelled':
      case 'failed':
        return (
          <Badge size="sm" className="bg-red-500/15 text-red-400 border-red-500/30">
            {status === 'cancelled' ? 'Cancelled' : 'Expired'}
          </Badge>
        )
      default:
        return (
          <Badge size="sm" className="bg-slate-700/50 text-slate-400 border-slate-600">
            {status}
          </Badge>
        )
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Flame size={18} className="text-orange-500" />
            <span className="text-xs font-bold uppercase tracking-wider text-orange-400">
              Community Commerce Engine
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Volume Drops Management
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-400 max-w-2xl">
            Control dynamic price-curve campaigns, participant quotas, and unlocking tiers across Jashore merchants.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchDrops}
            disabled={loading}
            className="border-slate-800 text-slate-400 hover:text-white"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </Button>

          <Button
            variant="drop-fire"
            onClick={() => setIsCreateOpen(true)}
            className="font-bold gap-2 shrink-0 bg-gradient-to-r from-orange-500 to-red-600 text-white"
          >
            <Plus size={16} />
            <span>Launch New Drop</span>
          </Button>
        </div>
      </div>

      {/* Tabs & Filter Bar */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        {['All', 'Active', 'Succeeded', 'Cancelled', 'Draft'].map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
              activeTab === tab
                ? 'bg-orange-500/15 text-orange-400 border border-orange-500/30'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Error Banner */}
      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3.5 text-xs text-red-400 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={fetchDrops} className="underline font-semibold ml-2">Retry</button>
        </div>
      )}

      {/* Drops Table Card */}
      <Card className="bg-slate-900 border-slate-800 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[750px] text-left text-xs">
            <thead className="bg-slate-950/60 text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th scope="col" className="px-5 py-3.5">Campaign & Code</th>
                <th scope="col" className="px-5 py-3.5">Drop Price</th>
                <th scope="col" className="px-5 py-3.5">Participation Progress</th>
                <th scope="col" className="px-5 py-3.5">Quota / Needed</th>
                <th scope="col" className="px-5 py-3.5">Duration</th>
                <th scope="col" className="px-5 py-3.5">Status</th>
                <th scope="col" className="px-5 py-3.5 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <Loader2 size={24} className="mx-auto animate-spin text-orange-500 mb-2" />
                    <span>Loading drop campaigns...</span>
                  </td>
                </tr>
              ) : drops.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <p className="font-semibold text-white">No volume drops found</p>
                    <p className="text-xs text-slate-500 mt-1">
                      {activeTab === 'All'
                        ? 'Click "Launch New Drop" to create your first community campaign.'
                        : `No campaigns in "${activeTab}" status.`}
                    </p>
                  </td>
                </tr>
              ) : (
                drops.map((row) => {
                  const participants = row.distinct_participants_count ?? 0
                  const target = row.target_participants ?? 10
                  const pct = row.progress_percent ?? Math.min(100, Math.round((participants / target) * 100))

                  return (
                    <tr key={row.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="max-w-[240px] px-5 py-4">
                        <p className="font-bold text-white truncate">{row.title}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5 font-mono">
                          {row.campaign_code} ·{' '}
                          <span className="text-slate-500 font-sans">
                            {row.product?.seller?.store_name || 'Jashore Direct'}
                          </span>
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <span className="font-bold text-emerald-400 text-sm">
                          {formatCurrency(row.group_price)}
                        </span>
                        {row.product?.base_price && (
                          <p className="text-[10px] text-slate-500 line-through">
                            {formatCurrency(row.product.base_price)}
                          </p>
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center justify-between text-[11px] text-slate-300 mb-1">
                          <span>{participants} joined</span>
                          <span className="font-semibold text-orange-400">{pct}%</span>
                        </div>
                        <div className="h-1.5 w-28 rounded-full bg-slate-800 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-orange-500 to-red-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="text-slate-300 font-medium">
                          {row.remaining_needed > 0 ? (
                            <span className="text-orange-400 font-bold">
                              {row.remaining_needed} more needed
                            </span>
                          ) : (
                            <span className="text-emerald-400 font-bold flex items-center gap-1">
                              <CheckCircle2 size={13} /> Target Reached
                            </span>
                          )}
                          <p className="text-[10px] text-slate-500 mt-0.5">
                            Goal: {row.target_participants} distinct buyers
                          </p>
                        </div>
                      </td>

                      <td className="px-5 py-4 text-slate-400 text-[11px]">
                        {row.end_at ? (
                          <div className="flex items-center gap-1">
                            <Clock size={12} className="text-orange-400" />
                            <span>{new Date(row.end_at).toLocaleDateString()}</span>
                          </div>
                        ) : (
                          'Open-ended'
                        )}
                      </td>

                      <td className="px-5 py-4">
                        {getStatusBadge(row.status)}
                      </td>

                      <td className="px-5 py-4 text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleInspectDrop(row)}
                          className="text-slate-400 hover:text-white hover:bg-slate-800"
                        >
                          <ArrowUpRight size={16} />
                        </Button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Inspect Drop Details Dialog */}
      <Dialog
        isOpen={Boolean(selectedDrop)}
        onClose={() => {
          setSelectedDrop(null)
          setSelectedDropDetails(null)
        }}
        title={selectedDrop?.title || 'Drop Campaign Details'}
        description={`Campaign Code: ${selectedDrop?.campaign_code || ''}`}
      >
        {selectedDrop && (
          <div className="space-y-4 pt-2 text-xs">
            {loadingDetails ? (
              <div className="py-8 text-center text-slate-400">
                <Loader2 size={24} className="mx-auto animate-spin text-orange-500 mb-2" />
                <span>Loading campaign breakdown...</span>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-3 bg-slate-950/80 p-3.5 rounded-xl border border-slate-800">
                  <div>
                    <span className="text-slate-500">Target Product:</span>
                    <p className="font-bold text-white mt-0.5">
                      {selectedDropDetails?.product?.title || selectedDrop.product?.title || 'Product'}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-500">Status:</span>
                    <div className="mt-0.5">{getStatusBadge(selectedDropDetails?.status || selectedDrop.status)}</div>
                  </div>
                  <div>
                    <span className="text-slate-500">Group Buy Price:</span>
                    <p className="font-bold text-emerald-400 text-sm mt-0.5">
                      {formatCurrency(selectedDrop.group_price)}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-500">Goal Progress:</span>
                    <p className="font-bold text-orange-400 text-sm mt-0.5">
                      {selectedDropDetails?.distinct_participants_count ?? selectedDrop.distinct_participants_count ?? 0} /{' '}
                      {selectedDrop.target_participants} distinct buyers
                    </p>
                  </div>
                </div>

                {/* Participant breakdown */}
                <div>
                  <h4 className="text-xs font-bold text-white mb-2 flex items-center gap-1.5">
                    <Users size={14} className="text-orange-400" />
                    <span>Committed Participants</span>
                  </h4>

                  {selectedDropDetails?.participants && selectedDropDetails.participants.length > 0 ? (
                    <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                      {selectedDropDetails.participants.map((p) => (
                        <div
                          key={p.id}
                          className="flex items-center justify-between p-2 rounded-lg bg-slate-800/60 border border-slate-700/50"
                        >
                          <div>
                            <p className="font-semibold text-white">{p.user?.name || 'Customer'}</p>
                            <p className="text-[10px] text-slate-400 font-mono">
                              {p.user?.phone} · Qty: {p.quantity}
                            </p>
                          </div>
                          <Badge
                            size="sm"
                            className={
                              p.status === 'confirmed'
                                ? 'bg-emerald-500/15 text-emerald-400'
                                : 'bg-orange-500/15 text-orange-400'
                            }
                          >
                            {p.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-center text-slate-400 text-[11px]">
                      No customers have joined this drop campaign yet.
                    </div>
                  )}
                </div>

                {/* Action Controls */}
                {selectedDrop.status === 'active' && (
                  <div className="pt-3 border-t border-slate-800 space-y-2">
                    <input
                      type="text"
                      placeholder="Reason for ending drop early (optional)..."
                      value={cancelReason}
                      onChange={(e) => setCancelReason(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder:text-slate-500 focus:border-brand focus:outline-none"
                    />

                    <Button
                      variant="outline"
                      size="sm"
                      disabled={cancelling}
                      onClick={() => handleCloseEarly(selectedDrop.id)}
                      className="w-full text-red-400 border-red-500/30 hover:bg-red-500/10 font-bold"
                    >
                      {cancelling ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <AlertTriangle size={15} />
                      )}
                      <span>Lock & Conclude Drop Early</span>
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </Dialog>

      {/* Launch New Drop Dialog */}
      <Dialog
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Launch New Volume Drop"
        description="Select a catalog product and set target customer quotas to catalyze group purchasing in Jashore."
      >
        <form onSubmit={handleCreateSubmit} className="space-y-3.5 pt-2 text-xs">
          {formError && (
            <div className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400">
              {formError}
            </div>
          )}

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Select Catalog Product</label>
            {loadingProducts ? (
              <div className="py-2 text-slate-400 flex items-center gap-2">
                <Loader2 size={14} className="animate-spin text-orange-500" />
                <span>Loading products...</span>
              </div>
            ) : (
              <select
                required
                value={formData.product_id}
                onChange={handleProductSelect}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:border-brand focus:outline-none"
              >
                <option value="">-- Choose a product to launch --</option>
                {productsList.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title} ({formatCurrency(p.base_price)}) - Stock: {p.stock_quantity ?? p.effective_stock}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Campaign Title</label>
            <input
              type="text"
              required
              placeholder="e.g. Handmade Keshabpur Clay Tea Set Volume Drop"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder:text-slate-500 focus:border-brand focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Drop Group Price (BDT)</label>
              <input
                type="number"
                step="0.01"
                required
                placeholder="999"
                value={formData.group_price}
                onChange={(e) => setFormData({ ...formData, group_price: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:border-brand focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Duration (Days)</label>
              <input
                type="number"
                required
                min="1"
                max="30"
                value={formData.durationDays}
                onChange={(e) => setFormData({ ...formData, durationDays: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:border-brand focus:outline-none"
              />
            </div>
          </div>

          <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 space-y-2.5">
            <p className="font-bold text-orange-400">Target Unlocking Rules</p>
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-slate-400 text-[11px] mb-1">
                  Target Distinct Buyers
                </label>
                <input
                  type="number"
                  min="2"
                  required
                  placeholder="e.g. 10"
                  value={formData.target_participants}
                  onChange={(e) => setFormData({ ...formData, target_participants: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
                />
              </div>
              <div>
                <label className="block text-slate-400 text-[11px] mb-1">
                  Max Limit Per Customer
                </label>
                <input
                  type="number"
                  min="1"
                  placeholder="e.g. 2"
                  value={formData.quantity_limit_per_customer}
                  onChange={(e) => setFormData({ ...formData, quantity_limit_per_customer: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
                />
              </div>
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setIsCreateOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="drop-fire"
              size="sm"
              disabled={submitting}
              className="font-bold bg-gradient-to-r from-orange-500 to-red-600 text-white"
            >
              {submitting ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Publishing...</span>
                </>
              ) : (
                'Publish Drop Campaign'
              )}
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  )
}
