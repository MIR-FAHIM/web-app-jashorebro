import { useState, useEffect, useCallback, useRef } from 'react'
import {
  Package,
  Search,
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  ArrowUpRight,
  Loader2,
  RefreshCw,
  AlertCircle,
  XCircle,
  CreditCard,
  User,
  History,
  Shield,
  FileText,
} from 'lucide-react'
import { Card } from '@/shared/ui/Card'
import { Badge } from '@/shared/ui/Badge'
import { Button } from '@/shared/ui/Button'
import { Dialog } from '@/shared/ui/Dialog'
import { formatCurrency } from '@/shared/lib/formatCurrency'
import { adminCatalogApi } from '@/apps/admin/api/adminCatalogApi'
import { OrderTimeline } from '@/features/orders/components/OrderTimeline'

export default function OrdersPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('All')
  const [channelFilter, setChannelFilter] = useState('all')
  const [query, setQuery] = useState('')
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [loadingDetails, setLoadingDetails] = useState(false)
  const [updating, setUpdating] = useState(false)
  const [updateError, setUpdateError] = useState('')
  const [detailsError, setDetailsError] = useState('')
  const [paymentAction, setPaymentAction] = useState(null)
  const detailsVersion = useRef(0)
  const listVersion = useRef(0)
  const actionBusy = useRef(false)

  // Status transition form state
  const [newStatus, setNewStatus] = useState('')
  const [statusReason, setStatusReason] = useState('')
  const [statusInternalNote, setStatusInternalNote] = useState('')

  const fetchOrders = useCallback(async () => {
    const version = ++listVersion.current
    setLoading(true)
    setError(null)
    try {
      const statusParam = activeTab === 'All' ? 'all' : activeTab.toLowerCase()
      const res = await adminCatalogApi.getOrders({
        q: query,
        status: statusParam,
        channel: channelFilter,
      })
      if (version !== listVersion.current) return
      if (!Array.isArray(res.data)) throw new Error('The order list could not be verified.')
      setOrders(res.data)
    } catch (err) {
      if (version === listVersion.current) setError(err?.message || 'Failed to load orders.')
    } finally {
      if (version === listVersion.current) setLoading(false)
    }
  }, [activeTab, channelFilter, query])

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchOrders()
    }, 250)
    return () => { clearTimeout(timer); listVersion.current += 1 }
  }, [fetchOrders])

  // Open order details modal and load fresh status timeline
  const handleInspectOrder = async (order) => {
    if (actionBusy.current) return
    const version = ++detailsVersion.current
    setSelectedOrder(order)
    setNewStatus(order.status)
    setStatusReason('')
    setStatusInternalNote('')
    setUpdateError('')
    setDetailsError('')
    setPaymentAction(null)
    setLoadingDetails(true)

    try {
      const freshOrder = await adminCatalogApi.getOrder(order.id)
      if (detailsVersion.current !== version) return
      if (!freshOrder?.id) throw new Error('Order details could not be verified.')
      setSelectedOrder(freshOrder)
      setNewStatus(freshOrder.status)
    } catch (err) {
      if (detailsVersion.current === version) setDetailsError(err.message || 'Could not load current order details. Retry before changing this order.')
    } finally {
      if (detailsVersion.current === version) setLoadingDetails(false)
    }
  }

  // Submit status transition and/or payment status update
  const handleStatusTransitionSubmit = async (e) => {
    e.preventDefault()
    if (!selectedOrder || actionBusy.current || loadingDetails || detailsError) return
    const orderId = selectedOrder.id
    actionBusy.current = true
    setUpdating(true)
    setUpdateError('')

    try {
      const payload = {
        status: newStatus,
        reason: statusReason.trim() || undefined,
        internal_note: statusInternalNote.trim() || undefined,
      }

      const response = await adminCatalogApi.updateOrderStatus(orderId, payload)
      const updated = response?.data ?? response
      if (!updated?.id) throw new Error('The order update was not confirmed. Refresh this order before retrying.')

      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, ...updated } : o))
      )
      setSelectedOrder(updated)
      setNewStatus(updated.status)
      setStatusReason('')
      setStatusInternalNote('')
      setPaymentAction(null)
    } catch (err) {
      setUpdateError(err?.message || 'Failed to update order status transition.')
    } finally {
      actionBusy.current = false
      setUpdating(false)
    }
  }

  // Update payment status independently
  const handleUpdatePaymentStatus = async (paymentStatus) => {
    if (!selectedOrder || actionBusy.current || loadingDetails || detailsError || paymentStatus === selectedOrder.payment_status) return
    if (paymentStatus === 'refunded' && !statusReason.trim()) {
      setUpdateError('Enter the full-refund reason in Customer-Visible Explanation before recording a refund.'); return
    }
    const orderId = selectedOrder.id
    actionBusy.current = true
    setUpdating(true)
    setUpdateError('')

    try {
      const response = await adminCatalogApi.updateOrderStatus(orderId, {
        payment_status: paymentStatus,
        reason: statusReason.trim() || undefined,
        internal_note: statusInternalNote.trim() || undefined,
      })
      const updated = response?.data ?? response
      if (!updated?.id) throw new Error('The payment update was not confirmed. Refresh this order before retrying.')

      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, ...updated } : o))
      )
      setSelectedOrder(updated)
      setNewStatus(updated.status)
      setStatusReason('')
      setStatusInternalNote('')
      setPaymentAction(null)
    } catch (err) {
      setUpdateError(err?.message || 'Failed to update payment status.')
    } finally {
      actionBusy.current = false
      setUpdating(false)
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'awaiting_group':
        return (
          <Badge size="sm" className="bg-amber-500/15 text-amber-400 border-amber-500/30">
            Awaiting Drop
          </Badge>
        )
      case 'pending':
        return (
          <Badge size="sm" className="bg-orange-500/15 text-orange-400 border-orange-500/30">
            Pending
          </Badge>
        )
      case 'processing':
        return (
          <Badge size="sm" className="bg-purple-500/15 text-purple-400 border-purple-500/30">
            Processing
          </Badge>
        )
      case 'shipped':
        return (
          <Badge size="sm" className="bg-blue-500/15 text-blue-400 border-blue-500/30">
            Shipped
          </Badge>
        )
      case 'delivered':
        return (
          <Badge size="sm" className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30">
            Delivered
          </Badge>
        )
      case 'cancelled':
        return (
          <Badge size="sm" className="bg-red-500/15 text-red-400 border-red-500/30">
            Cancelled
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

  const getPaymentBadge = (status) => {
    switch (status) {
      case 'paid':
        return (
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
            Paid
          </span>
        )
      case 'refunded':
        return (
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700 font-semibold">
            Refunded
          </span>
        )
      default:
        return (
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-semibold">
            Unpaid (COD)
          </span>
        )
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Package size={18} className="text-orange-500" />
            <span className="text-xs font-bold uppercase tracking-wider text-orange-400">
              Fulfillment & Timeline Dispatch
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Orders & Local Dispatch
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-400 max-w-2xl">
            Track customer purchases, manage hub dispatches across Jashore, and review append-only status transition histories.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={fetchOrders}
          disabled={loading}
          className="border-slate-800 text-slate-400 hover:text-white shrink-0 self-start sm:self-auto"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          <span className="ml-1.5">Refresh</span>
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-3 border-b border-slate-800 pb-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
            {['All', 'Awaiting_Group', 'Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`rounded-xl px-4 py-2 text-xs font-bold transition-all shrink-0 capitalize ${
                  activeTab.toLowerCase() === tab.toLowerCase()
                    ? 'bg-orange-500/15 text-orange-400 border border-orange-500/30'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                {tab.replace('_', ' ')}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={channelFilter}
              onChange={(e) => setChannelFilter(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:border-brand focus:outline-none shrink-0"
              title="Filter by sales channel"
            >
              <option value="all">All Channels</option>
              <option value="pos">Store POS Terminal</option>
              <option value="web">Online Web Store</option>
            </select>

            <div className="relative w-full sm:w-64">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search order #, customer..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder:text-slate-500 focus:border-brand focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3.5 text-xs text-red-400 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={fetchOrders} className="underline font-semibold ml-2">Retry</button>
        </div>
      )}

      {/* Orders Table */}
      <Card className="bg-slate-900 border-slate-800 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[750px] text-left text-xs">
            <thead className="bg-slate-950/60 text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th scope="col" className="px-5 py-3.5">Order Ref</th>
                <th scope="col" className="px-5 py-3.5">Customer & Phone</th>
                <th scope="col" className="px-5 py-3.5">Items & Type</th>
                <th scope="col" className="px-5 py-3.5">Total & Payment</th>
                <th scope="col" className="px-5 py-3.5">Destination Hub / Area</th>
                <th scope="col" className="px-5 py-3.5">Current Status</th>
                <th scope="col" className="px-5 py-3.5 text-right">Timeline</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <Loader2 size={24} className="mx-auto animate-spin text-orange-500 mb-2" />
                    <span>Loading customer orders...</span>
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <p className="font-semibold text-white">No orders found</p>
                    <p className="text-xs text-slate-500 mt-1">
                      {query ? 'No orders match your search criteria.' : `No orders in "${activeTab}" status.`}
                    </p>
                  </td>
                </tr>
              ) : (
                orders.map((order) => {
                  const firstItem = order.items?.[0]
                  const itemsCount = order.items?.length || 0
                  const isGroupBuy = order.items?.some((i) => i.purchase_mode === 'group_buy')

                  return (
                    <tr key={order.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="px-5 py-4 font-mono font-bold text-white">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span>#{order.order_number}</span>
                          {(order.channel === 'pos' || order.order_number?.startsWith('JB-POS-')) && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/15 text-purple-400 font-semibold border border-purple-500/30">
                              POS
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-500 font-sans mt-0.5">
                          {order.created_at ? new Date(order.created_at).toLocaleDateString() : ''}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <p className="font-bold text-white">
                          {order.shipping_name || order.user?.name || 'Customer'}
                        </p>
                        <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                          {order.shipping_phone || order.user?.phone || 'No phone'}
                        </p>
                      </td>

                      <td className="px-5 py-4 max-w-[200px]">
                        <p className="font-medium text-slate-200 truncate">
                          {firstItem?.product_title || 'Item'}
                          {itemsCount > 1 ? ` +${itemsCount - 1} more` : ''}
                        </p>
                        <div className="flex items-center gap-1.5 mt-1">
                          {isGroupBuy ? (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-orange-500/15 text-orange-400 font-semibold border border-orange-500/30">
                              Drop Buy
                            </span>
                          ) : (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-medium">
                              Direct Buy
                            </span>
                          )}
                          {firstItem?.variant_name && (
                            <span className="text-[10px] text-slate-400 truncate">
                              ({firstItem.variant_name})
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <p className="text-emerald-400 font-bold text-sm">
                          {formatCurrency(order.total_amount)}
                        </p>
                        <div className="mt-1">{getPaymentBadge(order.payment_status)}</div>
                        {order.requires_refund_review && <p className="mt-1 text-xs font-semibold text-warning">Refund review needed</p>}
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5 text-slate-300">
                          <MapPin size={13} className="text-orange-400 shrink-0" />
                          <span className="font-medium truncate max-w-[140px]">
                            {order.shipping_upazila || order.shipping_district || 'Jashore'}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 truncate max-w-[150px] mt-0.5">
                          {order.shipping_address}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        {getStatusBadge(order.status)}
                      </td>

                      <td className="px-5 py-4 text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleInspectOrder(order)}
                          aria-label={`Inspect order ${order.order_number}`}
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

      {/* Order Details & Chronological Timeline Modal */}
      <Dialog
        isOpen={Boolean(selectedOrder)}
        onClose={() => {
          if (actionBusy.current) return
          detailsVersion.current += 1
          setSelectedOrder(null)
          setUpdateError('')
        }}
        title={`Order #${selectedOrder?.order_number}`}
        description="Fulfillment timeline, audit logs, and verified status transitions"
      >
        {selectedOrder && (
          <div className="space-y-4 pt-2 text-xs max-h-[80vh] overflow-y-auto pr-1">
            {detailsError && <div role="alert" className="space-y-2 rounded-xl border border-red-500/30 p-3"><p className="text-red-300">{detailsError}</p><Button variant="secondary" onClick={() => handleInspectOrder(selectedOrder)}>Retry order details</Button></div>}
            {updateError && (
              <div className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400">
                {updateError}
              </div>
            )}

            {/* Customer & Shipping Summary */}
            <div className="p-3.5 bg-slate-950/80 rounded-xl border border-slate-800 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Sales Channel:</span>
                <div>
                  {selectedOrder.channel === 'pos' || selectedOrder.order_number?.startsWith('JB-POS-') ? (
                    <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/30 font-semibold">
                      Store POS Terminal
                    </span>
                  ) : (
                    <span className="text-slate-300 font-medium text-[11px]">Online Web Store</span>
                  )}
                </div>
              </div>
              {selectedOrder.discount_reason && (
                <div className="flex justify-between">
                  <span className="text-slate-500">POS Discount Note:</span>
                  <span className="font-medium text-amber-300 text-[11px]">{selectedOrder.discount_reason}</span>
                </div>
              )}
              {selectedOrder.amount_received != null && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Cash Tender:</span>
                  <span className="font-mono text-slate-300 text-[11px]">
                    Recv: {formatCurrency(selectedOrder.amount_received)} | Change: {formatCurrency(selectedOrder.change_amount || 0)}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-slate-500">Customer:</span>
                <span className="font-bold text-white">
                  {selectedOrder.shipping_name || selectedOrder.user?.name} (
                  {selectedOrder.shipping_phone || selectedOrder.user?.phone})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Destination:</span>
                <span className="font-medium text-slate-300 text-right max-w-[250px]">
                  {selectedOrder.shipping_address}, {selectedOrder.shipping_upazila},{' '}
                  {selectedOrder.shipping_district}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Payment Status:</span>
                <div className="flex items-center gap-1.5">
                  <span className="uppercase text-slate-300 font-medium">{selectedOrder.payment_method || 'COD'}</span>
                  {getPaymentBadge(selectedOrder.payment_status)}
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Current Status:</span>
                <div>{getStatusBadge(selectedOrder.status)}</div>
              </div>
            </div>

            {/* Chronological Status Timeline (Append-Only) */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                  <History size={14} className="text-orange-400" />
                  <span>Status Transition Timeline</span>
                </h4>
                <span className="text-[10px] text-slate-500">Append-Only Audit</span>
              </div>

              {loadingDetails ? (
                <div className="py-6 text-center text-slate-400">
                  <Loader2 size={18} className="mx-auto animate-spin text-orange-500 mb-1" />
                  <span className="text-[11px]">Loading verified history...</span>
                </div>
              ) : (
                <OrderTimeline
                  histories={selectedOrder.status_histories || selectedOrder.statusHistories || []}
                  isAdmin={true}
                />
              )}
            </div>

            {/* Payment changes have their own audit trail, separate from delivery. */}
            <section aria-labelledby="payment-history-heading" className="space-y-2 rounded-xl border border-slate-800 p-3">
              <h4 id="payment-history-heading" className="font-semibold text-white">Payment history</h4>
              {loadingDetails ? <p role="status" className="text-slate-400">Loading payment history…</p> : (selectedOrder.payment_histories ?? selectedOrder.paymentHistories)?.length ? (selectedOrder.payment_histories ?? selectedOrder.paymentHistories).map((entry) => <div key={entry.id} className="space-y-1 border-t border-slate-800 pt-2 text-slate-300"><p className="font-semibold">{entry.from_status ?? 'Initial'} → {entry.to_status}</p><p>{entry.reason ?? 'No explanation recorded'}</p><p className="text-[11px] text-slate-500">{entry.occurred_at ? new Date(entry.occurred_at).toLocaleString() : 'Time unavailable'} · {(entry.changed_by_user ?? entry.changedByUser)?.name ?? 'System'}</p>{entry.internal_note && <p className="text-[11px] text-amber-300">Internal: {entry.internal_note}</p>}</div>) : <p className="text-slate-400">No payment changes recorded.</p>}
            </section>

            {/* Items Summary */}
            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 space-y-2">
              <p className="font-bold text-slate-300 text-[11px]">
                Items ({selectedOrder.items?.length || 0}) · Total: {formatCurrency(selectedOrder.total_amount)}
              </p>
              <div className="space-y-2">
                {selectedOrder.items?.map((item) => (
                  <div
                    key={item.id}
                    className="space-y-2 p-3 rounded-lg bg-slate-900 border border-slate-800/80 text-xs"
                  >
                    <div className="flex flex-wrap justify-between gap-2">
                      <div className="min-w-0 break-words">
                        <span className="font-semibold text-white">{item.product_title}</span>
                        <span className="text-slate-400 ml-1.5">× {item.quantity}</span>
                      </div>
                      <span className="font-bold text-emerald-400">{formatCurrency(item.line_total)}</span>
                    </div>
                    <details className="rounded-lg border border-slate-800 p-2">
                      <summary className="min-h-11 cursor-pointer font-semibold text-slate-300">Item #{item.id} · Commission trace</summary>
                      <div className="space-y-2 break-words text-slate-400">
                        <p>Source: {item.earning_model?.replace(/_/g, ' ') || 'Direct'}{item.recommendation_code ? ' · Pick code ' + item.recommendation_code : ''}{item.group_buy_campaign_id ? ' · Campaign #' + item.group_buy_campaign_id : ''}{item.community_shop_id ? ' · Shop #' + item.community_shop_id : ''}</p>
                        <p>Recommender: {item.recommender?.name ?? (item.recommender_id ? '#' + item.recommender_id : 'None')} · Beneficiary: {item.beneficiary?.name ?? (item.beneficiary_user_id ? '#' + item.beneficiary_user_id : 'None')}</p>
                        <p>Per item: recommendation {formatCurrency(item.commission_amount ?? 0)} · other channel earning {formatCurrency(item.seller_earning ?? 0)} · quantity {item.quantity}</p>
                        <details><summary className="flex min-h-11 cursor-pointer items-center text-slate-300">Commercial snapshot at purchase</summary><pre className="whitespace-pre-wrap break-all rounded-lg bg-slate-950 p-2 text-[11px]">{JSON.stringify(item.commercial_terms_snapshot ?? {}, null, 2)}</pre></details>
                        {(item.earnings_ledgers ?? item.earningsLedgers)?.length ? <div className="space-y-2">{(item.earnings_ledgers ?? item.earningsLedgers).map((entry) => <div key={entry.id} className="rounded-lg border border-slate-800 p-2"><p>Ledger #{entry.id} · {entry.type?.replace(/_/g, ' ')} · {formatCurrency(entry.amount)} · {entry.status}</p><p>{entry.description}</p>{entry.source_ledger_id && <p>Source earning event #{entry.source_ledger_id}</p>}{entry.payout_request_id && <p>Payout request #{entry.payout_request_id} · {(entry.payout_request ?? entry.payoutRequest)?.status ?? 'See payout review'}{(entry.payout_request ?? entry.payoutRequest)?.transaction_reference ? ' · Reference ' + (entry.payout_request ?? entry.payoutRequest).transaction_reference : ''}</p>}</div>)}</div> : <p>No earnings event recorded for this item.</p>}
                      </div>
                    </details>
                  </div>
                ))}
              </div>
            </div>

            {/* Permitted Status Transition Controls */}
            <form onSubmit={handleStatusTransitionSubmit} className="space-y-2.5 pt-3 border-t border-slate-800">
              <p className="text-slate-300 font-bold flex items-center gap-1.5">
                <Shield size={13} className="text-orange-400" />
                <span>Execute Permitted Transition</span>
              </p>

              <div>
                <label htmlFor="order-target-status" className="block text-slate-400 text-[11px] mb-1">Target Status</label>
                <select
                  id="order-target-status"
                  disabled={updating || loadingDetails || Boolean(detailsError)}
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="min-h-11 w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-white focus:border-brand focus:outline-none"
                >
                  {selectedOrder.status === 'awaiting_group' && <option value="awaiting_group">Awaiting group target</option>}
                  <option value="pending" disabled={selectedOrder.status === 'awaiting_group'}>Pending (Awaiting Fulfillment)</option>
                  <option value="processing" disabled={selectedOrder.status === 'awaiting_group'}>Processing (Preparing & Packing)</option>
                  <option value="shipped" disabled={selectedOrder.status === 'awaiting_group'}>Shipped (Dispatched to Courier / Hub)</option>
                  <option value="delivered" disabled={selectedOrder.status === 'awaiting_group'}>Delivered (Handed to Customer)</option>
                  <option value="cancelled">Cancelled (Restock & Abort)</option>
                </select>
                {selectedOrder.status === 'awaiting_group' && <p className="mt-2 text-xs leading-relaxed text-muted">This order waits for its Drop target. The campaign unlocks fulfillment automatically; it can be cancelled before then.</p>}
                {selectedOrder.requires_refund_review && <p role="status" className="mt-2 text-xs leading-relaxed text-warning">Payment is still recorded as paid for this cancelled order. Review and arrange its refund separately, then record the completed full refund. Cancellation has not sent money.</p>}
              </div>

              <div>
                <label htmlFor="order-status-reason" className="block text-slate-400 text-[11px] mb-1">
                  Customer-Visible Explanation <span className="text-slate-500">(Required for regressions and full refunds)</span>
                </label>
                <input
                  id="order-status-reason"
                  disabled={updating || loadingDetails || Boolean(detailsError)}
                  type="text"
                  placeholder="e.g. Dispatched via Doratana Hub Rider #4"
                  value={statusReason}
                  onChange={(e) => setStatusReason(e.target.value)}
                  className="min-h-11 w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-white placeholder:text-slate-500 focus:border-brand focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="order-internal-note" className="block text-slate-400 text-[11px] mb-1 flex items-center gap-1">
                  <span>Internal Staff Note</span>
                  <span className="text-amber-400/80 text-[10px]">(Visible ONLY to Admins)</span>
                </label>
                <input
                  id="order-internal-note"
                  disabled={updating || loadingDetails || Boolean(detailsError)}
                  type="text"
                  placeholder="e.g. Courier tracking code: DH-90812, batch 4"
                  value={statusInternalNote}
                  onChange={(e) => setStatusInternalNote(e.target.value)}
                  className="min-h-11 w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-white placeholder:text-slate-500 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                <span className="text-slate-400 text-[11px]">Update Payment Status:</span>
                <div className="flex flex-wrap gap-1.5">
                  {['unpaid', 'paid', 'refunded'].map((pst) => (
                    <button
                      key={pst}
                      type="button"
                      disabled={updating || loadingDetails || Boolean(detailsError) || selectedOrder.payment_status === pst || (selectedOrder.payment_status !== 'unpaid' && pst === 'unpaid') || (selectedOrder.payment_status === 'refunded') || (pst === 'refunded' && selectedOrder.payment_status !== 'paid')}
                      onClick={() => setPaymentAction(pst)}
                      className={`min-h-11 px-3 py-2 rounded-lg text-xs font-bold uppercase border transition-all ${
                        selectedOrder.payment_status === pst
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      {pst === 'refunded' ? 'Full refund' : pst}
                    </button>
                  ))}
                </div>
              </div>
              {paymentAction && <div className="space-y-3 rounded-xl border border-amber-500/40 bg-amber-950/20 p-3 text-sm" role="region" aria-label="Confirm payment status update"><p>{paymentAction === 'refunded' ? 'Confirm the full customer refund of ' + formatCurrency(selectedOrder.total_amount) + ' has been handled externally. This reverses related earnings and can create recovery against future earnings.' : 'Confirm payment of ' + formatCurrency(selectedOrder.total_amount) + ' has been received. A paid and delivered order can release earnings immediately.'}</p><div className="flex flex-wrap gap-2"><Button variant="secondary" disabled={updating} onClick={() => setPaymentAction(null)}>Cancel payment update</Button><Button disabled={updating || loadingDetails || Boolean(detailsError)} onClick={() => handleUpdatePaymentStatus(paymentAction)}>{updating ? 'Recording…' : paymentAction === 'refunded' ? 'Confirm full refund record' : 'Confirm payment received'}</Button></div></div>}
              <p className="text-[11px] leading-relaxed text-slate-400">Confirm payment only after receipt. Earnings require both paid and delivered. A full refund reverses this order's earnings and requires an explanation; this records the refund status, and does not send money. Partial refunds are not supported here.</p>

              <div className="pt-2 flex justify-end gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  disabled={updating}
                  onClick={() => { detailsVersion.current += 1; setSelectedOrder(null) }}
                >
                  Close
                </Button>
                <Button
                  type="submit"
                  variant="drop-fire"
                  size="sm"
                  disabled={updating || loadingDetails || Boolean(detailsError) || newStatus === selectedOrder.status}
                  className="font-bold bg-gradient-to-r from-orange-500 to-red-600 text-white"
                >
                  {updating ? (
                    <>
                      <Loader2 size={13} className="animate-spin" />
                      <span>Recording...</span>
                    </>
                  ) : (
                    'Record Transition'
                  )}
                </Button>
              </div>
            </form>
          </div>
        )}
      </Dialog>
    </div>
  )
}
