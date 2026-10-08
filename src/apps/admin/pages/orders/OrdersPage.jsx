import { useState, useEffect, useCallback } from 'react'
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
} from 'lucide-react'
import { Card } from '@/shared/ui/Card'
import { Badge } from '@/shared/ui/Badge'
import { Button } from '@/shared/ui/Button'
import { Dialog } from '@/shared/ui/Dialog'
import { formatCurrency } from '@/shared/lib/formatCurrency'
import { adminCatalogApi } from '@/apps/admin/api/adminCatalogApi'

export default function OrdersPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('All')
  const [query, setQuery] = useState('')
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [updating, setUpdating] = useState(false)
  const [updateError, setUpdateError] = useState('')
  const [statusNotes, setStatusNotes] = useState('')

  const fetchOrders = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const statusParam = activeTab === 'All' ? 'all' : activeTab.toLowerCase()
      const res = await adminCatalogApi.getOrders({
        q: query,
        status: statusParam,
      })
      setOrders(res.data || [])
    } catch (err) {
      setError(err?.message || 'Failed to load orders.')
    } finally {
      setLoading(false)
    }
  }, [activeTab, query])

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchOrders()
    }, 250)
    return () => clearTimeout(timer)
  }, [fetchOrders])

  const handleUpdateStatus = async (newStatus, newPaymentStatus = null) => {
    if (!selectedOrder) return
    setUpdating(true)
    setUpdateError('')

    try {
      const payload = {
        status: newStatus,
        notes: statusNotes || undefined,
      }
      if (newPaymentStatus) {
        payload.payment_status = newPaymentStatus
      }

      const res = await adminCatalogApi.updateOrderStatus(selectedOrder.id, payload)
      const updated = res.data

      setOrders((prev) =>
        prev.map((o) => (o.id === selectedOrder.id ? { ...o, ...updated } : o))
      )
      setSelectedOrder((prev) => ({ ...prev, ...updated }))
      setStatusNotes('')
    } catch (err) {
      setUpdateError(err?.message || 'Failed to update order status.')
    } finally {
      setUpdating(false)
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'delivered':
        return (
          <Badge size="sm" className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30">
            Delivered
          </Badge>
        )
      case 'shipped':
        return (
          <Badge size="sm" className="bg-blue-500/15 text-blue-400 border-blue-500/30">
            Shipped
          </Badge>
        )
      case 'processing':
        return (
          <Badge size="sm" className="bg-purple-500/15 text-purple-400 border-purple-500/30">
            Processing
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
          <Badge size="sm" className="bg-orange-500/15 text-orange-400 border-orange-500/30">
            Pending
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
              Fulfillment & Dispatch
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Orders & Local Dispatch
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-400 max-w-2xl">
            Track customer purchases and group buys, manage hub dispatches across Jashore, and update delivery states.
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
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          {['All', 'Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition-all shrink-0 ${
                activeTab === tab
                  ? 'bg-orange-500/15 text-orange-400 border border-orange-500/30'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:max-w-xs">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search order #, customer, phone..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder:text-slate-500 focus:border-brand focus:outline-none"
          />
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
                <th scope="col" className="px-5 py-3.5">Status</th>
                <th scope="col" className="px-5 py-3.5 text-right">Details</th>
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
                        #{order.order_number}
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
                          onClick={() => setSelectedOrder(order)}
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

      {/* Order Details Modal */}
      <Dialog
        isOpen={Boolean(selectedOrder)}
        onClose={() => {
          setSelectedOrder(null)
          setUpdateError('')
        }}
        title={`Order #${selectedOrder?.order_number}`}
        description="Customer fulfillment details and dispatch state transitions"
      >
        {selectedOrder && (
          <div className="space-y-4 pt-2 text-xs">
            {updateError && (
              <div className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400">
                {updateError}
              </div>
            )}

            {/* Customer & Shipping Summary */}
            <div className="p-3.5 bg-slate-950/80 rounded-xl border border-slate-800 space-y-2">
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
                <span className="text-slate-500">Payment:</span>
                <span className="font-medium text-slate-300 flex items-center gap-1.5">
                  <span className="uppercase">{selectedOrder.payment_method || 'COD'}</span>
                  {getPaymentBadge(selectedOrder.payment_status)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Placed on:</span>
                <span className="font-mono text-slate-400">
                  {new Date(selectedOrder.created_at).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Items Table */}
            <div>
              <p className="font-bold text-slate-300 mb-2">Order Items ({selectedOrder.items?.length || 0})</p>
              <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                {selectedOrder.items?.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800"
                  >
                    <div>
                      <p className="font-bold text-white">{item.product_title}</p>
                      <p className="text-[10px] text-slate-400">
                        {item.variant_name ? `Option: ${item.variant_name} · ` : ''}
                        Qty: {item.quantity} · Mode: {item.purchase_mode}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-emerald-400">{formatCurrency(item.line_total)}</p>
                      <p className="text-[10px] text-slate-500">{formatCurrency(item.unit_price)} each</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Totals */}
            <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 space-y-1.5 text-[11px]">
              <div className="flex justify-between text-slate-400">
                <span>Subtotal:</span>
                <span>{formatCurrency(selectedOrder.subtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Shipping Fee:</span>
                <span>{formatCurrency(selectedOrder.shipping_fee)}</span>
              </div>
              <div className="flex justify-between font-bold text-white text-xs pt-1 border-t border-slate-800">
                <span>Total Amount:</span>
                <span className="text-emerald-400">{formatCurrency(selectedOrder.total_amount)}</span>
              </div>
            </div>

            {/* State Transition Controls */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <p className="text-slate-400 font-semibold">Change Dispatch Status:</p>
              <div className="grid grid-cols-4 gap-1.5">
                {['pending', 'processing', 'shipped', 'delivered'].map((st) => (
                  <button
                    key={st}
                    type="button"
                    disabled={updating}
                    onClick={() => handleUpdateStatus(st)}
                    className={`py-2 px-2 rounded-xl font-bold border capitalize transition-all text-center ${
                      selectedOrder.status === st
                        ? 'bg-orange-500/20 text-orange-400 border-orange-500/40'
                        : 'bg-slate-900 text-slate-400 border-slate-700 hover:text-white'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-slate-400">Payment:</span>
                <div className="flex gap-1.5">
                  {['unpaid', 'paid', 'refunded'].map((pst) => (
                    <button
                      key={pst}
                      type="button"
                      disabled={updating}
                      onClick={() => handleUpdateStatus(selectedOrder.status, pst)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase border transition-all ${
                        selectedOrder.payment_status === pst
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      {pst}
                    </button>
                  ))}
                </div>
              </div>

              {selectedOrder.status !== 'cancelled' && (
                <div className="pt-2">
                  <button
                    type="button"
                    disabled={updating}
                    onClick={() => {
                      if (window.confirm('Cancel this order and release inventory/group reservations?')) {
                        handleUpdateStatus('cancelled')
                      }
                    }}
                    className="w-full py-1.5 rounded-lg border border-red-500/30 text-red-400 text-xs hover:bg-red-500/10 transition-colors font-medium"
                  >
                    Cancel Order & Restock Inventory
                  </button>
                </div>
              )}
            </div>

            <div className="pt-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setSelectedOrder(null)}
                className="w-full"
              >
                Done
              </Button>
            </div>
          </div>
        )}
      </Dialog>
    </div>
  )
}
