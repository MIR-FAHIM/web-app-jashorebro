import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShieldCheck, Truck, Check } from 'lucide-react'
import { Card } from '@/shared/ui/Card'
import { Input } from '@/shared/ui/Input'
import { Button } from '@/shared/ui/Button'
import { Badge } from '@/shared/ui/Badge'
import { formatCurrency } from '@/shared/lib/formatCurrency'

export default function CheckoutPage() {
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isComplete, setIsComplete] = useState(false)

  const [form, setForm] = useState({
    name: 'Fahim Ahmed',
    phone: '01712345678',
    address: 'House 14, Road 3, Mujib Sarak, Jashore',
    city: 'Jashore',
    paymentMethod: 'cod', // 'cod' | 'bkash'
  })

  const orderItem = {
    title: 'Vintage Oversized Corduroy Hoodie',
    category: 'Streetwear',
    size: 'L',
    color: 'Oatmeal',
    unlockedPrice: 999,
    retailPrice: 1200,
    shippingFee: 60,
  }

  const total = orderItem.unlockedPrice + orderItem.shippingFee

  const handleSubmit = (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setTimeout(() => {
      setIsSubmitting(false)
      setIsComplete(true)
    }, 700)
  }

  if (isComplete) {
    return (
      <div className="max-w-md mx-auto text-center py-10 space-y-4">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
          <Check size={32} />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Drop Order Confirmed!</h2>
        <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
          You got the community unlocked price of {formatCurrency(orderItem.unlockedPrice)}. The seller is preparing the batch shipment to Jashore.
        </p>
        <Button variant="primary" onClick={() => navigate('/activity')} className="mt-4">
          View in Activity
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Checkout Unlocked Drop</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Confirm delivery address and payment to finalize your spot.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Form (2 columns on desktop) */}
        <form onSubmit={handleSubmit} className="md:col-span-2 space-y-4">
          <Card className="p-5 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Truck size={17} className="text-orange-500" /> Delivery Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Full Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
              <Input
                label="Phone Number"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                required
              />
            </div>

            <Input
              label="Delivery Address"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              required
            />

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="District / City"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                required
              />
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-700">Campus Pickup</label>
                <select className="w-full px-3 py-2.5 text-sm bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none">
                  <option>Home Delivery (৳60)</option>
                  <option>JUST Campus Hub (Free / ৳20)</option>
                  <option>MMC College Hub (Free / ৳20)</option>
                </select>
              </div>
            </div>
          </Card>

          {/* Payment Method */}
          <Card className="p-5 space-y-3">
            <h3 className="text-sm font-bold text-slate-900">Payment Option</h3>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <label
                className={`p-3 rounded-xl border cursor-pointer flex flex-col justify-between transition-all ${
                  form.paymentMethod === 'cod'
                    ? 'border-[var(--color-brand)] bg-orange-50/40 text-slate-900 font-bold'
                    : 'border-slate-200 text-slate-600'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={form.paymentMethod === 'cod'}
                  onChange={() => setForm({ ...form, paymentMethod: 'cod' })}
                  className="hidden"
                />
                <span>Cash on Delivery</span>
                <span className="text-[11px] text-slate-400 font-normal mt-1">Pay when parcel arrives</span>
              </label>

              <label
                className={`p-3 rounded-xl border cursor-pointer flex flex-col justify-between transition-all ${
                  form.paymentMethod === 'bkash'
                    ? 'border-[var(--color-brand)] bg-orange-50/40 text-slate-900 font-bold'
                    : 'border-slate-200 text-slate-600'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={form.paymentMethod === 'bkash'}
                  onChange={() => setForm({ ...form, paymentMethod: 'bkash' })}
                  className="hidden"
                />
                <span>bKash Instant</span>
                <span className="text-[11px] text-slate-400 font-normal mt-1">Instant digital payment</span>
              </label>
            </div>
          </Card>

          <Button type="submit" variant="drop-fire" size="lg" className="w-full" isLoading={isSubmitting}>
            Place Drop Order • {formatCurrency(total)}
          </Button>
        </form>

        {/* Order Summary (Adjacent on desktop) */}
        <div className="space-y-4">
          <Card className="p-5 space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Order Summary</h3>

            <div className="flex gap-3 pb-3 border-b border-slate-100">
              <img
                src="https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=200&q=80"
                alt="Product"
                className="w-14 h-14 rounded-xl object-cover bg-slate-100 shrink-0"
              />
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-bold text-slate-900 line-clamp-1">
                  {orderItem.title}
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Size: {orderItem.size} • Color: {orderItem.color}
                </p>
                <Badge variant="unlocked" size="sm" className="mt-1">
                  Tier 3 Price
                </Badge>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-slate-500">
                <span>Community Unlocked Price</span>
                <span className="text-slate-900 font-semibold">{formatCurrency(orderItem.unlockedPrice)}</span>
              </div>
              <div className="flex justify-between text-emerald-600 font-medium">
                <span>Your Group Savings</span>
                <span>-{formatCurrency(orderItem.retailPrice - orderItem.unlockedPrice)}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Shipping Fee</span>
                <span className="text-slate-900 font-semibold">{formatCurrency(orderItem.shippingFee)}</span>
              </div>
              <div className="pt-2 border-t border-slate-100 flex justify-between text-sm font-extrabold text-slate-900">
                <span>Total Amount</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </div>
          </Card>

          <div className="p-3 rounded-xl bg-slate-100 text-slate-600 text-[11px] flex items-center gap-2">
            <ShieldCheck size={16} className="text-emerald-600 shrink-0" />
            <span>Guaranteed lowest unlocked tier price fulfillment.</span>
          </div>
        </div>
      </div>
    </div>
  )
}
