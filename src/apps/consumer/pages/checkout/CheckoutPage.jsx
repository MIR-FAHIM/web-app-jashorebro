import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Check, CreditCard, MapPin, ShoppingBag } from 'lucide-react'
import { Card } from '@/shared/ui/Card'
import { Input } from '@/shared/ui/Input'
import { Button } from '@/shared/ui/Button'
import { Badge } from '@/shared/ui/Badge'
import { useCart } from '@/features/cart/model/cartContext'
import { formatCurrency } from '@/shared/lib/formatCurrency'

export default function CheckoutPage() {
  const navigate = useNavigate()
  const { items, subtotal, itemCount, clearCart } = useCart()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [savedOrder, setSavedOrder] = useState(null)
  const [form, setForm] = useState({ name: 'Fahim Ahmed', phone: '01712345678', address: '', city: 'Jashore', paymentMethod: 'cod' })
  const updateField = (event) => setForm((previous) => ({ ...previous, [event.target.name]: event.target.value }))
  const handleSubmit = (event) => {
    event.preventDefault()
    if (isSubmitting) return
    setIsSubmitting(true)
    const snapshot = { items: items.map((item) => ({ ...item })), subtotal, itemCount }
    setTimeout(() => {
      setSavedOrder(snapshot)
      clearCart()
      setIsSubmitting(false)
    }, 500)
  }

  if (savedOrder) return <div className="mx-auto max-w-xl py-8"><Card className="space-y-5 p-6 text-center sm:p-9"><div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success-soft text-success"><Check size={30} /></div><Badge variant="unlocked">Demo complete</Badge><h1 className="text-2xl font-semibold tracking-tight text-ink">Your order preview is ready</h1><p className="text-[15px] leading-relaxed text-muted">{savedOrder.itemCount} {savedOrder.itemCount === 1 ? 'item' : 'items'} in one order, with an items total of {formatCurrency(savedOrder.subtotal)}. Your cart has been cleared for the next preview.</p><p className="rounded-xl bg-elevated p-4 text-sm leading-relaxed text-soft">No real order was sent and no payment was taken. Delivery and payment will be confirmed when ordering is enabled.</p><Button className="w-full" onClick={() => navigate('/explore')}>Discover more finds <ArrowRight size={17} /></Button></Card></div>

  if (!items.length) return <Card className="mx-auto max-w-lg space-y-4 px-6 py-12 text-center"><ShoppingBag size={36} className="mx-auto text-brand" /><h1 className="text-2xl font-semibold text-ink">Your cart is empty</h1><p className="text-[15px] text-muted">Add a good find before reviewing your order.</p><Button onClick={() => navigate('/explore')}>Explore products <ArrowRight size={17} /></Button></Card>

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <Link to="/cart" className="inline-flex min-h-11 items-center gap-2 text-sm text-muted hover:text-ink"><ArrowLeft size={17} /> Back to cart</Link>
      <div className="flex flex-wrap items-start justify-between gap-3"><div><h1 className="text-3xl font-semibold tracking-tight text-ink">Make it yours</h1><p className="mt-2 text-[15px] text-muted">Review your items and delivery details.</p></div><Badge>Checkout preview</Badge></div>
      <form onSubmit={handleSubmit} className="grid items-start gap-6 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <Card className="space-y-5 p-5 sm:p-6"><h2 className="flex items-center gap-2 text-lg font-semibold text-ink"><MapPin size={19} className="text-brand" /> Delivery details</h2><div className="grid gap-4 sm:grid-cols-2"><Input id="checkout-name" name="name" label="Full name" autoComplete="name" value={form.name} onChange={updateField} required /><Input id="checkout-phone" name="phone" label="Phone number" type="tel" inputMode="tel" autoComplete="tel" pattern="([+]?88)?01[3-9][0-9]{8}" title="Enter a valid Bangladesh mobile number" value={form.phone} onChange={updateField} required /></div><Input id="checkout-address" name="address" label="Delivery address" autoComplete="street-address" placeholder="House, road, area, and a nearby landmark" value={form.address} onChange={updateField} required /><Input id="checkout-city" name="city" label="District / city" autoComplete="address-level2" value={form.city} onChange={updateField} required /><p className="text-xs leading-relaxed text-muted">Delivery availability and fees will be confirmed by the seller.</p></Card>
          <Card className="space-y-4 p-5 sm:p-6"><h2 className="flex items-center gap-2 text-lg font-semibold text-ink"><CreditCard size={19} className="text-brand" /> Payment preference</h2><fieldset className="grid gap-3 sm:grid-cols-2"><legend className="sr-only">Choose a payment preference for this preview</legend>{[['cod', 'Cash on delivery', 'Pay when your parcel arrives'], ['bkash', 'bKash', 'Digital payment preference']].map(([value, label, description]) => <label key={value} className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 ${form.paymentMethod === value ? 'border-brand bg-brand-soft' : 'border-field-border bg-elevated'}`}><input type="radio" name="paymentMethod" value={value} checked={form.paymentMethod === value} onChange={updateField} className="mt-1 h-4 w-4 accent-[var(--color-brand)]" /><span><span className="block text-sm font-medium text-ink">{label}</span><span className="mt-1 block text-xs leading-relaxed text-muted">{description}</span></span></label>)}</fieldset><p className="text-xs text-muted">This preview does not collect or process a payment.</p></Card>
        </div>
        <aside className="space-y-4 lg:sticky lg:top-24"><Card className="space-y-5 p-5 sm:p-6"><div className="flex items-center justify-between"><h2 className="text-lg font-semibold text-ink">One order</h2><span className="text-xs text-muted">{itemCount} {itemCount === 1 ? 'item' : 'items'}</span></div><div className="space-y-4">{items.map((item) => <div key={item.id} className="flex gap-3"><img src={item.image} alt={item.name} className="h-16 w-16 shrink-0 rounded-xl bg-elevated object-cover" /><div className="min-w-0"><h3 className="text-sm font-medium leading-snug text-ink">{item.name}</h3><p className="mt-1 text-xs text-muted">Qty {item.quantity} · {formatCurrency(item.price)} each</p><p className="mt-1 text-sm font-semibold text-soft">{formatCurrency(item.price * item.quantity)}</p></div></div>)}</div><div className="space-y-3 border-t border-line pt-4"><div className="flex justify-between gap-3 text-sm text-muted"><span>Items subtotal</span><span className="font-medium text-ink">{formatCurrency(subtotal)}</span></div><div className="flex justify-between gap-3 text-sm text-muted"><span>Delivery</span><span className="text-right text-soft">To be confirmed</span></div><div className="flex items-center justify-between gap-3 border-t border-line pt-4 text-base font-semibold text-ink"><span>Items total</span><span className="text-xl">{formatCurrency(subtotal)}</span></div></div><Button type="submit" className="w-full" size="lg" isLoading={isSubmitting}>Save demo order <ArrowRight size={17} /></Button><p className="text-center text-xs leading-relaxed text-muted">Creates a local order preview. No charge or real order submission.</p></Card><Link to="/cart" className="flex min-h-11 items-center justify-center text-sm text-muted hover:text-ink">Edit items in cart</Link></aside>
      </form>
    </div>
  )
}
