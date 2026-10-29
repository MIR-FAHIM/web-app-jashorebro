import { useState, useEffect, useCallback, useRef } from 'react'
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
import { formatDropDeadline } from '@/features/drops/model/dropLifecycle'

export default function DropManagementPage() {
  const [drops, setDrops] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('All')
  const [page, setPage] = useState(1)
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0 })
  const listRequest = useRef(0)
  const detailRequest = useRef(0)
  const creating = useRef(false)
  const cancellingRef = useRef(false)
  const [selectedDrop, setSelectedDrop] = useState(null)
  const [selectedDropDetails, setSelectedDropDetails] = useState(null)
  const [loadingDetails, setLoadingDetails] = useState(false)
  const [detailError, setDetailError] = useState('')
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [cancelling, setCancelling] = useState(false)
  const [cancelReason, setCancelReason] = useState('')
  const [cancelError, setCancelError] = useState('')

  // Product list for selecting when launching a drop
  const [productsList, setProductsList] = useState([])
  const [loadingProducts, setLoadingProducts] = useState(false)
  const [productsError, setProductsError] = useState('')
  const [productsRetry, setProductsRetry] = useState(0)
  const [productsQuery, setProductsQuery] = useState('')

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
    const requestId = ++listRequest.current
    setLoading(true)
    setError(null)
    try {
      const statusParam = activeTab === 'All' ? 'all' : activeTab === 'Expired' ? 'failed' : activeTab.toLowerCase()
      const res = await adminCatalogApi.getDropCampaigns({ status: statusParam, page })
      if (listRequest.current !== requestId) return
      setDrops(res.data || [])
      setMeta(res.meta || { current_page: page, last_page: page, total: res.data?.length || 0 })
    } catch (err) {
      if (listRequest.current === requestId) setError(err?.message || 'Failed to load drop campaigns.')
    } finally {
      if (listRequest.current === requestId) setLoading(false)
    }
  }, [activeTab, page])

  useEffect(() => {
    fetchDrops()
    return () => { listRequest.current += 1 }
  }, [fetchDrops])

  // Load products lookup when create dialog opens
  useEffect(() => {
    let active = true
    if (isCreateOpen) {
      setLoadingProducts(true)
      setProductsError('')
      adminCatalogApi
        .getProducts({ per_page: 100, q: productsQuery, status: 'published', is_group_buy_enabled: true })
        .then((res) => {
          if (!active) return
          setProductsList(res.data || [])
        })
        .catch((failure) => { if (active) setProductsError(failure.message || 'Unable to load eligible products.') })
        .finally(() => { if (active) setLoadingProducts(false) })
    }
    return () => { active = false }
  }, [isCreateOpen, productsRetry, productsQuery])

  // When selected product changes in form, prefill title and base price
  const handleProductSelect = (e) => {
    const prodId = e.target.value
    const found = productsList.find((p) => p.id.toString() === prodId.toString())
    if (found) {
      setFormData((prev) => ({
        ...prev,
        product_id: prodId,
        title: prev.title || `${found.title} - Jashore Volume Drop`,
        group_price: '',
      }))
    } else {
      setFormData((prev) => ({ ...prev, product_id: prodId }))
    }
  }

  // Load full details when inspecting a drop
  const handleInspectDrop = async (drop) => {
    const requestId = ++detailRequest.current
    setSelectedDrop(drop)
    setSelectedDropDetails(null)
    setDetailError('')
    setLoadingDetails(true)
    setCancelReason('')
    setCancelError('')
    try {
      const details = await adminCatalogApi.getDropCampaign(drop.id)
      if (detailRequest.current !== requestId) return
      setSelectedDropDetails(details)
    } catch (failure) {
      if (detailRequest.current === requestId) setDetailError(failure.message || 'Unable to load the campaign breakdown.')
    } finally {
      if (detailRequest.current === requestId) setLoadingDetails(false)
    }
  }

  const handleCreateSubmit = async (e) => {
    e.preventDefault()
    if (creating.current) return
    setFormError('')
    if (!formData.product_id) {
      setFormError('Please select a product for this volume drop.')
      return
    }

    creating.current = true
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
        start_at: startDate.toISOString(),
        end_at: endDate.toISOString(),
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
      creating.current = false
      setSubmitting(false)
    }
  }

  const handleCloseEarly = async (id) => {
    if (cancellingRef.current || !selectedDropDetails || loadingDetails || detailError) return
    if (!cancelReason.trim()) {
      setCancelError('Enter a cancellation reason before cancelling this Drop.')
      return
    }
    if (!window.confirm('Cancel this active Drop? Its conditional orders will be cancelled and stock released. Any received payment needs separate manual refund review.')) {
      return
    }

    cancellingRef.current = true
    setCancelling(true)
    try {
      await adminCatalogApi.cancelDropCampaign(id, cancelReason.trim())
      setSelectedDrop(null)
      setSelectedDropDetails(null)
      fetchDrops()
    } catch (err) {
      setCancelError(err?.message || 'Failed to cancel drop campaign.')
    } finally {
      cancellingRef.current = false
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
            Manage conditional prices, qualifying buyer targets, deadlines and order reservations.
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
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
        {['All', 'Active', 'Succeeded', 'Expired', 'Cancelled', 'Draft'].map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => { setPage(1); setActiveTab(tab) }}
            className={`min-h-11 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
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
                  const participants = row.qualifying_participants_count ?? row.distinct_participants_count ?? 0
                  const target = row.target_participants ?? 0
                  const pct = row.progress_percent ?? Math.min(100, Math.round((participants / target) * 100))
                  const regularPrice = Number(row.variant?.price_override ?? row.product?.base_price)

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
                        {regularPrice > Number(row.group_price) && (
                          <p className="text-[10px] text-slate-500 line-through">
                            {formatCurrency(regularPrice)}
                          </p>
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center justify-between text-[11px] text-slate-300 mb-1">
                          <span>{participants} qualifying buyers</span>
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
                          {Number(target) > Number(participants) ? (
                            <span className="text-orange-400 font-bold">
                              {Math.max(0, Number(target) - Number(participants))} more needed
                            </span>
                          ) : (
                            <span className="text-emerald-400 font-bold flex items-center gap-1">
                              {row.status === 'succeeded' ? <><CheckCircle2 size={13} /> Target Reached</> : 'No additional buyers needed'}
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
                            <span>{formatDropDeadline(row.end_at)} · BD time</span>
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
                          aria-label={`Inspect ${row.title}`}
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
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400"><span>Page {meta.current_page} of {meta.last_page} · {meta.total} campaigns</span><div className="flex gap-2"><Button variant="outline" size="sm" disabled={loading || page <= 1} onClick={() => setPage((value) => value - 1)}>Previous page</Button><Button variant="outline" size="sm" disabled={loading || page >= Number(meta.last_page)} onClick={() => setPage((value) => value + 1)}>Next page</Button></div></div>

      {/* Inspect Drop Details Dialog */}
      <Dialog
        isOpen={Boolean(selectedDrop)}
        onClose={() => {
          if (cancellingRef.current) return
          detailRequest.current += 1
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
            ) : detailError ? <div role="alert" className="space-y-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-400"><p>{detailError}</p><Button variant="outline" size="sm" onClick={() => handleInspectDrop(selectedDrop)}>Retry campaign details</Button></div> : (
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
                    <span>Interest and order records</span>
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
                      No interest or order participation records yet.
                    </div>
                  )}
                </div>

                {/* Action Controls */}
                {selectedDropDetails?.status === 'active' && (
                  <div className="pt-3 border-t border-slate-800 space-y-2">
                    <p className="text-xs leading-relaxed text-slate-400">Cancelling before success cancels conditional orders and releases stock. Received payments need separate manual refund review.</p>
                    {cancelError && <p role="alert" className="text-xs text-red-400">{cancelError}</p>}
                    <label htmlFor="drop-cancel-reason" className="block text-xs text-slate-300">Cancellation reason (required)</label>
                    <input
                      id="drop-cancel-reason"
                      type="text"
                      placeholder="Explain why this Drop is being cancelled"
                      value={cancelReason}
                      onChange={(e) => { setCancelReason(e.target.value); setCancelError('') }}
                      disabled={cancelling}
                      maxLength={500}
                      className="min-h-11 w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder:text-slate-500 focus:border-brand focus:outline-none"
                    />

                    <Button
                      variant="outline"
                      size="sm"
                      disabled={cancelling || !cancelReason.trim()}
                      onClick={() => handleCloseEarly(selectedDrop.id)}
                      className="w-full text-red-400 border-red-500/30 hover:bg-red-500/10 font-bold"
                    >
                      {cancelling ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <AlertTriangle size={15} />
                      )}
                      <span>Cancel Drop and conditional reservations</span>
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
        onClose={() => { if (!creating.current) setIsCreateOpen(false) }}
        title="Launch New Volume Drop"
        description="Set one conditional price and a distinct-customer target. Success closes new orders. Before success, expiry or cancellation releases reservations; payments require separate manual refund review."
      >
        <form onSubmit={handleCreateSubmit} className="space-y-3.5 pt-2 text-xs">
          <fieldset disabled={submitting} className="m-0 min-w-0 space-y-3.5 border-0 p-0 [&_input]:min-h-11 [&_select]:min-h-11"><legend className="sr-only">New Drop campaign</legend>
          {formError && (
            <div className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400">
              {formError}
            </div>
          )}

          <div>
            <label htmlFor="drop-product-query" className="block text-slate-300 font-semibold mb-1">Find eligible catalog products</label>
            <input id="drop-product-query" value={productsQuery} onChange={(event) => setProductsQuery(event.target.value)} placeholder="Search product title" className="mb-3 min-h-11 w-full rounded-xl border border-slate-700 bg-slate-900 px-3 text-white placeholder:text-slate-500" />
            <label htmlFor="drop-product-id" className="block text-slate-300 font-semibold mb-1">Select Catalog Product</label>
            {loadingProducts ? (
              <div className="py-2 text-slate-400 flex items-center gap-2">
                <Loader2 size={14} className="animate-spin text-orange-500" />
                <span>Loading products...</span>
              </div>
            ) : productsError ? <div role="alert" className="space-y-2 text-red-400"><p>{productsError}</p><Button type="button" variant="outline" size="sm" onClick={() => setProductsRetry((value) => value + 1)}>Retry eligible products</Button></div> : (
              <select
                id="drop-product-id"
                required
                value={formData.product_id}
                onChange={handleProductSelect}
                className="min-h-11 w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:border-brand focus:outline-none"
              >
                <option value="">-- Choose a product to launch --</option>
                {productsList.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title} ({formatCurrency(p.base_price)}) - Stock: {p.stock_quantity ?? p.effective_stock}
                  </option>
                ))}
              </select>
            )}
            {!loadingProducts && !productsError && productsList.length === 0 && <p className="mt-2 text-slate-400">No eligible products match this search.</p>}
          </div>

          <div>
            <label htmlFor="drop-campaign-title" className="block text-slate-300 font-semibold mb-1">Campaign Title</label>
            <input
              id="drop-campaign-title"
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
              <label htmlFor="drop-group-price" className="block text-slate-300 font-semibold mb-1">Conditional Drop Price (BDT)</label>
              <input
                id="drop-group-price"
                type="number"
                step="0.01"
                min="0.01"
                required
                placeholder="999"
                value={formData.group_price}
                onChange={(e) => setFormData({ ...formData, group_price: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:border-brand focus:outline-none"
              />
            </div>
            <div>
              <label htmlFor="drop-duration" className="block text-slate-300 font-semibold mb-1">Duration (Days)</label>
              <input
                id="drop-duration"
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
                <label htmlFor="drop-target" className="block text-slate-400 text-[11px] mb-1">
                  Target Distinct Buyers
                </label>
                <input
                  id="drop-target"
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
                <label htmlFor="drop-customer-limit" className="block text-slate-400 text-[11px] mb-1">
                  Max Limit Per Customer
                </label>
                <input
                  id="drop-customer-limit"
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
              disabled={submitting || loadingProducts || Boolean(productsError)}
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
          </fieldset>
        </form>
      </Dialog>
    </div>
  )
}
