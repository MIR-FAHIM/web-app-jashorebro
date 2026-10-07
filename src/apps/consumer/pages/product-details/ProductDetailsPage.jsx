import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Bookmark, Check, PlusCircle, ShoppingBag, Store, Users } from 'lucide-react'
import { PageHeader } from '@/shared/patterns/PageHeader'
import { Card } from '@/shared/ui/Card'
import { Badge } from '@/shared/ui/Badge'
import { Button } from '@/shared/ui/Button'
import { useCart } from '@/features/cart/model/cartContext'
import { formatCurrency } from '@/shared/lib/formatCurrency'
import { getProduct, toCartItem } from '../mockCatalog'

function ProductView({ product }) {
  const navigate = useNavigate()
  const { addItem } = useCart()
  const [isPicked, setIsPicked] = useState(false)
  const [isRequested, setIsRequested] = useState(false)

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader title="Product details" subtitle="A new possibility for your rotation." showBack />
      <div className="grid gap-6 lg:grid-cols-2 lg:gap-8">
        <div className="relative aspect-square overflow-hidden rounded-3xl border border-line bg-elevated"><img src={product.image} alt={product.title} className="h-full w-full object-cover" /><span className="absolute left-4 top-4"><Badge>{product.category}</Badge></span></div>
        <div className="space-y-5">
          <Card className="space-y-6 p-5 sm:p-6">
            <div><Badge variant="default">From the catalog</Badge><h1 className="mt-3 text-2xl font-semibold leading-tight tracking-tight text-ink sm:text-3xl">{product.title}</h1><p className="mt-3 flex items-center gap-2 text-sm text-muted"><Store size={16} /> {product.seller.name}</p><div className="mt-5 border-t border-line pt-5"><p className="text-xs text-muted">Regular price</p><p className="mt-1 text-3xl font-semibold tracking-tight text-ink">{formatCurrency(product.retailPrice)}</p></div></div>
            <Button className="w-full" onClick={() => { addItem(toCartItem(product)); navigate('/cart') }}><ShoppingBag size={18} /> Add to cart</Button>
            <Button variant={isPicked ? 'secondary' : 'outline'} className="w-full" onClick={() => setIsPicked(!isPicked)} aria-pressed={isPicked}>{isPicked ? <Check size={17} /> : <Bookmark size={17} />}{isPicked ? 'Saved to My Picks in this preview' : 'Save to My Picks'}</Button>
            <div className="rounded-2xl border border-brand/20 bg-brand-soft p-4"><div className="flex items-center gap-2 text-brand"><Users size={18} /><h2 className="text-base font-semibold">Better together?</h2></div><p className="mt-2 text-sm leading-relaxed text-soft">Show interest in a community Drop. Group pricing will depend on the seller’s offer.</p><Button variant="outline" className="mt-4 w-full border-brand/30 text-brand" onClick={() => setIsRequested(!isRequested)} aria-pressed={isRequested}>{isRequested ? <Check size={17} /> : <PlusCircle size={17} />}{isRequested ? 'Interest noted in this preview' : 'I want a Drop for this'}</Button></div>
          </Card>
          <Card className="p-5"><h2 className="text-base font-semibold text-ink">The details</h2><p className="mt-2 text-[15px] leading-relaxed text-muted">{product.description}</p><p className="mt-4 border-t border-line pt-4 text-xs leading-relaxed text-muted">Preview product. Images are illustrative; final options and availability will come from the seller.</p></Card>
        </div>
      </div>
    </div>
  )
}

export default function ProductDetailsPage() {
  const { id } = useParams()
  const product = getProduct(id)
  if (!product) return <Card className="mx-auto max-w-lg p-8 text-center"><h1 className="text-xl font-semibold text-ink">This product is unavailable</h1><p className="my-3 text-sm text-muted">Browse the catalog for another good find.</p><Link to="/explore" className="inline-flex min-h-11 items-center text-brand">Back to Explore</Link></Card>
  return <ProductView key={product.id} product={product} />
}
