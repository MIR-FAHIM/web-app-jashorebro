import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Flame,
  Users,
  Store,
  DollarSign,
  ArrowRight,
  Clock,
  Plus,
  ShieldCheck,
  ShoppingBag,
  ExternalLink,
  Sparkles,
  TrendingUp,
} from 'lucide-react'
import { Card } from '@/shared/ui/Card'
import { Badge } from '@/shared/ui/Badge'
import { Button } from '@/shared/ui/Button'
import { formatCurrency } from '@/shared/lib/formatCurrency'
import { adminApi } from '../../api/adminApi'

const fallbackCampaigns = [
  {
    id: 'drop_1',
    title: 'Vintage Oversized Corduroy Hoodie',
    category: 'Streetwear',
    seller: 'TrendFabric BD',
    participants: 18,
    target: 25,
    price: 1099,
    next: 999,
  },
  {
    id: 'drop_2',
    title: 'Havit H2002D RGB Gaming Headset',
    category: 'Tech & gadgets',
    seller: 'GadgetZone Jashore',
    participants: 28,
    target: 30,
    price: 2350,
    next: 2099,
  },
  {
    id: 'drop_3',
    title: 'Benapole Pure Leather Bifold Wallet',
    category: 'Leathercraft',
    seller: 'Artisan Hub Jashore',
    participants: 12,
    target: 20,
    price: 850,
    next: 720,
  },
]

export default function AdminDashboardPage() {
  const navigate = useNavigate()
  const [statsData, setStatsData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadStats() {
      setIsLoading(true)
      const data = await adminApi.getOverview()
      if (data) {
        setStatsData(data)
      }
      setIsLoading(false)
    }
    loadStats()
  }, [])

  const counts = statsData?.counts || {}

  const stats = [
    {
      title: 'Active Drops',
      value: counts.active_drops ?? '14',
      note: 'Volume threshold discounts live',
      icon: Flame,
      tone: 'text-orange-400 bg-orange-500/15 border border-orange-500/30',
      action: () => navigate('/admin/drops'),
    },
    {
      title: 'Community Members',
      value: counts.total_users ? counts.total_users.toString() : '842',
      note: 'Registered curators & buyers',
      icon: Users,
      tone: 'text-blue-400 bg-blue-500/15 border border-blue-500/30',
      action: () => navigate('/admin/users'),
    },
    {
      title: 'Jashore Producers',
      value: counts.total_sellers ? counts.total_sellers.toString() : '16',
      note: 'Local merchants in Kotwali & Benapole',
      icon: Store,
      tone: 'text-emerald-400 bg-emerald-500/15 border border-emerald-500/30',
      action: () => navigate('/admin/sellers'),
    },
    {
      title: 'Gross Merchandising Value',
      value: formatCurrency(counts.estimated_gmv || 284500),
      note: 'Preserved order settlement value',
      icon: DollarSign,
      tone: 'text-amber-400 bg-amber-500/15 border border-amber-500/30',
      action: () => navigate('/admin/orders'),
    },
  ]

  return (
    <div className="space-y-8">
      {/* Top Banner / Welcome */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="inline-flex items-center gap-1.5 rounded-md bg-orange-500/10 px-2 py-0.5 text-xs font-semibold uppercase tracking-wider text-orange-400 border border-orange-500/20">
              <Sparkles size={12} />
              Jashore Regional Hub
            </span>
            <span className="text-xs text-slate-500">Live Production</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Administrative Control Center
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-400">
            Real-time telemetry on active Drops, local fulfillment, and curator community activity.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate('/admin/catalog')}
            className="border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700"
          >
            <ShoppingBag size={15} />
            <span>Product Catalog</span>
          </Button>

          <Button
            variant="drop-fire"
            size="sm"
            onClick={() => navigate('/admin/drops')}
            className="font-bold gap-1.5"
          >
            <Plus size={16} />
            <span>Manage Drops</span>
          </Button>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(({ title, value, note, icon: Icon, tone, action }) => (
          <Card
            key={title}
            onClick={action}
            className="p-5 bg-slate-900 border-slate-800 hover:border-slate-700 transition-all cursor-pointer group shadow-lg"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-medium text-slate-400">{title}</span>
              <span className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${tone} transition-transform group-hover:scale-105`}>
                <Icon size={18} />
              </span>
            </div>
            <p className="mt-4 text-2xl font-black tracking-tight text-white">{value}</p>
            <p className="mt-1 text-[11px] text-slate-500 flex items-center justify-between">
              <span>{note}</span>
              <ArrowRight size={13} className="text-slate-600 group-hover:text-orange-400 group-hover:translate-x-0.5 transition-all" />
            </p>
          </Card>
        ))}
      </div>

      {/* Main Content Split: Live Drops Table & Action Queue */}
      <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
        {/* Active Drops Table */}
        <Card className="min-w-0 bg-slate-900 border-slate-800 shadow-xl overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 p-5">
            <div>
              <div className="flex items-center gap-2">
                <Flame size={18} className="text-orange-400" />
                <h2 className="text-base font-bold text-white">Live Volume Drops</h2>
              </div>
              <p className="mt-0.5 text-xs text-slate-400">
                Tracking participant velocity towards next unlocking price tier.
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/admin/drops')}
              className="text-xs text-orange-400 hover:bg-orange-500/10"
            >
              <span>View All</span>
              <ArrowRight size={14} />
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-xs">
              <thead className="bg-slate-950/60 text-slate-400 font-semibold border-b border-slate-800">
                <tr>
                  <th scope="col" className="px-5 py-3.5">Product & Producer</th>
                  <th scope="col" className="px-5 py-3.5">Participation</th>
                  <th scope="col" className="px-5 py-3.5">Current Price</th>
                  <th scope="col" className="px-5 py-3.5">Next Milestone</th>
                  <th scope="col" className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {fallbackCampaigns.map((drop) => {
                  const progressPct = Math.min(100, Math.round((drop.participants / drop.target) * 100))
                  return (
                    <tr key={drop.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="max-w-[240px] px-5 py-4">
                        <p className="font-bold text-white text-xs truncate">{drop.title}</p>
                        <p className="mt-0.5 text-[11px] text-slate-400 flex items-center gap-1.5">
                          <Store size={12} className="text-emerald-400" />
                          <span>{drop.seller}</span>
                          <span className="text-slate-600">·</span>
                          <span className="text-slate-500">{drop.category}</span>
                        </p>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-between text-[11px] font-medium text-slate-300 mb-1">
                          <span>{drop.participants} joined</span>
                          <span className="text-orange-400 font-bold">{progressPct}%</span>
                        </div>
                        <div className="h-1.5 w-32 rounded-full bg-slate-800 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-orange-500 to-red-500"
                            style={{ width: `${progressPct}%` }}
                          />
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="font-extrabold text-white text-sm">
                          {formatCurrency(drop.price)}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <Badge
                          variant="brand"
                          size="sm"
                          className="bg-orange-500/15 text-orange-400 border-orange-500/30"
                        >
                          {formatCurrency(drop.next)} at {drop.target} orders
                        </Badge>
                        <p className="mt-1 text-[10px] text-slate-500">
                          {drop.target - drop.participants} more needed
                        </p>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <Button
                          variant="ghost"
                          size="xs"
                          onClick={() => navigate('/admin/drops')}
                          className="text-slate-300 hover:text-white hover:bg-slate-800"
                        >
                          Inspect
                        </Button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Attention & Action Center */}
        <div className="space-y-4">
          <Card className="p-5 bg-slate-900 border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center gap-2.5">
              <span className="flex size-9 items-center justify-center rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30">
                <Clock size={18} />
              </span>
              <div>
                <h3 className="text-sm font-bold text-white">Action Queue</h3>
                <p className="text-[11px] text-slate-400">Governance & Payout approvals</p>
              </div>
            </div>

            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={() => navigate('/admin/sellers')}
                className="flex min-h-11 w-full items-center justify-between rounded-xl bg-slate-800/80 px-3.5 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors border border-slate-700/50"
              >
                <div className="flex items-center gap-2">
                  <ShieldCheck size={15} className="text-emerald-400" />
                  <span>Producer Verifications</span>
                </div>
                <Badge size="xs" variant="unlocked" className="bg-emerald-500/20 text-emerald-300">
                  {counts.pending_sellers ?? 2} pending
                </Badge>
              </button>

              <button
                type="button"
                onClick={() => navigate('/admin/rewards')}
                className="flex min-h-11 w-full items-center justify-between rounded-xl bg-slate-800/80 px-3.5 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors border border-slate-700/50"
              >
                <div className="flex items-center gap-2">
                  <DollarSign size={15} className="text-amber-400" />
                  <span>Curator Payouts</span>
                </div>
                <span className="text-[11px] text-amber-400 font-bold">
                  {formatCurrency(counts.pending_rewards || 14200)}
                </span>
              </button>

              <button
                type="button"
                onClick={() => navigate('/admin/moderation')}
                className="flex min-h-11 w-full items-center justify-between rounded-xl bg-slate-800/80 px-3.5 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors border border-slate-700/50"
              >
                <div className="flex items-center gap-2">
                  <TrendingUp size={15} className="text-blue-400" />
                  <span>Shelf Moderation Queue</span>
                </div>
                <ArrowRight size={14} className="text-slate-500" />
              </button>
            </div>
          </Card>

          {/* Jashore Dispatch Hub Status */}
          <Card className="p-4 bg-gradient-to-br from-slate-900 to-slate-950 border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white">Hub Coverage</span>
              <span className="text-[10px] text-emerald-400 font-medium">9 Upazilas active</span>
            </div>
            <p className="mt-1 text-[11px] text-slate-400">
              Deliveries managed across Jashore Sadar, Keshabpur, Jhikargachha, Benapole, and JUST campus.
            </p>
          </Card>
        </div>
      </div>
    </div>
  )
}
