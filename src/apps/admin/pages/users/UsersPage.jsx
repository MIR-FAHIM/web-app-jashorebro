import React from 'react'
import { Card } from '@/shared/ui/Card'
import { Badge } from '@/shared/ui/Badge'
import { Avatar } from '@/shared/ui/Avatar'
import { formatCurrency } from '@/shared/lib/formatCurrency'

export default function UsersPage() {
  const curators = [
    {
      id: 'u1',
      name: 'Fahim Ahmed',
      handle: '@fahim_vibes',
      tasteScore: '4.9',
      influencedOrders: 42,
      earnedRewards: 1850,
      badge: 'Trendsetter',
    },
    {
      id: 'u2',
      name: 'Nabila Rahman',
      handle: '@nabila_edits',
      tasteScore: '4.8',
      influencedOrders: 31,
      earnedRewards: 1420,
      badge: 'Drop Catalyst',
    },
    {
      id: 'u3',
      name: 'Sakib Al Hasan',
      handle: '@sakib_tech',
      tasteScore: '4.7',
      influencedOrders: 19,
      earnedRewards: 980,
      badge: 'Curator',
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
          Curators & Tastemakers
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Review taste scores, recommendation integrity, and attributed purchases.
        </p>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">Curator</th>
                <th className="py-3 px-4">Taste Score</th>
                <th className="py-3 px-4">Influenced Sales</th>
                <th className="py-3 px-4">Earned Rewards</th>
                <th className="py-3 px-4">Recognition Badge</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {curators.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2.5">
                      <Avatar name={c.name} size="sm" />
                      <div>
                        <span className="font-bold text-slate-900 block">{c.name}</span>
                        <span className="text-[11px] text-slate-400">{c.handle}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-bold text-slate-900">⭐ {c.tasteScore}</td>
                  <td className="py-3 px-4 text-slate-700">{c.influencedOrders} buys</td>
                  <td className="py-3 px-4 text-emerald-700 font-bold">{formatCurrency(c.earnedRewards)}</td>
                  <td className="py-3 px-4">
                    <Badge variant="fire" size="sm">
                      {c.badge}
                    </Badge>
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
