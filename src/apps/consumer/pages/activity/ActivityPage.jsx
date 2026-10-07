import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowUpRight, Check, Package, ShoppingBag, Users } from 'lucide-react'
import { Card } from '@/shared/ui/Card'
import { Badge } from '@/shared/ui/Badge'
import { Button } from '@/shared/ui/Button'
import { DropProgress } from '@/features/drops/components/DropProgress'
import { calculateDropTier } from '@/features/drops/model/dropStatuses'
import { useDropInterests } from '@/features/drops/model/useDropInterest'
import { useCart } from '@/features/cart/model/cartContext'
import { formatCurrency } from '@/shared/lib/formatCurrency'
import { MOCK_DROPS, MOCK_PRODUCTS, toCartItem } from '../mockCatalog'

export default function ActivityPage() {
  const navigate = useNavigate()
  const { addItem } = useCart()
  const [tab, setTab] = useState('drops')
  const drops = useDropInterests(MOCK_DROPS).filter((drop) => drop.isJoined)
  const delivered = MOCK_PRODUCTS[1]

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-ink">Your activity</h1>
          <p className="mt-2 text-[15px] text-muted">Keep up with your Drops and orders.</p>
        </div>
        <Badge variant="default">Preview activity</Badge>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Card className="p-4">
          <Users size={19} className="mb-3 text-brand" />
          <p className="text-2xl font-semibold text-ink">{drops.length}</p>
          <p className="mt-1 text-sm text-muted">Drops joined</p>
        </Card>
        <Card className="p-4">
          <Package size={19} className="mb-3 text-success" />
          <p className="text-2xl font-semibold text-ink">1</p>
          <p className="mt-1 text-sm text-muted">Sample order</p>
        </Card>
      </div>
      <div className="flex gap-2 border-b border-line pb-3">
        {[['drops', 'Your Drops'], ['orders', 'Orders']].map(([value, label]) => (
          <button
            key={value}
            onClick={() => setTab(value)}
            aria-pressed={tab === value}
            className={`min-h-11 rounded-xl px-4 text-sm font-medium ${tab === value ? 'bg-ink text-canvas' : 'bg-surface text-soft hover:bg-elevated'}`}
          >{label}</button>
        ))}
      </div>
      {tab === 'drops' ? (
        <div className="space-y-4">
          {drops.length ? drops.map((drop) => {
            const price = calculateDropTier(drop.tiers, drop.currentParticipants).currentTier.price
            return (
              <Card key={drop.id} className="space-y-4 p-4 sm:p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <Badge variant="brand">Drop in progress</Badge>
                  <span className="text-xs text-muted">{drop.currentParticipants} people in</span>
                </div>
                <Link to={`/drops/${drop.id}`} className="flex items-center gap-4">
                  <img src={drop.image} alt={drop.title} className="h-20 w-20 shrink-0 rounded-xl bg-elevated object-cover" />
                  <div className="min-w-0">
                    <h2 className="text-base font-semibold leading-snug text-ink">{drop.title}</h2>
                    <p className="mt-1 text-xs text-muted">{drop.category}</p>
                  </div>
                </Link>
                <div className="border-t border-line pt-4">
                  <DropProgress tiers={drop.tiers} currentParticipants={drop.currentParticipants} retailPrice={drop.retailPrice} />
                </div>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <Link to={`/drops/${drop.id}`} className="flex min-h-11 items-center gap-1.5 text-sm text-soft hover:text-brand">
                    View progress <ArrowUpRight size={16} />
                  </Link>
                  <Button variant="outline" onClick={() => { addItem(toCartItem(drop, price)); navigate('/cart') }}>
                    <ShoppingBag size={16} /> Add to cart
                  </Button>
                </div>
              </Card>
            )
          }) : (
            <Card className="space-y-3 p-8 text-center">
              <Users size={28} className="mx-auto text-brand" />
              <h2 className="text-lg font-semibold text-ink">Your next Drop is waiting</h2>
              <p className="text-sm text-muted">Join a Drop to follow its group price here.</p>
              <Button onClick={() => navigate('/explore?tab=drops')}>Explore Drops</Button>
            </Card>
          )}
          <p className="px-1 text-xs leading-relaxed text-muted">Joining a Drop shows interest. Review the current price in your cart before ordering.</p>
        </div>
      ) : (
        <Card className="space-y-5 p-5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs text-muted">Sample order · JB-1024</span>
            <Badge variant="unlocked"><Check size={13} /> Delivered</Badge>
          </div>
          <div className="flex items-center gap-4">
            <img src={delivered.image} alt={delivered.title} className="h-20 w-20 rounded-xl object-cover" />
            <div>
              <h2 className="text-base font-semibold text-ink">{delivered.title}</h2>
              <p className="mt-1 text-sm text-muted">1 item · {formatCurrency(delivered.retailPrice)}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl bg-elevated p-4 text-sm text-soft">
            <Package size={20} className="shrink-0 text-success" />
            <span>Delivered to Jashore City.<br /><span className="text-xs text-muted">Illustrative delivery status for the UI preview.</span></span>
          </div>
          <Button variant="outline" className="w-full" onClick={() => navigate(`/products/${delivered.id}`)}>
            View product <ArrowUpRight size={16} />
          </Button>
        </Card>
      )}
    </div>
  )
}
