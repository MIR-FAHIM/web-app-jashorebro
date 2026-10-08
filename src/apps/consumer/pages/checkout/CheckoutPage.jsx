import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Check, CreditCard, MapPin, ShoppingBag, AlertCircle, ShieldCheck, Truck } from 'lucide-react'
import { Card } from '@/shared/ui/Card'
import { Input } from '@/shared/ui/Input'
import { Button } from '@/shared/ui/Button'
import { Badge } from '@/shared/ui/Badge'
import { useCart } from '@/features/cart/model/cartContext'
import { useAuth } from '@/features/auth/model/authContext'
import { formatCurrency } from '@/shared/lib/formatCurrency'
import { checkoutApi } from '@/features/checkout/api/checkoutApi'

const JASHORE_UPAZILAS = [
  'Jashore Sadar',
  'Keshabpur',
  'Jhikargacha',
  'Abhaynagar (Noapara)',
  'Manirampur',
  'Sharsha (Benapole)',
  'Bagherpara',
  'Chaugachha',
]

export default function CheckoutPage() {
  const navigate = useNavigate()
  const { items, subtotal, itemCount, clearCart } = useCart()
  const { user, isAuthenticated } = useAuth()

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [confirmedOrder, setConfirmedOrder] = useState(null)
  const [errorMessage, setErrorMessage] = useState('')
  const [quote, setQuote] = useState(null)
  const [isQuoting, setIsQuoting] = useState(false)

  const [form, setForm] = useState({
    name: user?.name || 'Fahim Ahmed',
    phone: user?.phone || '01712345678',
    address: 'Holding 42, Mujib Sarak',
    upazila: 'Jashore Sadar',
    district: 'Jashore',
    paymentMethod: 'cod',
    notes: '',
  })

  // Fetch server-validated quote
  useEffect(() => {
    if (!items.length) return

    let isMounted = true
    setIsQuoting(true)

    const payloadItems = items.map((i) => ({
      product_id: i.product_id,
      variant_id: i.variant_id,
      quantity: i.quantity,
      purchase_mode: i.purchase_mode || 'normal',
      campaign_id: i.campaign_id,
    }))

    checkoutApi.getQuote(payloadItems, form.upazila)
      .then((data) => {
        if (isMounted) setQuote(data)
      })
      .catch((err) => {
        if (isMounted) {
          setErrorMessage(err.message || 'Unable to quote pricing from server.')
        }
      })
      .finally(() => {
        if (isMounted) setIsQuoting(false)
      })

    return () => {
      isMounted = false
    }
  }, [items, form.upazila])

  const updateField = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    setErrorMessage('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (isSubmitting || !items.length) return

    if (!isAuthenticated) {
      navigate('/auth', { state: { from: { pathname: '/checkout' } } })
      return
    }

    setIsSubmitting(true)
    setErrorMessage('')

    try {
      const orderPayload = {
        items: items.map((i) => ({
          product_id: i.product_id,
          variant_id: i.variant_id,
          quantity: i.quantity,
          purchase_mode: i.purchase_mode || 'normal',
          campaign_id: i.campaign_id,
        })),
        payment_method: form.paymentMethod,
        shipping_name: form.name,
        shipping_phone: form.phone,
        shipping_district: form.district,
        shipping_upazila: form.upazila,
        shipping_address: form.address,
        notes: form.notes,
      }

      const order = await checkoutApi.placeOrder(orderPayload)
      setConfirmedOrder(order)
      clearCart()
    } catch (err) {
      setErrorMessage(err.message || 'Failed to place order. Please check stock and details.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Confirmed Order Screen
  if (confirmedOrder) {
    return (
      <div className="mx-auto max-w-xl py-10 px-4">
        <Card className="space-y-6 p-6 sm:p-9 text-center bg-slate-900 border-slate-800 text-white shadow-2xl">
          <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <Check size={32} />
          </div>

          <div className="space-y-1">
            <Badge variant="unlocked" className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
              Order Confirmed & Logged
            </Badge>
            <h1 className="text-2xl font-black text-white tracking-tight">
              Thank You For Your Order!
            </h1>
            <p className="text-xs font-mono text-orange-400 font-bold mt-1">
              Order Reference: {confirmedOrder.order_number}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-left space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-500">Delivery To:</span>
              <span className="font-bold text-white">{confirmedOrder.shipping_name} ({confirmedOrder.shipping_phone})</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Destination:</span>
              <span className="text-slate-300">{confirmedOrder.shipping_address}, {confirmedOrder.shipping_upazila}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Payment Mode:</span>
              <span className="font-bold text-orange-400 uppercase">{confirmedOrder.payment_method}</span>
            </div>
            <div className="flex justify-between border-t border-slate-800 pt-2 font-bold">
              <span className="text-slate-400">Total Payable:</span>
              <span className="text-emerald-400 text-sm">{formatCurrency(confirmedOrder.total_amount)}</span>
            </div>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            Your order has been recorded in the Jashore fulfillment queue. The seller will verify packaging and contact you before regional dispatch.
          </p>

          <Button
            variant="drop-fire"
            className="w-full font-bold"
            onClick={() => navigate('/explore')}
          >
            <span>Discover More Finds</span>
            <ArrowRight size={17} />
          </Button>
        </Card>
      </div>
    )
  }

  if (!items.length) {
    return (
      <Card className="mx-auto max-w-lg space-y-4 px-6 py-16 text-center bg-slate-900 border-slate-800 text-white">
        <ShoppingBag size={40} className="mx-auto text-orange-500" />
        <h1 className="text-2xl font-bold text-white">Your cart is empty</h1>
        <p className="text-xs text-slate-400">Add an authentic find from Jashore artisans before checking out.</p>
        <Link to="/explore" className="inline-block mt-2">
          <Button variant="drop-fire" size="sm">Explore Products <ArrowRight size={16} /></Button>
        </Link>
      </Card>
    )
  }

  const effectiveTotal = quote?.total_amount ?? subtotal
  const effectiveShipping = quote?.shipping_fee ?? 60

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <Link to="/cart" className="inline-flex min-h-11 items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white">
        <ArrowLeft size={16} /> Back to cart
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">Checkout & Delivery</h1>
          <p className="mt-1 text-xs text-slate-400">Review your products, local dispatch destination, and payment preference.</p>
        </div>
        <Badge variant="unlocked" className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
          <ShieldCheck size={13} />
          <span>Real-time Verified</span>
        </Badge>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-xl bg-red-950/80 border border-red-500/50 text-red-200 text-xs flex items-center gap-2.5">
          <AlertCircle size={16} className="text-red-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid items-start gap-6 lg:grid-cols-3">
        {/* Left 2 Cols: Delivery & Payment Details */}
        <div className="space-y-5 lg:col-span-2">
          {/* Delivery Information */}
          <Card className="space-y-4 p-5 sm:p-6 bg-slate-900 border-slate-800 text-white">
            <h2 className="flex items-center gap-2 text-sm font-bold text-white">
              <MapPin size={18} className="text-orange-500" /> Delivery Details (Jashore Region)
            </h2>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={updateField}
                  required
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:border-brand focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={updateField}
                  required
                  placeholder="017XXXXXXXX"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:border-brand focus:outline-none"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Upazila / Area</label>
                <select
                  name="upazila"
                  value={form.upazila}
                  onChange={updateField}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-brand focus:outline-none"
                >
                  {JASHORE_UPAZILAS.map((up) => (
                    <option key={up} value={up}>{up}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">District</label>
                <input
                  type="text"
                  name="district"
                  value={form.district}
                  readOnly
                  className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-400 cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Detailed Street Address / Landmark</label>
              <textarea
                name="address"
                rows={2}
                value={form.address}
                onChange={updateField}
                required
                placeholder="House, road, landmark, student hall, or village center"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:border-brand focus:outline-none"
              />
            </div>
          </Card>

          {/* Payment Preference */}
          <Card className="space-y-4 p-5 sm:p-6 bg-slate-900 border-slate-800 text-white">
            <h2 className="flex items-center gap-2 text-sm font-bold text-white">
              <CreditCard size={18} className="text-orange-500" /> Payment Method
            </h2>

            <div className="grid gap-3 sm:grid-cols-2">
              <label
                className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3.5 transition-all ${
                  form.paymentMethod === 'cod'
                    ? 'border-orange-500 bg-orange-500/10'
                    : 'border-slate-800 bg-slate-950 hover:border-slate-700'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cod"
                  checked={form.paymentMethod === 'cod'}
                  onChange={updateField}
                  className="mt-0.5 h-4 w-4 accent-orange-500"
                />
                <div>
                  <span className="block text-xs font-bold text-white">Cash on Delivery (COD)</span>
                  <span className="block text-[11px] text-slate-400 mt-0.5">Pay in cash when parcel arrives at your door</span>
                </div>
              </label>

              <label
                className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3.5 transition-all ${
                  form.paymentMethod === 'bkash'
                    ? 'border-orange-500 bg-orange-500/10'
                    : 'border-slate-800 bg-slate-950 hover:border-slate-700'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="bkash"
                  checked={form.paymentMethod === 'bkash'}
                  onChange={updateField}
                  className="mt-0.5 h-4 w-4 accent-orange-500"
                />
                <div>
                  <span className="block text-xs font-bold text-white">bKash (MFS Manual / COD)</span>
                  <span className="block text-[11px] text-slate-400 mt-0.5">Pay via bKash personal upon dispatch confirmation</span>
                </div>
              </label>
            </div>
          </Card>
        </div>

        {/* Right Col: Order Summary */}
        <aside className="space-y-4 lg:sticky lg:top-24">
          <Card className="space-y-4 p-5 sm:p-6 bg-slate-900 border-slate-800 text-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-sm font-bold text-white">Order Summary</h2>
              <span className="text-xs text-slate-400">{itemCount} items</span>
            </div>

            {/* Line items preview */}
            <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
              {items.map((item) => (
                <div key={item.lineId} className="flex gap-3 text-xs">
                  {item.image && (
                    <img src={item.image} alt="" className="size-12 shrink-0 rounded-lg object-cover bg-slate-800 border border-slate-700" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-white truncate">{item.title}</p>
                    <p className="text-[11px] text-slate-400">
                      Qty {item.quantity} · {formatCurrency(item.price)}
                    </p>
                    {item.purchase_mode === 'group_buy' && (
                      <Badge size="xs" variant="brand" className="bg-orange-500/20 text-orange-400 border-orange-500/30 mt-0.5">
                        Drop Participant
                      </Badge>
                    )}
                  </div>
                  <span className="font-bold text-white text-xs">
                    {formatCurrency(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            {/* Price Breakdown */}
            <div className="space-y-2 border-t border-slate-800 pt-3 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Subtotal</span>
                <span className="font-medium text-white">{formatCurrency(quote?.subtotal ?? subtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Shipping Fee</span>
                <span className="font-medium text-white">
                  {effectiveShipping === 0 ? 'FREE' : formatCurrency(effectiveShipping)}
                </span>
              </div>
              <div className="flex items-center justify-between border-t border-slate-800 pt-3 text-sm font-bold">
                <span className="text-white">Order Total</span>
                <span className="text-base text-orange-400 font-extrabold">{formatCurrency(effectiveTotal)}</span>
              </div>
            </div>

            <Button
              type="submit"
              variant="drop-fire"
              className="w-full font-bold gap-2"
              size="lg"
              isLoading={isSubmitting}
            >
              <span>Confirm & Place Order</span>
              <ArrowRight size={17} />
            </Button>

            <p className="text-center text-[11px] text-slate-500 flex items-center justify-center gap-1.5">
              <ShieldCheck size={13} className="text-emerald-400" />
              <span>Inventory reserved on server upon confirmation</span>
            </p>
          </Card>
        </aside>
      </form>
    </div>
  )
}
