import { Link, useNavigate } from 'react-router-dom'
import { ShoppingBag, Package, ArrowRight, Minus, Plus, Trash2 } from 'lucide-react'
import { getCartCheckoutIssue, useCart } from '@/features/cart/model/cartContext'
import { Card } from '@/shared/ui/Card'
import { Button } from '@/shared/ui/Button'
import { EmptyState } from '@/shared/patterns/EmptyState'
import { formatCurrency } from '@/shared/lib/formatCurrency'

export default function CartPage() {
  const { items, itemCount, subtotal, updateQuantity, removeItem } = useCart()
  const navigate = useNavigate()
  const checkoutIssue = getCartCheckoutIssue(items)

  return (
    <div className="mx-auto min-w-0 max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">Your cart <span className="text-lg text-muted">({itemCount})</span></h1>
        <p className="mt-2 text-sm text-muted">Review your products and quantities before checkout.</p>
      </div>
      {!items.length ? <EmptyState icon={ShoppingBag} title="Your next find is waiting" description="Add a product from a Drop or the catalog to start your cart." actionLabel="Explore products" onAction={() => navigate('/explore')} /> : (
        <div className="grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
          <div className="min-w-0 space-y-3">
            {items.map((item) => {
              const lineId = item.lineId || item.id
              const title = item.title || item.name || 'Product'
              const quantityLimit = Math.min(99, Number(item.max_quantity) || 99)

              return (
                <Card key={lineId} className="min-w-0 p-4">
                  <div className="flex min-w-0 gap-3 sm:gap-4">
                    {item.image ? (
                      <img src={item.image} alt={title} className="size-16 shrink-0 rounded-xl bg-elevated object-cover sm:size-24" />
                    ) : (
                      <div className="flex size-16 shrink-0 items-center justify-center rounded-xl bg-elevated text-muted sm:size-24"><Package size={24} aria-hidden="true" /></div>
                    )}
                    <div className="min-w-0 flex-1">
                      {item.category && <p className="break-words text-xs text-muted">{item.category}</p>}
                      <h2 className="break-words text-sm font-semibold text-ink sm:text-base">{title}</h2>
                      <p className="mt-2 text-sm text-soft">{formatCurrency(item.price)} <span className="text-xs text-muted">each</span></p>
                      {item.attribution_token && <p className="mt-1 text-xs leading-relaxed text-success">From {item.recommender_name || 'a community member'}’s Pick. This source stays with this cart item; eligibility is checked at checkout.</p>}
                      {!item.attribution_token && (item.recommendation_code || item.recommender_id) && <p className="mt-1 text-xs leading-relaxed text-muted">Open the original Pick to verify its recommendation before buying.</p>}
                      {item.purchase_mode === 'group_buy' && <div className="mt-2 space-y-1 text-xs leading-relaxed"><Link to={`/drops/${encodeURIComponent(item.campaign_id)}`} className="inline-flex min-h-11 items-center font-semibold text-brand underline underline-offset-2">{item.campaign_title || 'View Price Drop'}</Link><p className="text-muted">Conditional Drop price. Adding to the cart does not reserve stock or count toward the buyer target. Eligibility is checked at checkout.</p></div>}
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-3">
                    <div className="flex items-center rounded-xl border border-field-border">
                      <Button variant="ghost" size="icon" aria-label={`Decrease quantity of ${title}`} disabled={item.quantity <= 1} onClick={() => updateQuantity(lineId, item.quantity - 1)}><Minus size={16} /></Button>
                      <span className="min-w-8 text-center text-sm tabular-nums text-ink" aria-live="polite">{item.quantity}</span>
                      <Button variant="ghost" size="icon" aria-label={`Increase quantity of ${title}`} disabled={item.quantity >= quantityLimit} onClick={() => updateQuantity(lineId, item.quantity + 1)}><Plus size={16} /></Button>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold tabular-nums text-ink" aria-label={`Item subtotal ${formatCurrency(item.price * item.quantity)}`}>{formatCurrency(item.price * item.quantity)}</p>
                      <Button variant="ghost" size="icon" aria-label={`Remove ${title} from cart`} onClick={() => removeItem(lineId)}><Trash2 size={18} /></Button>
                    </div>
                  </div>
                  {item.quantity >= quantityLimit && <p role="status" className="mt-2 text-xs text-muted">Maximum quantity for this item: {quantityLimit}.</p>}
                </Card>
              )
            })}
          </div>
          <Card className="h-fit min-w-0 p-5 lg:sticky lg:top-24">
            <h2 className="text-lg font-semibold text-ink">Order summary</h2>
            <div className="my-4 flex flex-wrap justify-between gap-2 text-sm"><span className="text-muted">Estimated subtotal</span><span className="font-semibold tabular-nums text-ink">{formatCurrency(subtotal)}</span></div>
            <p className="mb-2 text-xs text-muted">{itemCount} {itemCount === 1 ? 'item' : 'items'} · delivery not included</p>
            <p className="mb-5 text-xs leading-relaxed text-muted">Prices, delivery charges and availability are checked at checkout before you place an order.</p>
            {checkoutIssue && <p role="alert" className="mb-4 rounded-xl border border-warning/30 bg-warning-soft p-3 text-xs leading-relaxed text-warning">{checkoutIssue}</p>}
            <Button className="w-full" disabled={Boolean(checkoutIssue)} onClick={() => navigate('/checkout')}>Continue to checkout <ArrowRight size={17} className="shrink-0" /></Button>
            <Link to="/explore" className="mt-3 flex min-h-11 items-center justify-center text-sm text-muted hover:text-ink">Keep shopping</Link>
          </Card>
        </div>
      )}
    </div>
  )
}
