import { useState, useEffect, useCallback, useRef } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Clock, Share2, ShoppingBag, AlertCircle, Loader2, RefreshCw } from 'lucide-react'
import { PageHeader } from '@/shared/patterns/PageHeader'
import { Card } from '@/shared/ui/Card'
import { Badge } from '@/shared/ui/Badge'
import { Button } from '@/shared/ui/Button'
import { Avatar } from '@/shared/ui/Avatar'
import { DropProgress } from '@/features/drops/components/DropProgress'
import { ImInButton } from '@/features/drops/components/ImInButton'
import { useDropInterest } from '@/features/drops/model/useDropInterest'
import { dropFacts, formatDropDeadline } from '@/features/drops/model/dropLifecycle'
import { useCart } from '@/features/cart/model/cartContext'
import { useAuth } from '@/features/auth/model/authContext'
import { formatCurrency } from '@/shared/lib/formatCurrency'
import { resolveImageUrl } from '@/shared/lib/mediaUrl'
import { communityApi } from '@/features/community/api/communityApi'

function DropView({ initialDrop, onRefresh }) {
  const navigate = useNavigate()
  const { addItem } = useCart()
  const { drop, facts, busy, error, toggleInterest } = useDropInterest(initialDrop)
  const [shareMessage, setShareMessage] = useState('')
  const [cartError, setCartError] = useState('')
  const adding = useRef(false)
  const product = drop.product
  const deadline = formatDropDeadline(drop.end_at)
  const start = formatDropDeadline(drop.start_at)
  const groupPrice = Number(drop.group_price ?? drop.groupPrice)
  const requiresVariant = Boolean(drop.requires_variant_selection || (!drop.variant && product?.has_active_variants))
  const canAdd = facts.canOrder && Boolean(product?.id) && Number.isFinite(groupPrice) && groupPrice > 0
  const specifications = drop.specifications || product?.specifications || []
  const productPath = product?.id ? `/products/${encodeURIComponent(product.slug || product.id)}` : '/explore'
  const share = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setShareMessage('Drop link copied.')
    } catch { setShareMessage('Copy the page address to share this Drop.') }
  }
  const addDropToCart = () => {
    if (adding.current || !canAdd) return
    if (!dropFacts(drop).canOrder) {
      setCartError('This Drop is no longer accepting orders. Refresh to see its latest status.')
      return
    }
    if (requiresVariant) {
      navigate(productPath)
      return
    }
    adding.current = true
    setCartError('')
    addItem({ ...product, image: drop.image || product.image }, 1, {
      variant: drop.variant ? { ...drop.variant, name: drop.variant.name || drop.variant.title } : null,
      purchase_mode: 'group_buy', campaign: drop,
    })
    navigate('/cart')
  }
  return (
    <div className="mx-auto w-full min-w-0 max-w-5xl space-y-5 [overflow-wrap:anywhere]">
      <PageHeader title="Price Drop" subtitle="A lower price when the buyer target is reached." showBack actions={<div className="flex gap-2"><button type="button" onClick={onRefresh} disabled={busy} className="flex size-11 items-center justify-center rounded-xl border border-line bg-surface text-soft hover:text-brand disabled:opacity-50" aria-label="Refresh Drop availability"><RefreshCw size={18} /></button><button type="button" onClick={share} className="flex size-11 items-center justify-center rounded-xl border border-line bg-surface text-soft hover:text-brand" aria-label="Copy Drop link"><Share2 size={18} /></button></div>} />
      {shareMessage && <p role="status" className="text-sm text-brand">{shareMessage}</p>}
      {(error || cartError) && <p role="alert" className="rounded-xl border border-danger/30 bg-danger-soft p-3 text-xs text-danger">{error || cartError}</p>}
      <div className="grid min-w-0 items-start gap-5 lg:grid-cols-2 lg:gap-8">
        <div className="min-w-0 space-y-4">
          <div className="flex h-[min(28vh,14rem)] items-center justify-center overflow-hidden rounded-3xl border border-line bg-elevated sm:aspect-square sm:h-auto">
            {drop.image ? <img src={resolveImageUrl(drop.image)} alt={product?.title || drop.title} className="size-full object-contain" /> : <p className="text-sm text-muted">No product photo</p>}
          </div>
          {drop.curator?.username && <Card className="flex min-w-0 items-center gap-3 p-4"><Avatar name={drop.curator.name || 'Organizer'} src={drop.curator.avatar_url} size="md" /><div className="min-w-0"><p className="text-xs text-muted">Organized by</p><Link to={`/profile/${encodeURIComponent(drop.curator.username)}`} className="inline-flex min-h-11 items-center text-sm font-semibold text-ink hover:text-brand">{drop.curator.name || drop.curator.username}</Link></div></Card>}
        </div>
        <Card className="min-w-0 space-y-5 p-4 sm:p-6">
          <div className="space-y-3"><Badge variant={drop.status === 'succeeded' ? 'unlocked' : 'brand'}>{facts.statusLabel}</Badge><h1 className="text-2xl font-semibold leading-tight text-ink sm:text-3xl">{drop.title}</h1>{drop.variant && <p className="text-xs text-muted">Option: {drop.variant.name || drop.variant.title || drop.variant.sku}</p>}</div>
          <DropProgress currentParticipants={facts.qualifying} targetParticipants={facts.target} groupPrice={groupPrice} retailPrice={drop.retail_price ?? drop.retailPrice} status={drop.status} />
          <div className="space-y-2 border-y border-line py-4 text-xs leading-relaxed text-muted">
            {deadline && <p className="flex items-start gap-2"><Clock size={15} className="mt-0.5 shrink-0 text-brand" /><span>Deadline: <strong className="font-medium text-soft">{deadline} (Bangladesh time)</strong></span></p>}
            {facts.notStarted && start && <p>Opens: {start} (Bangladesh time)</p>}
            <p>Each customer with an accepted conditional order counts once, including unpaid cash-on-delivery orders. Interest alone does not count.</p>
            <p>Reaching the target confirms accepted orders and closes this Drop to new orders. Accepted prices stay fixed. Before success, expiry or cancellation cancels reservations and releases stock; any payment requires a separate manual refund review.</p>
            {drop.quantity_limit_per_customer && <p>Up to {drop.quantity_limit_per_customer} {Number(drop.quantity_limit_per_customer) === 1 ? 'item' : 'items'} per customer. Each Drop is checked out separately from regular products and other Drops.</p>}
          </div>
          <div className="space-y-3">
            {facts.reserved && <p role="status" className="rounded-xl border border-brand/30 bg-brand-soft p-3 text-xs text-soft">You have a conditional order reservation. It is awaiting the Drop target.</p>}
            {facts.confirmed && <p role="status" className="rounded-xl border border-success/30 bg-success-soft p-3 text-xs text-success">Your participation is confirmed. View your order for delivery and payment status.</p>}
            {(facts.reserved || facts.confirmed) && <Link to="/activity?tab=orders" className="inline-flex min-h-11 items-center text-sm font-semibold text-brand">View my orders</Link>}
            <Button className="w-full min-w-0" disabled={!canAdd} onClick={addDropToCart}><ShoppingBag size={18} className="shrink-0" /><span>{requiresVariant ? 'Choose an option for this Drop' : `Add conditional order · ${Number.isFinite(groupPrice) ? formatCurrency(groupPrice) : 'Price unavailable'}`}</span></Button>
            {!facts.canOrder && <p className="text-xs leading-relaxed text-muted">{facts.unavailableReason}</p>}
            <p className="text-xs leading-relaxed text-muted">Adding to cart does not place an order. Review the conditional price and delivery total at checkout.</p>
            <div className="space-y-2 border-t border-line pt-4"><ImInButton isJoined={facts.interested} onToggleJoin={toggleInterest} isLoading={busy} disabled={!facts.canExpressInterest} /><p className="text-center text-xs text-muted">{facts.interestCount} {facts.interestCount === 1 ? 'person is' : 'people are'} interested. Expressing interest creates no order or reservation.</p></div>
          </div>
        </Card>
      </div>
      {specifications.length > 0 && <Card className="min-w-0 space-y-3 p-4 sm:p-6"><h2 className="text-sm font-semibold text-ink">Product specifications</h2><dl className="grid min-w-0 gap-3 sm:grid-cols-2">{specifications.map((spec, index) => <div key={spec.id || `${spec.attribute_name}-${index}`} className="min-w-0 rounded-xl bg-elevated p-3 text-xs"><dt className="text-muted">{spec.attribute_name}</dt><dd className="mt-1 font-medium text-ink">{spec.value}</dd></div>)}</dl></Card>}
      <Card className="min-w-0 space-y-3 p-4 sm:p-6"><h2 className="text-sm font-semibold text-ink">About this product</h2>{(drop.description || product?.description) && <p className="whitespace-pre-line text-sm leading-relaxed text-soft">{drop.description || product.description}</p>}<Link to={productPath} className="inline-flex min-h-11 items-center text-sm font-semibold text-brand">View product details and policies</Link></Card>
    </div>
  )
}

export default function DropDetailsPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const [drop, setDrop] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [retry, setRetry] = useState(0)
  const request = useRef(0)
  const fetchDrop = useCallback(async () => {
    const current = ++request.current
    setLoading(true)
    setError('')
    setDrop(null)
    try {
      const data = await communityApi.drops.getDrop(id)
      if (request.current === current) {
        const matchesRoute = /^\d+$/.test(id) ? Number(data?.id) === Number(id) : data?.campaign_code === id
        if (!data || !matchesRoute) throw new Error('This Drop could not be read. Please retry.')
        setDrop(data)
      }
    } catch (failure) {
      if (request.current === current) setError(failure.message || 'This Drop is unavailable.')
    } finally {
      if (request.current === current) setLoading(false)
    }
  }, [id, user?.id])
  useEffect(() => {
    fetchDrop()
    return () => { request.current += 1 }
  }, [fetchDrop, retry])
  useEffect(() => {
    const refreshOnFocus = () => { fetchDrop() }
    window.addEventListener('focus', refreshOnFocus)
    return () => window.removeEventListener('focus', refreshOnFocus)
  }, [fetchDrop])
  if (loading) return <div role="status" className="mx-auto space-y-3 px-4 py-16 text-center text-sm text-muted"><Loader2 className="mx-auto size-8 animate-spin text-brand" />Loading Price Drop…</div>
  if (error || !drop) return <Card className="mx-auto max-w-lg space-y-4 p-6 text-center"><AlertCircle size={28} className="mx-auto text-warning" /><h1 className="text-xl font-semibold text-ink">This Drop is unavailable</h1><p role="alert" className="text-sm text-muted">{error || 'We could not load this Drop.'}</p><Button variant="outline" onClick={() => setRetry((value) => value + 1)}>Retry Drop</Button><Link to="/explore?tab=drops" className="flex min-h-11 items-center justify-center text-sm text-brand">Explore other Drops</Link></Card>
  return <DropView key={`${drop.id}-${user?.id || 'guest'}`} initialDrop={drop} onRefresh={() => setRetry((value) => value + 1)} />
}
