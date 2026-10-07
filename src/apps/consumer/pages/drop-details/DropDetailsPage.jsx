import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Share2, Clock, ShieldCheck, Sparkles, CheckCircle2 } from 'lucide-react'
import { PageHeader } from '@/shared/patterns/PageHeader'
import { Card } from '@/shared/ui/Card'
import { Badge } from '@/shared/ui/Badge'
import { Button } from '@/shared/ui/Button'
import { Avatar } from '@/shared/ui/Avatar'
import { DropProgress } from '@/features/drops/components/DropProgress'
import { ImInButton } from '@/features/drops/components/ImInButton'
import { formatCurrency } from '@/shared/lib/formatCurrency'

export default function DropDetailsPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [isJoined, setIsJoined] = useState(false)
  const [participants, setParticipants] = useState(18)

  const drop = {
    id: id || 'drop_1',
    title: 'Vintage Oversized Corduroy Hoodie',
    category: 'Streetwear',
    retailPrice: 1200,
    currentPrice: 999,
    description:
      'Premium heavy corduroy cotton blend with drop-shoulder silhouette. Tailored for comfortable everyday wear and casual styling in cool weather.',
    images: [
      'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80',
    ],
    tiers: [
      { requiredParticipants: 1, price: 1200 },
      { requiredParticipants: 10, price: 1099 },
      { requiredParticipants: 25, price: 999 },
      { requiredParticipants: 50, price: 899 },
      { requiredParticipants: 100, price: 799 },
    ],
    curator: {
      name: 'Fahim Ahmed',
      handle: 'fahim_vibes',
      tasteScore: '4.9',
      recommendationCount: 42,
    },
    endsIn: '2 days 14 hours',
  }

  const handleToggleJoin = () => {
    setIsJoined((prev) => {
      const next = !prev
      setParticipants((p) => (next ? p + 1 : p - 1))
      return next
    })
  }

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <PageHeader
        title={drop.title}
        subtitle={`${drop.category} • Curated by ${drop.curator.name}`}
        showBack
        actions={
          <button
            onClick={() => {
              navigator.clipboard.writeText(window.location.href)
              alert('Drop link copied!')
            }}
            className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            title="Share"
          >
            <Share2 size={18} />
          </button>
        }
      />

      {/* Side-by-side on desktop, stacked on mobile */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Media Gallery */}
        <div className="space-y-3">
          <div className="aspect-square rounded-2xl overflow-hidden bg-slate-100 border border-slate-200/80">
            <img
              src={drop.images[0]}
              alt={drop.title}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Clock size={14} className="text-orange-500" />
            <span>Drop closes in <strong className="text-slate-800">{drop.endsIn}</strong></span>
          </div>
        </div>

        {/* Rally & Pricing Panel */}
        <div className="space-y-5">
          <Card className="p-5 space-y-5">
            <div>
              <div className="flex items-center justify-between">
                <Badge variant="fire" size="md">
                  Active Drop Rally
                </Badge>
                <span className="text-xs text-slate-500">Tier 3 in reach</span>
              </div>
              <h2 className="text-xl font-extrabold text-slate-900 mt-2">
                {drop.title}
              </h2>
            </div>

            {/* Progressive Pricing Progress */}
            <DropProgress
              tiers={drop.tiers}
              currentParticipants={participants}
              retailPrice={drop.retailPrice}
            />

            {/* Complete Tier Ladder Table */}
            <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/60">
              <span className="text-xs font-bold text-slate-700 block mb-2">
                Tier Pricing Breakdown
              </span>
              <div className="space-y-1.5 text-xs">
                {drop.tiers.map((tier) => {
                  const isCurrent = participants >= tier.requiredParticipants
                  return (
                    <div
                      key={tier.requiredParticipants}
                      className={`flex items-center justify-between p-1.5 rounded-lg transition-colors ${
                        isCurrent
                          ? 'bg-emerald-50 text-emerald-800 font-semibold'
                          : 'text-slate-500'
                      }`}
                    >
                      <span className="flex items-center gap-1.5">
                        {isCurrent ? (
                          <CheckCircle2 size={13} className="text-emerald-600" />
                        ) : (
                          <span className="w-3.5 h-3.5 rounded-full border border-slate-300 inline-block" />
                        )}
                        {tier.requiredParticipants}+ Bros
                      </span>
                      <span>{formatCurrency(tier.price)}</span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* "I'm In" Interaction & Checkout CTA */}
            <div className="space-y-2 pt-2">
              <ImInButton
                isJoined={isJoined}
                onToggleJoin={handleToggleJoin}
                size="lg"
              />
              <p className="text-[11px] text-center text-slate-400">
                Tap 🔥 I'm In to join the rally. Pay when the lowest tier unlocks!
              </p>

              {isJoined && (
                <Button
                  variant="primary"
                  size="md"
                  className="w-full mt-2"
                  onClick={() => navigate('/checkout')}
                >
                  Confirm Pre-Order at Current Price ({formatCurrency(drop.currentPrice)})
                </Button>
              )}
            </div>
          </Card>

          {/* Description */}
          <div className="p-4 bg-white rounded-2xl border border-slate-200/80">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Product Story & Details
            </h4>
            <p className="text-sm text-slate-600 leading-relaxed">
              {drop.description}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
