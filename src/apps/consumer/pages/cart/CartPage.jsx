import { Link, useNavigate } from 'react-router-dom'
import { ShoppingBag, ArrowRight, Minus, Plus, Trash2 } from 'lucide-react'
import { useCart } from '@/features/cart/model/cartContext'
import { Card } from '@/shared/ui/Card'
import { Button } from '@/shared/ui/Button'
import { EmptyState } from '@/shared/patterns/EmptyState'
import { formatCurrency } from '@/shared/lib/formatCurrency'

export default function CartPage() {
  const { items, itemCount, subtotal, updateQuantity, removeItem } = useCart()
  const navigate = useNavigate()

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div><p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-brand">Ready when you are</p><h1 className="text-3xl font-bold tracking-tight text-ink">Your cart <span className="text-muted text-lg">({itemCount})</span></h1><p className="mt-2 text-sm text-muted">Your picks, together in one order.</p></div>
      {!items.length ? <EmptyState icon={ShoppingBag} title="Your next find is waiting" description="Add a product from a Drop or the catalog to start your cart." actionLabel="Explore products" onAction={() => navigate('/explore')} /> : (
        <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
          <div className="space-y-3">
            {items.map((item) => <Card key={item.id} className="p-4">
              <div className="flex gap-4"><img src={item.image} alt={item.name} className="size-20 sm:size-24 shrink-0 rounded-xl bg-elevated object-cover" /><div className="min-w-0 flex-1"><p className="text-xs text-muted">{item.category}</p><h2 className="mt-1 text-sm sm:text-base font-semibold text-ink">{item.name}</h2><p className="mt-2 text-lg font-bold text-ink">{formatCurrency(item.price)}</p></div></div>
              <div className="mt-4 flex items-center justify-between border-t border-line pt-3"><div className="flex items-center rounded-xl border border-field-border"><Button variant="ghost" size="icon" aria-label={`Decrease quantity of ${item.name}`} disabled={item.quantity <= 1} onClick={() => updateQuantity(item.id, item.quantity - 1)}><Minus size={16} /></Button><span className="min-w-8 text-center text-sm tabular-nums text-ink" aria-live="polite">{item.quantity}</span><Button variant="ghost" size="icon" aria-label={`Increase quantity of ${item.name}`} disabled={item.quantity >= 99} onClick={() => updateQuantity(item.id, item.quantity + 1)}><Plus size={16} /></Button></div><Button variant="ghost" size="icon" aria-label={`Remove ${item.name} from cart`} onClick={() => removeItem(item.id)}><Trash2 size={18} /></Button></div>
            </Card>)}
          </div>
          <Card className="h-fit p-5 lg:sticky lg:top-24"><h2 className="text-lg font-semibold text-ink">Order summary</h2><div className="my-5 flex justify-between gap-3 text-sm"><span className="text-muted">Subtotal · {itemCount} items</span><span className="font-semibold text-ink">{formatCurrency(subtotal)}</span></div><p className="mb-5 text-xs leading-relaxed text-muted">Delivery charges and final availability will be confirmed when checkout is connected.</p><Button className="w-full" onClick={() => navigate('/checkout')}>Continue to checkout <ArrowRight size={17} /></Button><Link to="/explore" className="mt-3 flex min-h-11 items-center justify-center text-sm text-muted hover:text-ink">Keep exploring</Link></Card>
        </div>
      )}
    </div>
  )
}
