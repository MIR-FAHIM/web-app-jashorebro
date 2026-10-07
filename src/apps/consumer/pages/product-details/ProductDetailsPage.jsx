import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { PlusCircle, Heart, BookmarkPlus, Share2 } from 'lucide-react'
import { PageHeader } from '@/shared/patterns/PageHeader'
import { Card } from '@/shared/ui/Card'
import { Badge } from '@/shared/ui/Badge'
import { Button } from '@/shared/ui/Button'
import { formatCurrency } from '@/shared/lib/formatCurrency'

export default function ProductDetailsPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [isPicked, setIsPicked] = useState(false)

  const product = {
    id: id || 'prod_1',
    title: 'Redragon K552 Kumara RGB Mechanical Keyboard',
    category: 'Tech & Gadgets',
    retailPrice: 3200,
    potentialDropPrice: 2699,
    image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80',
    description:
      'Compact 87-key space-saving design with custom dustproof mechanical switches (Cherry Blue equivalent). Crisp tactile feedback and customizable RGB backlighting.',
    seller: {
      name: 'GadgetZone Jashore',
      rating: '4.8',
    },
  }

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <PageHeader
        title={product.title}
        subtitle={`${product.category} • Sold by ${product.seller.name}`}
        showBack
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="aspect-square rounded-2xl overflow-hidden bg-slate-100 border border-slate-200/80">
          <img
            src={product.image}
            alt={product.title}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="space-y-4">
          <Card className="p-5 space-y-5">
            <div>
              <Badge variant="default" size="sm">
                Catalog Item
              </Badge>
              <h2 className="text-xl font-extrabold text-slate-900 mt-2">
                {product.title}
              </h2>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl font-black text-slate-900">
                  {formatCurrency(product.retailPrice)}
                </span>
                <span className="text-xs text-slate-400">Regular retail price</span>
              </div>
            </div>

            {/* Start a Drop Callout */}
            <div className="p-4 rounded-xl bg-orange-50 border border-orange-200/60 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-orange-700">
                <span>Want this cheaper?</span>
                <Badge variant="fire" size="sm">Save up to {formatCurrency(product.retailPrice - product.potentialDropPrice)}</Badge>
              </div>
              <p className="text-xs text-orange-950/80 leading-relaxed">
                Start a community Drop for this product. If 15 people join, price unlocks at {formatCurrency(product.potentialDropPrice)}!
              </p>
              <Button
                variant="drop-fire"
                size="md"
                className="w-full mt-2"
                onClick={() => {
                  alert('Created user drop! Ready to invite friends.')
                  navigate('/explore')
                }}
              >
                <PlusCircle size={16} />
                <span>Start a Drop for {formatCurrency(product.potentialDropPrice)}</span>
              </Button>
            </div>

            {/* Shelf recommendation & Buy Solo */}
            <div className="grid grid-cols-2 gap-2 pt-2">
              <Button
                variant={isPicked ? 'secondary' : 'outline'}
                size="md"
                className="text-xs"
                onClick={() => setIsPicked(!isPicked)}
              >
                <BookmarkPlus size={15} />
                <span>{isPicked ? 'On My Picks ✓' : 'Add to My Picks'}</span>
              </Button>
              <Button
                variant="secondary"
                size="md"
                className="text-xs"
                onClick={() => navigate('/checkout')}
              >
                Buy Solo ({formatCurrency(product.retailPrice)})
              </Button>
            </div>
          </Card>

          <div className="p-4 bg-white rounded-2xl border border-slate-200/80">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Specifications
            </h4>
            <p className="text-sm text-slate-600 leading-relaxed">
              {product.description}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
