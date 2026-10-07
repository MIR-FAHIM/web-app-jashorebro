import React, { useState } from 'react'
import { Plus, Flame, Clock, CheckCircle } from 'lucide-react'
import { Card } from '@/shared/ui/Card'
import { Badge } from '@/shared/ui/Badge'
import { Button } from '@/shared/ui/Button'
import { formatCurrency } from '@/shared/lib/formatCurrency'

export default function DropManagementPage() {
  const [drops, setDrops] = useState([
    {
      id: 'drop_1',
      title: 'Vintage Oversized Corduroy Hoodie',
      category: 'Streetwear',
      retailPrice: 1200,
      lowestTierPrice: 799,
      participants: 18,
      status: 'active',
      tiersCount: 5,
      endsIn: '2d 14h',
    },
    {
      id: 'drop_2',
      title: 'Havit H2002D RGB Gaming Headset',
      category: 'Tech & Gadgets',
      retailPrice: 2600,
      lowestTierPrice: 2099,
      participants: 28,
      status: 'active',
      tiersCount: 3,
      endsIn: '18h',
    },
    {
      id: 'drop_3',
      title: 'Retro High-Top White Canvas Sneakers',
      category: 'Footwear',
      retailPrice: 1650,
      lowestTierPrice: 1250,
      participants: 50,
      status: 'unlocked_max',
      tiersCount: 4,
      endsIn: 'Completed',
    },
  ])

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
            Drop Campaign Management
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure progressive pricing tiers, manage rally countdowns, and verify batch inventory.
          </p>
        </div>
        <Button variant="drop-fire" size="sm" onClick={() => alert('Open Tier Ladder Builder Modal')}>
          <Plus size={16} /> New Drop Campaign
        </Button>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">Campaign Title</th>
                <th className="py-3 px-4">Price Range</th>
                <th className="py-3 px-4">Participants</th>
                <th className="py-3 px-4">Tier Ladder</th>
                <th className="py-3 px-4">Time Remaining</th>
                <th className="py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {drops.map((d) => (
                <tr key={d.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4">
                    <span className="font-bold text-slate-900 block">{d.title}</span>
                    <span className="text-[11px] text-slate-400">{d.category}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-slate-900 font-bold">
                      {formatCurrency(d.lowestTierPrice)} - {formatCurrency(d.retailPrice)}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-bold text-orange-600">🔥 {d.participants} joined</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-slate-600 font-semibold">{d.tiersCount} Milestone Tiers</span>
                  </td>
                  <td className="py-3 px-4 text-slate-500">
                    <span className="flex items-center gap-1">
                      <Clock size={13} className="text-slate-400" /> {d.endsIn}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <Button variant="outline" size="sm" className="text-xs">
                      Edit Tiers
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
