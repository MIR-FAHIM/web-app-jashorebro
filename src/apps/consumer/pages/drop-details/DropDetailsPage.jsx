import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Check, CheckCircle2, Clock, Share2, ShoppingBag, Users } from 'lucide-react'
import { PageHeader } from '@/shared/patterns/PageHeader'
import { Card } from '@/shared/ui/Card'
import { Badge } from '@/shared/ui/Badge'
import { Button } from '@/shared/ui/Button'
import { Avatar } from '@/shared/ui/Avatar'
import { DropProgress } from '@/features/drops/components/DropProgress'
import { ImInButton } from '@/features/drops/components/ImInButton'
import { calculateDropTier } from '@/features/drops/model/dropStatuses'
import { useDropInterest } from '@/features/drops/model/useDropInterest'
import { useCart } from '@/features/cart/model/cartContext'
import { formatCurrency } from '@/shared/lib/formatCurrency'
import { getDrop, toCartItem } from '../mockCatalog'

function DropView({ drop }) {
  const navigate = useNavigate()
  const { addItem } = useCart()
  const { isJoined, currentParticipants: participants, toggleJoin } = useDropInterest(drop)
  const [shareMessage, setShareMessage] = useState('')
  const { currentTier } = calculateDropTier(drop.tiers, participants)
  const currentPrice = currentTier?.price ?? drop.retailPrice
  const share = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setShareMessage('Drop link copied')
    } catch {
      setShareMessage('Copy the page address to share this Drop.')
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader title="Drop details" subtitle="A good find, picked by your community." showBack actions={<button onClick={share} className="flex h-11 w-11 items-center justify-center rounded-xl border border-line bg-surface text-soft hover:text-brand" aria-label="Copy Drop link"><Share2 size={18} /></button>} />
      {shareMessage && <p role="status" className="text-sm text-brand">{shareMessage}</p>}
      <div className="grid gap-6 lg:grid-cols-2 lg:gap-8">
        <div className="space-y-4">
          <div className="relative aspect-square overflow-hidden rounded-3xl border border-line bg-elevated"><img src={drop.image} alt={drop.title} className="h-full w-full object-cover" /><span className="absolute left-4 top-4"><Badge variant="brand">{drop.category}</Badge></span></div>
          <Card className="flex items-start gap-3 p-4"><Avatar name={drop.curator.name} size="md" /><div><Link to={`/profile?person=${drop.curator.handle}`} className="text-sm font-semibold text-ink hover:text-brand">Picked by {drop.curator.name}</Link><p className="mt-1 text-sm leading-relaxed text-muted">{drop.recommendation}</p></div></Card>
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted"><Clock size={16} className="text-brand" /><span>Sample closing time: <span className="text-soft">{drop.endsIn}</span></span></div>
        </div>
        <div className="space-y-5">
          <Card className="space-y-6 p-5 sm:p-6">
            <div><div className="mb-3 flex flex-wrap items-center justify-between gap-2"><Badge variant="brand">Active Drop</Badge><span className="flex items-center gap-1.5 text-xs text-muted"><Users size={14} /> {participants} people in</span></div><h1 className="text-2xl font-semibold leading-tight tracking-tight text-ink sm:text-3xl">{drop.title}</h1></div>
            <DropProgress tiers={drop.tiers} currentParticipants={participants} retailPrice={drop.retailPrice} />
            <div className="rounded-2xl border border-line bg-elevated p-4"><h2 className="mb-3 text-sm font-semibold text-ink">The group price ladder</h2><div className="space-y-2">{drop.tiers.map((tier) => { const unlocked = participants >= tier.requiredParticipants; const current = currentTier?.requiredParticipants === tier.requiredParticipants; return <div key={tier.requiredParticipants} className={`flex items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-sm ${current ? 'bg-success-soft text-success' : unlocked ? 'text-soft' : 'text-muted'}`}><span className="flex items-center gap-2">{unlocked ? <CheckCircle2 size={16} /> : <span className="h-4 w-4 rounded-full border border-field-border" />}{tier.requiredParticipants}+ people {current && <span className="text-xs">(current)</span>}</span><span className="font-semibold tabular-nums">{formatCurrency(tier.price)}</span></div> })}</div></div>
            <div className="space-y-3"><ImInButton isJoined={isJoined} onToggleJoin={toggleJoin} size="lg" /><p className="text-center text-xs leading-relaxed text-muted">Joining shows your interest. An order is placed separately at checkout.</p><Button variant="outline" className="w-full" onClick={() => { addItem(toCartItem(drop, currentPrice)); navigate('/cart') }}><ShoppingBag size={17} /> Add to cart · {formatCurrency(currentPrice)}</Button></div>
          </Card>
          <Card className="p-5"><h2 className="text-base font-semibold text-ink">About this find</h2><p className="mt-2 text-[15px] leading-relaxed text-muted">{drop.description}</p><div className="mt-4 flex items-start gap-2 border-t border-line pt-4 text-xs leading-relaxed text-muted"><Check size={16} className="shrink-0 text-brand" /> Prices and participation are demo data. Final availability and delivery details will come from the seller.</div></Card>
        </div>
      </div>
    </div>
  )
}

export default function DropDetailsPage() {
  const { id } = useParams()
  const drop = getDrop(id)
  if (!drop) return <Card className="mx-auto max-w-lg p-8 text-center"><h1 className="text-xl font-semibold text-ink">This Drop is unavailable</h1><p className="my-3 text-sm text-muted">Explore the preview collection for another good find.</p><Link to="/explore" className="inline-flex min-h-11 items-center text-brand">Back to Explore</Link></Card>
  return <DropView key={drop.id} drop={drop} />
}
