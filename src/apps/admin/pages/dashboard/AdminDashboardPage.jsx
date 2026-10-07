import React from 'react'
import { Flame, Users, ShoppingBag, DollarSign, TrendingUp, ArrowUpRight } from 'lucide-react'
import { Card } from '@/shared/ui/Card'
import { Badge } from '@/shared/ui/Badge'
import { Button } from '@/shared/ui/Button'
import { formatCurrency } from '@/shared/lib/formatCurrency'

export default function AdminDashboardPage() {
  const stats = [
    {
      title: 'Active Drops',
      value: '14',
      change: '+3 today',
      icon: Flame,
      color: 'text-orange-600 bg-orange-50',
    },
    {
      title: 'Active Rallyers',
      value: '842',
      change: '+18% this week',
      icon: Users,
      color: 'text-blue-600 bg-blue-50',
    },
    {
      title: 'Aggregated GMV',
      value: formatCurrency(284500),
      change: '+24% vs last month',
      icon: DollarSign,
      color: 'text-emerald-600 bg-emerald-50',
    },
    {
      title: 'Curator Payouts',
      value: formatCurrency(14200),
      change: '42 pending payouts',
      icon: ShoppingBag,
      color: 'text-purple-600 bg-purple-50',
    },
  ]

  const activeDropCampaigns = [
    {
      id: 'drop_1',
      title: 'Vintage Oversized Corduroy Hoodie',
      category: 'Streetwear',
      seller: 'TrendFabric BD',
      participants: 18,
      targetTier: 'Tier 3 (25 bros)',
      currentPrice: 999,
      status: 'rallying',
    },
    {
      id: 'drop_2',
      title: 'Havit H2002D RGB Gaming Headset',
      category: 'Tech & Gadgets',
      seller: 'GadgetZone Jashore',
      participants: 28,
      targetTier: 'Tier 3 (30 bros)',
      currentPrice: 2099,
      status: 'almost_unlocked',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
            Platform Command Center
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time overview of community drops, collective demand, and curator attribution.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="drop-fire" size="sm">
            + Create New Drop Campaign
          </Button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {stats.map(({ title, value, change, icon: Icon, color }) => (
          <Card key={title} className="p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">{title}</span>
              <div className={`p-2 rounded-xl ${color}`}>
                <Icon size={18} />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-xl md:text-2xl font-black text-slate-900 block">{value}</span>
              <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-0.5 mt-0.5">
                <TrendingUp size={11} /> {change}
              </span>
            </div>
          </Card>
        ))}
      </div>

      {/* Live Drops Tracking Table */}
      <Card className="overflow-hidden">
        <div className="p-4 md:p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Active High-Velocity Drops</h3>
            <p className="text-xs text-slate-500 mt-0.5">Real-time group buying rallies across Jashore.</p>
          </div>
          <Button variant="outline" size="sm" className="text-xs">
            View All Drops
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">Drop Item</th>
                <th className="py-3 px-4">Merchant</th>
                <th className="py-3 px-4">Participants</th>
                <th className="py-3 px-4">Current Price</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {activeDropCampaigns.map((d) => (
                <tr key={d.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4">
                    <span className="font-bold text-slate-900 block">{d.title}</span>
                    <span className="text-slate-400 text-[11px]">{d.category}</span>
                  </td>
                  <td className="py-3 px-4 text-slate-600">{d.seller}</td>
                  <td className="py-3 px-4">
                    <span className="font-bold text-orange-600">🔥 {d.participants} in</span>
                    <span className="text-slate-400 block text-[10px]">{d.targetTier}</span>
                  </td>
                  <td className="py-3 px-4 font-bold text-slate-900">
                    {formatCurrency(d.currentPrice)}
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant={d.status === 'almost_unlocked' ? 'unlocked' : 'fire'} size="sm">
                      {d.status === 'almost_unlocked' ? '93% Unlocked' : 'Active Rally'}
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
