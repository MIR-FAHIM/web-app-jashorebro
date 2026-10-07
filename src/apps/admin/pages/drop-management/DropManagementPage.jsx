import { useState } from 'react'
import { Flame, Plus, Clock, Users, ArrowUpRight, CheckCircle2, AlertTriangle } from 'lucide-react'
import { Card } from '@/shared/ui/Card'
import { Badge } from '@/shared/ui/Badge'
import { Button } from '@/shared/ui/Button'
import { Dialog } from '@/shared/ui/Dialog'
import { formatCurrency } from '@/shared/lib/formatCurrency'

const initialDrops = [
  {
    id: 'drop_1',
    title: 'Vintage Oversized Corduroy Hoodie',
    category: 'Streetwear',
    seller: 'TrendFabric BD',
    currentPrice: 1099,
    basePrice: 1350,
    nextPrice: 999,
    participants: 18,
    target: 25,
    status: 'Active',
    endsIn: '2d 14h',
    tiers: [
      { count: 10, price: 1199 },
      { count: 20, price: 1099 },
      { count: 25, price: 999 },
    ],
  },
  {
    id: 'drop_2',
    title: 'Havit H2002D RGB Gaming Headset',
    category: 'Tech & gadgets',
    seller: 'GadgetZone Jashore',
    currentPrice: 2350,
    basePrice: 2800,
    nextPrice: 2099,
    participants: 28,
    target: 30,
    status: 'Active',
    endsIn: '18h 40m',
    tiers: [
      { count: 15, price: 2499 },
      { count: 25, price: 2350 },
      { count: 30, price: 2099 },
    ],
  },
  {
    id: 'drop_3',
    title: 'Benapole Pure Leather Bifold Wallet',
    category: 'Leathercraft',
    seller: 'Artisan Hub Jashore',
    currentPrice: 850,
    basePrice: 1100,
    nextPrice: 720,
    participants: 12,
    target: 20,
    status: 'Active',
    endsIn: '3d 08h',
    tiers: [
      { count: 5, price: 950 },
      { count: 15, price: 850 },
      { count: 20, price: 720 },
    ],
  },
  {
    id: 'drop_4',
    title: 'Retro High-Top White Canvas Sneakers',
    category: 'Footwear',
    seller: 'FootStyle Jashore',
    currentPrice: 1250,
    basePrice: 1650,
    nextPrice: null,
    participants: 50,
    target: 50,
    status: 'Completed',
    endsIn: 'Closed',
    tiers: [
      { count: 20, price: 1450 },
      { count: 40, price: 1350 },
      { count: 50, price: 1250 },
    ],
  },
]

export default function DropManagementPage() {
  const [drops, setDrops] = useState(initialDrops)
  const [activeTab, setActiveTab] = useState('All')
  const [selectedDrop, setSelectedDrop] = useState(null)
  const [isCreateOpen, setIsCreateOpen] = useState(false)

  // New drop form state
  const [formData, setFormData] = useState({
    title: '',
    category: 'Streetwear',
    seller: 'TrendFabric BD',
    basePrice: '',
    tier1Price: '',
    tier1Target: '10',
    tier2Price: '',
    tier2Target: '25',
    durationDays: '3',
  })

  const filteredDrops = drops.filter((d) => {
    if (activeTab === 'All') return true
    return d.status.toLowerCase() === activeTab.toLowerCase()
  })

  const handleCreateSubmit = (e) => {
    e.preventDefault()
    const newDrop = {
      id: `drop_${Date.now()}`,
      title: formData.title,
      category: formData.category,
      seller: formData.seller,
      basePrice: Number(formData.basePrice),
      currentPrice: Number(formData.basePrice),
      nextPrice: Number(formData.tier1Price),
      participants: 0,
      target: Number(formData.tier2Target),
      status: 'Active',
      endsIn: `${formData.durationDays}d 00h`,
      tiers: [
        { count: Number(formData.tier1Target), price: Number(formData.tier1Price) },
        { count: Number(formData.tier2Target), price: Number(formData.tier2Price) },
      ],
    }

    setDrops([newDrop, ...drops])
    setIsCreateOpen(false)
    setFormData({
      title: '',
      category: 'Streetwear',
      seller: 'TrendFabric BD',
      basePrice: '',
      tier1Price: '',
      tier1Target: '10',
      tier2Price: '',
      tier2Target: '25',
      durationDays: '3',
    })
  }

  const handleCloseEarly = (id) => {
    setDrops(
      drops.map((d) => (d.id === id ? { ...d, status: 'Completed', endsIn: 'Closed' } : d))
    )
    setSelectedDrop(null)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Flame size={18} className="text-orange-500" />
            <span className="text-xs font-bold uppercase tracking-wider text-orange-400">
              Community Commerce Engine
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Volume Drops Management
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-400 max-w-2xl">
            Control dynamic price-curve campaigns, participant quotas, and unlocking tiers across Jashore merchants.
          </p>
        </div>

        <Button
          variant="drop-fire"
          onClick={() => setIsCreateOpen(true)}
          className="font-bold gap-2 shrink-0"
        >
          <Plus size={16} />
          <span>Launch New Drop</span>
        </Button>
      </div>

      {/* Tabs & Filter Bar */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        {['All', 'Active', 'Completed'].map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
              activeTab === tab
                ? 'bg-orange-500/15 text-orange-400 border border-orange-500/30'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Drops Table Card */}
      <Card className="bg-slate-900 border-slate-800 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-left text-xs">
            <thead className="bg-slate-950/60 text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th scope="col" className="px-5 py-3.5">Campaign & Producer</th>
                <th scope="col" className="px-5 py-3.5">Current Price</th>
                <th scope="col" className="px-5 py-3.5">Participation Progress</th>
                <th scope="col" className="px-5 py-3.5">Next Milestone</th>
                <th scope="col" className="px-5 py-3.5">Time Left</th>
                <th scope="col" className="px-5 py-3.5">Status</th>
                <th scope="col" className="px-5 py-3.5 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredDrops.map((row) => {
                const pct = Math.min(100, Math.round((row.participants / row.target) * 100))
                return (
                  <tr key={row.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="max-w-[240px] px-5 py-4">
                      <p className="font-bold text-white truncate">{row.title}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {row.seller} · <span className="text-slate-500">{row.category}</span>
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <span className="font-bold text-white text-sm">
                        {formatCurrency(row.currentPrice)}
                      </span>
                      <p className="text-[10px] text-slate-500 line-through">
                        {formatCurrency(row.basePrice)}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center justify-between text-[11px] text-slate-300 mb-1">
                        <span>{row.participants} joined</span>
                        <span className="font-semibold text-orange-400">{pct}%</span>
                      </div>
                      <div className="h-1.5 w-28 rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-orange-500 to-red-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      {row.nextPrice ? (
                        <div>
                          <Badge
                            size="sm"
                            className="bg-orange-500/15 text-orange-400 border border-orange-500/30"
                          >
                            {formatCurrency(row.nextPrice)} at {row.target}
                          </Badge>
                          <p className="text-[10px] text-slate-500 mt-1">
                            {row.target - row.participants} orders to unlock
                          </p>
                        </div>
                      ) : (
                        <span className="text-emerald-400 text-xs font-semibold flex items-center gap-1">
                          <CheckCircle2 size={13} /> Lowest Tier
                        </span>
                      )}
                    </td>

                    <td className="px-5 py-4 text-slate-300 font-mono text-[11px]">
                      {row.endsIn}
                    </td>

                    <td className="px-5 py-4">
                      <Badge
                        size="sm"
                        variant={row.status === 'Completed' ? 'unlocked' : 'brand'}
                        className={
                          row.status === 'Completed'
                            ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                            : 'bg-orange-500/15 text-orange-400 border-orange-500/30'
                        }
                      >
                        {row.status}
                      </Badge>
                    </td>

                    <td className="px-5 py-4 text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setSelectedDrop(row)}
                        className="text-slate-400 hover:text-white hover:bg-slate-800"
                      >
                        <ArrowUpRight size={16} />
                      </Button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Inspect Drop Details Dialog */}
      <Dialog
        isOpen={Boolean(selectedDrop)}
        onClose={() => setSelectedDrop(null)}
        title={selectedDrop?.title}
        description="Drop campaign details and volume tier milestones"
      >
        {selectedDrop && (
          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
              <div>
                <span className="text-slate-500">Merchant:</span>
                <p className="font-bold text-white mt-0.5">{selectedDrop.seller}</p>
              </div>
              <div>
                <span className="text-slate-500">Status:</span>
                <p className="font-bold text-orange-400 mt-0.5">{selectedDrop.status}</p>
              </div>
              <div>
                <span className="text-slate-500">Base Retail:</span>
                <p className="font-bold text-slate-300 mt-0.5">
                  {formatCurrency(selectedDrop.basePrice)}
                </p>
              </div>
              <div>
                <span className="text-slate-500">Current Price:</span>
                <p className="font-bold text-emerald-400 mt-0.5">
                  {formatCurrency(selectedDrop.currentPrice)}
                </p>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold text-white mb-2">Volume Milestones</h4>
              <div className="space-y-2">
                {selectedDrop.tiers?.map((t, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-slate-800/60 text-xs border border-slate-700/50"
                  >
                    <span className="text-slate-300 font-medium">Tier {idx + 1} ({t.count} orders)</span>
                    <span className="font-bold text-orange-400">{formatCurrency(t.price)}</span>
                  </div>
                ))}
              </div>
            </div>

            {selectedDrop.status === 'Active' && (
              <div className="pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCloseEarly(selectedDrop.id)}
                  className="w-full text-red-400 border-red-500/30 hover:bg-red-500/10"
                >
                  <AlertTriangle size={15} />
                  <span>Lock & Conclude Drop Early</span>
                </Button>
              </div>
            )}
          </div>
        )}
      </Dialog>

      {/* Launch New Drop Dialog */}
      <Dialog
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Launch New Volume Drop"
        description="Set tiered price discounts to catalyze group purchasing in Jashore."
      >
        <form onSubmit={handleCreateSubmit} className="space-y-3.5 pt-2 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Drop Campaign Title</label>
            <input
              type="text"
              required
              placeholder="e.g. Handmade Keshabpur Clay Tea Set"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder:text-slate-500 focus:border-brand focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:border-brand focus:outline-none"
              >
                <option value="Streetwear">Streetwear</option>
                <option value="Tech & gadgets">Tech & gadgets</option>
                <option value="Leathercraft">Leathercraft</option>
                <option value="Artisan goods">Artisan goods</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Merchant / Seller</label>
              <input
                type="text"
                required
                value={formData.seller}
                onChange={(e) => setFormData({ ...formData, seller: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:border-brand focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Base Price (BDT)</label>
              <input
                type="number"
                required
                placeholder="1200"
                value={formData.basePrice}
                onChange={(e) => setFormData({ ...formData, basePrice: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:border-brand focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Duration (Days)</label>
              <input
                type="number"
                required
                value={formData.durationDays}
                onChange={(e) => setFormData({ ...formData, durationDays: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:border-brand focus:outline-none"
              />
            </div>
          </div>

          <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 space-y-2.5">
            <p className="font-bold text-orange-400">Discount Tiers</p>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                placeholder="Tier 1 Price (e.g. 1050)"
                required
                value={formData.tier1Price}
                onChange={(e) => setFormData({ ...formData, tier1Price: e.target.value })}
                className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
              />
              <input
                type="number"
                placeholder="at X orders (e.g. 10)"
                required
                value={formData.tier1Target}
                onChange={(e) => setFormData({ ...formData, tier1Target: e.target.value })}
                className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                placeholder="Tier 2 Price (e.g. 950)"
                required
                value={formData.tier2Price}
                onChange={(e) => setFormData({ ...formData, tier2Price: e.target.value })}
                className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
              />
              <input
                type="number"
                placeholder="at X orders (e.g. 25)"
                required
                value={formData.tier2Target}
                onChange={(e) => setFormData({ ...formData, tier2Target: e.target.value })}
                className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setIsCreateOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="drop-fire" size="sm" className="font-bold">
              Publish Drop Campaign
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  )
}
