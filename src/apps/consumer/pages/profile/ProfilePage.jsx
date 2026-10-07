import React, { useState } from 'react'
import { Award, Sparkles, TrendingUp, Wallet, Share2, Plus } from 'lucide-react'
import { Card } from '@/shared/ui/Card'
import { Badge } from '@/shared/ui/Badge'
import { Button } from '@/shared/ui/Button'
import { Avatar } from '@/shared/ui/Avatar'
import { formatCurrency } from '@/shared/lib/formatCurrency'

const MOCK_PICKS = [
  {
    id: 'pick_1',
    title: 'Vintage Oversized Corduroy Hoodie',
    price: 999,
    note: 'Runs slightly large, order true to size for comfortable relaxed drape.',
    influencedBuys: 18,
    image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'pick_2',
    title: 'Havit H2002D RGB Gaming Headset',
    price: 2099,
    note: 'Mic is surprisingly clean for Discord calls and gaming on budget.',
    influencedBuys: 24,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=400&q=80',
  },
]

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState('picks') // 'picks' | 'rewards'

  const curator = {
    name: 'Fahim Ahmed',
    handle: '@fahim_vibes',
    location: 'Jashore, Bangladesh',
    tasteScore: '4.9',
    totalInfluencedSales: 42,
    walletBalance: 1850,
    bio: 'Tech enthusiast & streetwear lover. Curating honest picks that I personally test and recommend.',
  }

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      {/* Profile Header Card */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
          <Avatar name={curator.name} size="xl" className="ring-4 ring-orange-100" />
          <div className="flex-1 space-y-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h2 className="text-xl font-black text-slate-900">{curator.name}</h2>
              <Badge variant="fire" size="sm">
                <Sparkles size={11} /> Trendsetter
              </Badge>
              <Badge variant="unlocked" size="sm">
                Drop Catalyst
              </Badge>
            </div>
            <p className="text-xs text-slate-500">{curator.handle} • {curator.location}</p>
            <p className="text-xs text-slate-700 max-w-lg mt-2 leading-relaxed">
              {curator.bio}
            </p>
          </div>
        </div>

        {/* Curator Credibility Bar */}
        <div className="grid grid-cols-3 gap-2 mt-6 pt-5 border-t border-slate-100 text-center">
          <div className="p-2 rounded-xl bg-slate-50">
            <span className="block text-lg font-extrabold text-slate-900">
              ⭐ {curator.tasteScore}
            </span>
            <span className="text-[11px] text-slate-500">Taste Score</span>
          </div>
          <div className="p-2 rounded-xl bg-slate-50">
            <span className="block text-lg font-extrabold text-slate-900">
              {curator.totalInfluencedSales}
            </span>
            <span className="text-[11px] text-slate-500">Influenced Buys</span>
          </div>
          <div className="p-2 rounded-xl bg-emerald-50 text-emerald-800">
            <span className="block text-lg font-extrabold text-emerald-700">
              {formatCurrency(curator.walletBalance)}
            </span>
            <span className="text-[11px] text-emerald-600 font-medium">Earned Rewards</span>
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('picks')}
          className={`px-3 py-1.5 text-xs font-bold rounded-xl cursor-pointer transition-colors ${
            activeTab === 'picks'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          My Picks Shelf ({MOCK_PICKS.length})
        </button>
        <button
          onClick={() => setActiveTab('rewards')}
          className={`px-3 py-1.5 text-xs font-bold rounded-xl flex items-center gap-1 cursor-pointer transition-colors ${
            activeTab === 'rewards'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Wallet size={13} /> Reward Wallet
        </button>
      </div>

      {/* My Picks Shelf Content */}
      {activeTab === 'picks' ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500">
              Public curated shelf. Anyone buying through your shelf unlocks rewards.
            </p>
            <Button variant="outline" size="sm" className="text-xs">
              <Plus size={13} /> Add Pick
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {MOCK_PICKS.map((pick) => (
              <Card key={pick.id} className="p-3.5 flex gap-3">
                <img
                  src={pick.image}
                  alt={pick.title}
                  className="w-20 h-20 rounded-xl object-cover bg-slate-100 shrink-0"
                />
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 line-clamp-1">
                      {pick.title}
                    </h4>
                    <p className="text-[11px] text-slate-500 italic mt-0.5 line-clamp-2">
                      "{pick.note}"
                    </p>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-xs">
                    <span className="font-extrabold text-slate-900">
                      {formatCurrency(pick.price)}
                    </span>
                    <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">
                      {pick.influencedBuys} buys
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      ) : (
        /* Reward Wallet Section */
        <Card className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500">Available Balance</span>
              <h3 className="text-2xl font-black text-slate-900 mt-0.5">
                {formatCurrency(curator.walletBalance)}
              </h3>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={() => alert('Withdrawal request initiated (bKash/Nagad batch settlement)')}
            >
              Withdraw to bKash
            </Button>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed border-t border-slate-100 pt-3">
            Earned from completed and verified purchases through your recommendations and drops. Rewards become eligible 7 days after delivery.
          </p>
        </Card>
      )}
    </div>
  )
}
