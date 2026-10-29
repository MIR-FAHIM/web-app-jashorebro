import { useState, useEffect, useCallback } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import {
  ArrowUpRight,
  Package,
  ShoppingBag,
  Users,
  Loader2,
  History,
  AlertTriangle,
  Flame,
} from 'lucide-react'
import { Card } from '@/shared/ui/Card'
import { Badge } from '@/shared/ui/Badge'
import { Button } from '@/shared/ui/Button'
import { Dialog } from '@/shared/ui/Dialog'
import { DropProgress } from '@/features/drops/components/DropProgress'
import { dropFacts } from '@/features/drops/model/dropLifecycle'
import { useCart } from '@/features/cart/model/cartContext'
import { formatCurrency } from '@/shared/lib/formatCurrency'
import { checkoutApi } from '@/features/checkout/api/checkoutApi'
import { communityApi } from '@/features/community/api/communityApi'
import { OrderTimeline } from '@/features/orders/components/OrderTimeline'
import { useAuth } from '@/features/auth/model/authContext'

export default function ActivityPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { orderId } = useParams()
  const { isAuthenticated, isLoading: isAuthLoading, user } = useAuth()
  const { addItem } = useCart()
  const [tab, setTab] = useState('orders')

  // Customer orders state
  const [orders, setOrders] = useState([])
  const [loadingOrders, setLoadingOrders] = useState(false)
  const [ordersError, setOrdersError] = useState(null)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [loadingOrderDetails, setLoadingOrderDetails] = useState(false)
  const [orderDetailsError, setOrderDetailsError] = useState(null)
  const [detailAttempt, setDetailAttempt] = useState(0)
  const [cancelling, setCancelling] = useState(false)
  const [cancelReason, setCancelReason] = useState('')

  // Joined drops state
  const [joinedDrops, setJoinedDrops] = useState([])
  const [loadingDrops, setLoadingDrops] = useState(false)
  const [dropsError, setDropsError] = useState(null)

  const fetchOrders = useCallback(async () => {
    setLoadingOrders(true)
    setOrdersError(null)
    try {
      const res = await checkoutApi.getOrders()
      setOrders(res.data || [])
    } catch (err) {
      setOrdersError(err?.message || 'Failed to load your orders.')
    } finally {
      setLoadingOrders(false)
    }
  }, [])

  const fetchJoinedDrops = useCallback(async () => {
    setLoadingDrops(true)
    setDropsError(null)
    try {
      const data = await communityApi.drops.getJoinedDrops()
      setJoinedDrops(Array.isArray(data) ? data : [])
    } catch (err) {
      setDropsError(err?.message || 'Failed to load your joined drops.')
    } finally {
      setLoadingDrops(false)
    }
  }, [])

  useEffect(() => {
    if (!isAuthenticated || isAuthLoading) return
    fetchOrders()
    fetchJoinedDrops()
  }, [isAuthenticated, isAuthLoading, user?.id, fetchOrders, fetchJoinedDrops])

  useEffect(() => {
    let isCurrent = true
    setSelectedOrder(null)
    setOrderDetailsError(null)
    setCancelReason('')

    if (!orderId || !isAuthenticated || isAuthLoading) {
      setLoadingOrderDetails(false)
      return () => { isCurrent = false }
    }

    if (!/^[1-9]\d*$/.test(orderId)) {
      setOrderDetailsError('This order link is invalid. You can find your orders in the list.')
      setLoadingOrderDetails(false)
      return () => { isCurrent = false }
    }

    setLoadingOrderDetails(true)
    checkoutApi.getOrder(orderId)
      .then((order) => {
        if (!order?.id) throw new Error('Order details are unavailable. Please try again.')
        if (isCurrent) setSelectedOrder(order)
      })
      .catch((err) => {
        if (!isCurrent) return
        setOrderDetailsError([403, 404].includes(err.status)
          ? 'This order is unavailable or does not belong to your account.'
          : err.message || 'We could not load this order. Please try again.')
      })
      .finally(() => {
        if (isCurrent) setLoadingOrderDetails(false)
      })

    return () => { isCurrent = false }
  }, [orderId, isAuthenticated, isAuthLoading, user?.id, detailAttempt])

  const handleInspectOrder = (order) => {
    navigate(`/orders/${order.id}`, {
      state: { orderListFrom: { pathname: location.pathname, search: location.search, hash: location.hash } },
    })
  }

  const closeOrder = () => {
    const from = location.state?.orderListFrom
    navigate(from?.pathname === '/activity' || from?.pathname === '/orders'
      ? from
      : { pathname: '/orders', search: location.search, hash: location.hash }, { replace: true })
  }

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) {
      return
    }

    setCancelling(true)
    try {
      const res = await checkoutApi.cancelOrder(orderId, cancelReason || 'Cancelled by customer')
      const updated = res.data

      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, ...updated } : o))
      )
      setSelectedOrder(updated)
      setCancelReason('')
    } catch (err) {
      alert(err?.message || 'Failed to cancel order.')
    } finally {
      setCancelling(false)
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <Badge variant="warning">Order Placed</Badge>
      case 'awaiting_group':
        return <Badge variant="brand">Drop in Progress</Badge>
      case 'group_confirmed':
        return <Badge variant="brand">Group Unlocked</Badge>
      case 'processing':
        return <Badge variant="info">Preparing for Delivery</Badge>
      case 'shipped':
        return <Badge variant="info">Out for Delivery</Badge>
      case 'delivered':
        return <Badge variant="success">Delivered</Badge>
      case 'cancelled':
        return <Badge variant="danger">Cancelled</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  if (isAuthLoading) {
    return <div role="status" className="py-12 text-center text-muted">Loading your account…</div>
  }

  if (!isAuthenticated) {
    return (
      <Card className="mx-auto max-w-md space-y-4 p-7 text-center">
        <Package size={32} className="mx-auto text-brand" />
        <h1 className="text-xl font-semibold text-ink">Sign in to see your orders</h1>
        <p className="text-sm leading-relaxed text-muted">Track your orders, deliveries and joined Price Drops from your account.</p>
        <Link to="/auth" state={{ from: location }} className="inline-flex min-h-12 items-center justify-center rounded-xl bg-brand px-5 text-sm font-semibold text-on-brand">Sign in to continue</Link>
      </Card>
    )
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">Activity & Orders</h1>
        <p className="mt-1 text-sm text-muted">Track your group drops, orders, and delivery milestones.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <Card
          className={`p-4 cursor-pointer transition-all ${
            tab === 'drops' ? 'border-brand bg-brand/5 shadow-xs' : 'hover:border-field-border'
          }`}
          onClick={() => setTab('drops')}
        >
          <Flame size={19} className="mb-2 text-brand" />
          <p className="text-2xl font-bold text-ink">{joinedDrops.length}</p>
          <p className="mt-0.5 text-xs text-muted font-medium">Joined Drops</p>
        </Card>

        <Card
          className={`p-4 cursor-pointer transition-all ${
            tab === 'orders' ? 'border-emerald-500 bg-emerald-500/5 shadow-xs' : 'hover:border-field-border'
          }`}
          onClick={() => setTab('orders')}
        >
          <Package size={19} className="mb-2 text-emerald-600" />
          <p className="text-2xl font-bold text-ink">{orders.length}</p>
          <p className="mt-0.5 text-xs text-muted font-medium">My Orders</p>
        </Card>
      </div>

      <div className="flex gap-2 border-b border-line pb-3">
        {[
          ['orders', 'My Orders'],
          ['drops', 'Joined Drops'],
        ].map(([value, label]) => (
          <button
            key={value}
            onClick={() => setTab(value)}
            aria-pressed={tab === value}
            className={`min-h-11 rounded-xl px-4 text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              tab === value
                ? 'bg-ink text-canvas shadow-xs'
                : 'bg-surface text-soft hover:bg-elevated'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* TAB 1: DROPS */}
      {tab === 'drops' && (
        <div className="space-y-4">
          {loadingDrops ? (
            <div className="py-12 text-center text-muted space-y-2">
              <Loader2 size={24} className="mx-auto animate-spin text-brand" />
              <p className="text-xs">Loading joined community drops...</p>
            </div>
          ) : dropsError ? (
            <Card className="p-6 text-center space-y-3">
              <p className="text-sm text-red-500">{dropsError}</p>
              <Button variant="outline" size="sm" onClick={fetchJoinedDrops}>
                Retry
              </Button>
            </Card>
          ) : joinedDrops.length > 0 ? (
            joinedDrops.map((drop) => {
              const facts = dropFacts(drop)
              const participants = facts.qualifying
              const price = drop.group_price ?? drop.groupPrice

              return (
                <Card key={drop.id} className="space-y-4 p-4 sm:p-5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <Badge variant={drop.status === 'succeeded' ? 'unlocked' : 'brand'}>
                      {facts.statusLabel}
                    </Badge>
                    <span className="text-xs text-muted font-medium">
                      {participants} qualifying {participants === 1 ? 'buyer' : 'buyers'}
                    </span>
                  </div>

                  <Link to={`/drops/${drop.id}`} className="flex items-center gap-4">
                    {drop.image ? (
                      <img
                        src={drop.image}
                        alt={drop.title}
                        className="h-20 w-20 shrink-0 rounded-xl bg-elevated object-cover"
                      />
                    ) : (
                      <div className="h-20 w-20 shrink-0 rounded-xl bg-elevated flex items-center justify-center text-xs text-muted">
                        No image
                      </div>
                    )}
                    <div className="min-w-0">
                      <h2 className="text-base font-semibold leading-snug text-ink hover:text-brand truncate">
                        {drop.title}
                      </h2>
                      <p className="mt-1 text-xs text-muted">{drop.category}</p>
                    </div>
                  </Link>

                  <div className="border-t border-line pt-4">
                    <DropProgress
                      tiers={drop.tiers || []}
                      currentParticipants={participants}
                      retailPrice={drop.retailPrice || drop.retail_price}
                      groupPrice={price}
                      targetParticipants={facts.target}
                      status={drop.status}
                    />
                  </div>
                  <p className="text-xs text-muted">{facts.confirmed ? 'You have confirmed participation. Check your order for payment and delivery.' : facts.reserved ? 'You have a conditional order reservation awaiting the target.' : 'You expressed interest. This does not create an order or count toward the target.'}</p>

                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <Link
                      to={`/drops/${drop.id}`}
                      className="flex min-h-11 items-center gap-1.5 text-sm text-soft hover:text-brand"
                    >
                      View progress <ArrowUpRight size={16} />
                    </Link>
                    <Button
                      variant="outline"
                      disabled={!facts.canOrder || !drop.product?.id}
                      onClick={() => {
                        if (!dropFacts(drop).canOrder || !drop.product?.id) return
                        if (drop.requires_variant_selection || (!drop.variant && drop.product.has_active_variants)) {
                          navigate(`/drops/${drop.id}`)
                          return
                        }
                        addItem({ ...drop.product, image: drop.image }, 1, { purchase_mode: 'group_buy', campaign: drop, variant: drop.variant ? { ...drop.variant, name: drop.variant.name || drop.variant.title } : null })
                        navigate('/cart')
                      }}
                    >
                      <ShoppingBag size={16} /> Add conditional order · {formatCurrency(price)}
                    </Button>
                  </div>
                </Card>
              )
            })
          ) : (
            <Card className="space-y-3 p-8 text-center">
              <Users size={28} className="mx-auto text-brand" />
              <h2 className="text-lg font-semibold text-ink">No joined drops yet</h2>
              <p className="text-sm text-muted">
                Express interest or place a conditional order from a Price Drop. Interest alone does not reserve a product.
              </p>
              <div className="pt-2">
                <Button onClick={() => navigate('/explore')}>Explore Active Drops</Button>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* TAB 2: ORDERS */}
      {tab === 'orders' && (
        <div className="space-y-4">
          {loadingOrders ? (
            <div className="py-12 text-center text-muted space-y-2">
              <Loader2 size={24} className="mx-auto animate-spin text-brand" />
              <p className="text-xs">Loading your orders...</p>
            </div>
          ) : ordersError ? (
            <Card className="p-6 text-center space-y-3">
              <p className="text-sm text-red-500">{ordersError}</p>
              <Button variant="outline" size="sm" onClick={fetchOrders}>
                Retry
              </Button>
            </Card>
          ) : orders.length === 0 ? (
            <Card className="space-y-3 p-8 text-center">
              <Package size={28} className="mx-auto text-muted" />
              <h2 className="text-lg font-semibold text-ink">No orders yet</h2>
              <p className="text-sm text-muted">Browse our artisan catalog or join a volume drop to get started.</p>
              <div className="pt-2">
                <Button onClick={() => navigate('/explore')}>Explore Catalog</Button>
              </div>
            </Card>
          ) : (
            orders.map((order) => {
              const firstItem = order.items?.[0]
              const itemsCount = order.items?.length || 0

              return (
                <Card key={order.id} className="p-5 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line pb-3">
                    <div>
                      <span className="font-mono font-bold text-ink text-sm">#{order.order_number}</span>
                      <p className="text-xs text-muted mt-0.5">
                        {order.created_at ? new Date(order.created_at).toLocaleDateString() : ''}
                      </p>
                    </div>

                    <div>{getStatusBadge(order.status)}</div>
                  </div>

                  <div className="space-y-2">
                    <p className="font-semibold text-ink text-sm">
                      {firstItem?.product_title || 'Item'}
                      {itemsCount > 1 ? ` +${itemsCount - 1} more items` : ''}
                    </p>

                    <div className="flex items-center justify-between text-xs text-muted">
                      <span>Total Amount:</span>
                      <span className="font-bold text-ink text-sm">{formatCurrency(order.total_amount)}</span>
                    </div>

                    <div className="flex items-center justify-between text-xs text-muted">
                      <span>Destination:</span>
                      <span className="text-soft">
                        {order.shipping_upazila}, {order.shipping_district}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end gap-2 border-t border-line">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleInspectOrder(order)}
                      className="font-medium gap-1 text-xs"
                    >
                      <History size={14} className="text-brand" />
                      <span>Track Status Timeline</span>
                    </Button>
                  </div>
                </Card>
              )
            })
          )}
        </div>
      )}

      {/* Customer Order Timeline Dialog */}
      <Dialog
        isOpen={Boolean(orderId)}
        onClose={closeOrder}
        title={selectedOrder ? `Tracking: #${selectedOrder.order_number}` : 'Order details'}
        description="Fulfillment progress and recorded timeline milestones"
      >
        {loadingOrderDetails && (
          <div role="status" className="space-y-2 py-8 text-center text-muted">
            <Loader2 size={24} className="mx-auto animate-spin text-brand" />
            <p className="text-sm">Loading your order…</p>
          </div>
        )}
        {orderDetailsError && (
          <div className="space-y-4 py-5 text-center">
            <p role="alert" className="text-sm text-danger">{orderDetailsError}</p>
            <Button variant="outline" onClick={() => setDetailAttempt((attempt) => attempt + 1)}>Try again</Button>
            <Button variant="ghost" onClick={closeOrder}>Back to orders</Button>
          </div>
        )}
        {selectedOrder && (
          <div className="space-y-4 pt-2 text-xs max-h-[75vh] overflow-y-auto pr-1">
            <div className="p-3.5 bg-elevated rounded-xl border border-line space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-muted">Current Status:</span>
                <div>{getStatusBadge(selectedOrder.status)}</div>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Total Paid / COD:</span>
                <span className="font-bold text-ink text-sm">{formatCurrency(selectedOrder.total_amount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Deliver to:</span>
                <span className="text-soft font-medium text-right max-w-[240px]">
                  {selectedOrder.shipping_address}, {selectedOrder.shipping_upazila}
                </span>
              </div>
            </div>

            <div className="pt-2">
              <h4 className="font-bold text-ink mb-2">Order Timeline</h4>
              {loadingOrderDetails ? (
                <div className="py-6 text-center text-muted space-y-1">
                  <Loader2 size={18} className="mx-auto animate-spin text-brand" />
                  <span className="text-[11px]">Loading status timeline...</span>
                </div>
              ) : (
                <OrderTimeline
                  histories={selectedOrder.status_histories || selectedOrder.statusHistories || []}
                  isAdmin={false}
                />
              )}
            </div>

            {['pending', 'awaiting_group'].includes(selectedOrder.status) && (
              <div className="pt-3 border-t border-line space-y-2">
                <input
                  type="text"
                  placeholder="Reason for cancellation (optional)..."
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full bg-surface border border-line rounded-xl px-3 py-1.5 text-xs text-ink placeholder:text-muted focus:border-brand focus:outline-none"
                />

                <Button
                  variant="outline"
                  size="sm"
                  disabled={cancelling}
                  onClick={() => handleCancelOrder(selectedOrder.id)}
                  className="w-full text-red-500 border-red-500/30 hover:bg-red-500/10 font-semibold"
                >
                  {cancelling ? (
                    <Loader2 size={13} className="animate-spin" />
                  ) : (
                    <AlertTriangle size={14} />
                  )}
                  <span>Cancel This Order</span>
                </Button>
              </div>
            )}

            <div className="pt-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={closeOrder}
                className="w-full"
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </Dialog>
    </div>
  )
}
