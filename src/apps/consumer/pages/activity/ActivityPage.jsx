import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Flame, CheckCircle, Package, ArrowRight } from 'lucide-react'
import { Card } from '@/shared/ui/Card'
import { Badge } from '@/shared/ui/Badge'
import { Button } from '@/shared/ui/Button'
import { formatCurrency } from '@/shared/lib/formatCurrency'

export default function ActivityPage() {
  const navigate = useNavigate()

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div>
        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Your Activity</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Drops you joined, unlocked prices, and order deliveries.
        </p>
      </div>

      {/* Active Joined Drops Section */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Drops You're In (2)
        </h3>

        {/* Drop 1 */}
        <Card className="p-4 space-y-3 border-orange-200/80 bg-orange-50/20">
          <div className="flex items-center justify-between">
            <Badge variant="fire" size="sm">
              <Flame size={12} /> Rallying Now
            </Badge>
            <span className="text-xs text-slate-500 font-medium">Closes in 18h</span>
          </div>

          <div className="flex gap-3">
            <img
              src="https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=300&q=80"
              alt="Hoodie"
              className="w-16 h-16 rounded-xl object-cover"
            />
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-bold text-slate-900 line-clamp-1">
                Vintage Oversized Corduroy Hoodie
              </h4>
              <p className="text-xs text-slate-600 mt-0.5">
                Current unlocked price: <strong className="text-emerald-700">৳999</strong> (saved ৳201)
              </p>
              <p className="text-[11px] text-orange-600 font-medium mt-1">
                🔥 7 more people needed to hit ৳899!
              </p>
            </div>
          </div>

          <div className="pt-2 border-t border-orange-100 flex items-center justify-between">
            <button
              onClick={() => navigate('/drops/drop_1')}
              className="text-xs font-bold text-[var(--color-brand)] hover:underline flex items-center gap-1 cursor-pointer"
            >
              View Drop Progress <ArrowRight size={13} />
            </button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate('/checkout')}
              className="text-xs"
            >
              Pre-Checkout (৳999)
            </Button>
          </div>
        </Card>

        {/* Drop 2 */}
        <Card className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <Badge variant="unlocked" size="sm">
              🎉 Unlocked Lowest Tier!
            </Badge>
            <span className="text-xs text-slate-500 font-medium">Ready for checkout</span>
          </div>

          <div className="flex gap-3">
            <img
              src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=300&q=80"
              alt="Headset"
              className="w-16 h-16 rounded-xl object-cover"
            />
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-bold text-slate-900 line-clamp-1">
                Havit H2002D RGB Gaming Headset
              </h4>
              <p className="text-xs text-slate-600 mt-0.5">
                Final price: <strong className="text-emerald-700">৳2,099</strong> (Retail ৳2,600)
              </p>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500">Checkout window closes in 24h</span>
            <Button
              variant="drop-fire"
              size="sm"
              onClick={() => navigate('/checkout')}
              className="text-xs"
            >
              Complete Order
            </Button>
          </div>
        </Card>
      </div>

      {/* Recent Deliveries */}
      <div className="space-y-3 pt-3">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Completed Orders (1)
        </h3>
        <Card className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
              <Package size={20} />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">
                Retro High-Top Sneakers
              </h4>
              <p className="text-[11px] text-slate-500">Delivered to Jashore City • 14 Oct</p>
            </div>
          </div>
          <Badge variant="default" size="sm">
            Delivered
          </Badge>
        </Card>
      </div>
    </div>
  )
}
