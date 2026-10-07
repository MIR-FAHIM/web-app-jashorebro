import React, { useState } from 'react'
import { Link } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Sparkles, Users, TrendingUp, Share2 } from 'lucide-react'
import { Card } from '@/shared/ui/Card'
import { Badge } from '@/shared/ui/Badge'
import { Avatar } from '@/shared/ui/Avatar'
import { DropProgress } from '@/features/drops/components/DropProgress'
import { ImInButton } from '@/features/drops/components/ImInButton'
import { Sheet } from '@/shared/ui/Sheet'
import { Button } from '@/shared/ui/Button'

// Mock seed data for initial structural verification
const MOCK_FEED_ITEMS = [
  {
    id: 'drop_1',
    type: 'drop',
    curator: {
      name: 'Fahim Ahmed',
      handle: 'fahim_vibes',
      avatar: '',
      tasteScore: '4.9',
    },
    actionText: 'started a Drop for winter tour',
    product: {
      title: 'Vintage Oversized Corduroy Hoodie',
      category: 'Streetwear',
      retailPrice: 1200,
      image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=600&q=80',
    },
    tiers: [
      { requiredParticipants: 1, price: 1200 },
      { requiredParticipants: 10, price: 1099 },
      { requiredParticipants: 25, price: 999 },
      { requiredParticipants: 50, price: 899 },
      { requiredParticipants: 100, price: 799 },
    ],
    currentParticipants: 18,
    isJoined: false,
  },
  {
    id: 'drop_2',
    type: 'drop',
    curator: {
      name: 'Nabila Rahman',
      handle: 'nabila_edits',
      avatar: '',
      tasteScore: '4.8',
    },
    actionText: 'recommended this for gaming setups',
    product: {
      title: 'Havit H2002D RGB Gaming Headset',
      category: 'Tech & Gadgets',
      retailPrice: 2600,
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80',
    },
    tiers: [
      { requiredParticipants: 1, price: 2600 },
      { requiredParticipants: 15, price: 2350 },
      { requiredParticipants: 30, price: 2099 },
    ],
    currentParticipants: 28,
    isJoined: true,
  },
]

export default function HomePage() {
  const navigate = useNavigate()
  const [feedItems, setFeedItems] = useState(MOCK_FEED_ITEMS)
  const [activeShareDrop, setActiveShareDrop] = useState(null)

  const toggleJoin = (dropId) => {
    setFeedItems((prev) =>
      prev.map((item) => {
        if (item.id === dropId) {
          const nextJoined = !item.isJoined
          return {
            ...item,
            isJoined: nextJoined,
            currentParticipants: nextJoined
              ? item.currentParticipants + 1
              : item.currentParticipants - 1,
          }
        }
        return item
      })
    )
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4">
      {/* Community announcement banner */}
      <div className="bg-gradient-to-r from-orange-500 via-amber-500 to-red-500 p-4 rounded-2xl text-white shadow-sm flex items-center justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider bg-black/20 px-2 py-0.5 rounded-full mb-1">
            <Sparkles size={11} /> Jashore Bro Active Rally
          </span>
          <h2 className="text-base font-extrabold leading-tight">
            Buy together. Pay less.
          </h2>
          <p className="text-xs text-orange-100 mt-0.5">
            Tap 🔥 I'm In on drops to unlock cheaper group prices.
          </p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          className="bg-white text-slate-900 font-bold shrink-0 hover:bg-orange-50"
          onClick={() => navigate('/explore')}
        >
          Explore All
        </Button>
      </div>

      {/* Feed Filters */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
        <button className="px-3.5 py-1.5 rounded-full bg-slate-900 text-white font-semibold whitespace-nowrap cursor-pointer">
          🔥 Trending Drops
        </button>
        <button className="px-3.5 py-1.5 rounded-full bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 font-medium whitespace-nowrap cursor-pointer">
          Following
        </button>
        <button className="px-3.5 py-1.5 rounded-full bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 font-medium whitespace-nowrap cursor-pointer">
          JUST Campus Picks
        </button>
        <button className="px-3.5 py-1.5 rounded-full bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 font-medium whitespace-nowrap cursor-pointer">
          Streetwear
        </button>
      </div>

      {/* Drop Cards List */}
      <div className="space-y-4">
        {feedItems.map((item) => (
          <Card key={item.id} className="hover:shadow-md transition-shadow">
            {/* Curator Social Signal Header */}
            <div className="p-3.5 flex items-center justify-between border-b border-slate-100 bg-slate-50/50">
              <div
                className="flex items-center gap-2.5 cursor-pointer"
                onClick={() => navigate('/profile')}
              >
                <Avatar name={item.curator.name} size="sm" />
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-900">
                      {item.curator.name}
                    </span>
                    <Badge variant="brand" size="sm">
                      ★ {item.curator.tasteScore}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    {item.actionText}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setActiveShareDrop(item)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                title="Share Drop"
              >
                <Share2 size={16} />
              </button>
            </div>

            {/* Product & Progressive Tier Body */}
            <div className="p-4 space-y-4">
              <div
                className="flex gap-3.5 cursor-pointer"
                onClick={() => navigate(`/drops/${item.id}`)}
              >
                <img
                  src={item.product.image}
                  alt={item.product.title}
                  className="w-24 h-24 rounded-xl object-cover bg-slate-100 shrink-0 border border-slate-100"
                />
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    {item.product.category}
                  </span>
                  <h3 className="text-sm font-bold text-slate-900 leading-snug line-clamp-2 mt-0.5">
                    {item.product.title}
                  </h3>
                  <div className="mt-2">
                    <Badge variant="fire" size="sm">
                      <TrendingUp size={11} /> 12 joined in last 24h
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Progressive Pricing Ladder */}
              <div className="pt-2 border-t border-slate-100">
                <DropProgress
                  tiers={item.tiers}
                  currentParticipants={item.currentParticipants}
                  retailPrice={item.product.retailPrice}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-1">
                <div className="flex-1">
                  <ImInButton
                    isJoined={item.isJoined}
                    onToggleJoin={() => toggleJoin(item.id)}
                    size="md"
                  />
                </div>
                <Button
                  variant="outline"
                  size="md"
                  onClick={() => navigate(`/drops/${item.id}`)}
                  className="text-xs"
                >
                  View Details
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Share Bottom Sheet for mobile / dialog for desktop */}
      <Sheet
        isOpen={Boolean(activeShareDrop)}
        onClose={() => setActiveShareDrop(null)}
        title="Rally the Bros to Unlock Better Price"
      >
        {activeShareDrop && (
          <div className="space-y-4">
            <p className="text-xs text-slate-600">
              Share "{activeShareDrop.product.title}" with your circle. Every friend who hits 🔥 I'm In lowers the price for everyone!
            </p>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                className="w-full text-xs"
                onClick={() => {
                  navigator.clipboard.writeText(window.location.origin + `/drops/${activeShareDrop.id}`)
                  alert('Drop link copied!')
                  setActiveShareDrop(null)
                }}
              >
                📋 Copy Link
              </Button>
              <Button
                variant="primary"
                className="w-full text-xs bg-emerald-600 hover:bg-emerald-700"
                onClick={() => {
                  window.open(
                    `https://api.whatsapp.com/send?text=${encodeURIComponent(
                      `Bro! Join this drop on JashoreBro to unlock cheaper price on ${activeShareDrop.product.title}: ${window.location.origin}/drops/${activeShareDrop.id}`
                    )}`
                  )
                  setActiveShareDrop(null)
                }}
              >
                💬 WhatsApp
              </Button>
            </div>
          </div>
        )}
      </Sheet>
    </div>
  )
}
