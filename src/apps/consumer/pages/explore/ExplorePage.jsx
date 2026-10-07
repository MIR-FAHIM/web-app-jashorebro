import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Flame, Tag, Filter } from 'lucide-react'
import { Card } from '@/shared/ui/Card'
import { Badge } from '@/shared/ui/Badge'
import { formatCurrency } from '@/shared/lib/formatCurrency'

const MOCK_EXPLORE_ITEMS = [
  {
    id: 'drop_1',
    title: 'Vintage Oversized Corduroy Hoodie',
    category: 'Streetwear',
    currentPrice: 999,
    retailPrice: 1200,
    participants: 18,
    image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=600&q=80',
    type: 'drop',
  },
  {
    id: 'drop_2',
    title: 'Havit H2002D RGB Gaming Headset',
    category: 'Tech & Gadgets',
    currentPrice: 2099,
    retailPrice: 2600,
    participants: 28,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80',
    type: 'drop',
  },
  {
    id: 'prod_1',
    title: 'Redragon K552 Mechanical Keyboard',
    category: 'Tech & Gadgets',
    currentPrice: 3200,
    retailPrice: 3200,
    participants: 0,
    image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=600&q=80',
    type: 'product',
  },
  {
    id: 'prod_2',
    title: 'Retro High-Top White Canvas Sneakers',
    category: 'Footwear',
    currentPrice: 1650,
    retailPrice: 1650,
    participants: 0,
    image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=600&q=80',
    type: 'product',
  },
]

export default function ExplorePage() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('all') // 'all' | 'drops' | 'products'
  const [searchQuery, setSearchQuery] = useState('')

  const filteredItems = MOCK_EXPLORE_ITEMS.filter((item) => {
    if (activeTab === 'drops' && item.type !== 'drop') return false
    if (activeTab === 'products' && item.type !== 'product') return false
    if (searchQuery && !item.title.toLowerCase().includes(searchQuery.toLowerCase())) return false
    return true
  })

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      {/* Search Header */}
      <div className="relative">
        <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search products, drops, categories..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200/80 rounded-2xl text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]/20 focus:border-[var(--color-brand)] shadow-xs"
        />
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            activeTab === 'all'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          All Items
        </button>
        <button
          onClick={() => setActiveTab('drops')}
          className={`px-3 py-1.5 text-xs font-bold rounded-xl flex items-center gap-1 transition-all cursor-pointer ${
            activeTab === 'drops'
              ? 'bg-orange-600 text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Flame size={14} /> Active Drops
        </button>
        <button
          onClick={() => setActiveTab('products')}
          className={`px-3 py-1.5 text-xs font-bold rounded-xl flex items-center gap-1 transition-all cursor-pointer ${
            activeTab === 'products'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Tag size={14} /> Products (Start Drop)
        </button>
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
        {filteredItems.map((item) => (
          <Card
            key={item.id}
            className="cursor-pointer hover:shadow-md transition-shadow flex flex-col"
            onClick={() =>
              navigate(item.type === 'drop' ? `/drops/${item.id}` : `/products/${item.id}`)
            }
          >
            <div className="relative aspect-square bg-slate-100 overflow-hidden">
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
              {item.type === 'drop' ? (
                <div className="absolute top-2 left-2">
                  <Badge variant="fire" size="sm">
                    🔥 {item.participants} in
                  </Badge>
                </div>
              ) : (
                <div className="absolute top-2 left-2">
                  <Badge variant="default" size="sm">
                    Catalog
                  </Badge>
                </div>
              )}
            </div>

            <div className="p-3 flex-1 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  {item.category}
                </span>
                <h4 className="text-xs md:text-sm font-bold text-slate-900 line-clamp-2 mt-0.5">
                  {item.title}
                </h4>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-100 flex items-baseline justify-between">
                <div>
                  <span className="text-sm md:text-base font-extrabold text-slate-900">
                    {formatCurrency(item.currentPrice)}
                  </span>
                  {item.retailPrice > item.currentPrice && (
                    <span className="text-[10px] text-slate-400 line-through ml-1.5">
                      {formatCurrency(item.retailPrice)}
                    </span>
                  )}
                </div>
                <span className="text-[11px] font-bold text-[var(--color-brand)]">
                  {item.type === 'drop' ? 'Join →' : 'Drop →'}
                </span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
