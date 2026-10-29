import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Trophy,
  Flame,
  Store,
  Sparkles,
  Crown,
  ArrowRight,
} from 'lucide-react'
import { Card } from '@/shared/ui/Card'
import { Button } from '@/shared/ui/Button'
import { PageHeader } from '@/shared/patterns/PageHeader'
import { communityApi } from '@/features/community/api/communityApi'
import { formatCurrency } from '@/shared/lib/formatCurrency'
import { UI_FEATURES } from '@/shared/config/features'

export default function LeaderboardPage() {
  const [activeTab, setActiveTab] = useState('curators') // 'sellers' | 'curators' | 'organizers'
  const [data, setData] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    setIsLoading(true)

    const fetcher =
      activeTab === 'sellers'
        ? communityApi.leaderboard.getTopSellers()
        : activeTab === 'curators'
        ? communityApi.leaderboard.getTopCurators()
        : communityApi.leaderboard.getTopOrganizers()

    fetcher
      .then((res) => {
        if (!isMounted) return
        setData(res.leaders || res.data || [])
      })
      .catch(() => {
        if (isMounted) setData([])
      })
      .finally(() => {
        if (isMounted) setIsLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [activeTab])

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-16">
      <PageHeader
        title="Community Champions"
        subtitle="Discover product recommenders and community members helping friends find their next pick."
      />

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-3">
        {UI_FEATURES.personalStores && <button
          type="button"
          onClick={() => setActiveTab('sellers')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'sellers'
              ? 'bg-brand text-white shadow-sm'
              : 'bg-slate-900 text-slate-400 hover:text-white'
          }`}
        >
          <Store size={14} />
          <span>Top Community Sellers</span>
        </button>}
        <button
          type="button"
          onClick={() => setActiveTab('curators')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'curators'
              ? 'bg-brand text-white shadow-sm'
              : 'bg-slate-900 text-slate-400 hover:text-white'
          }`}
        >
          <Sparkles size={14} />
          <span>Top Recommenders</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('organizers')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'organizers'
              ? 'bg-brand text-white shadow-sm'
              : 'bg-slate-900 text-slate-400 hover:text-white'
          }`}
        >
          <Flame size={14} />
          <span>Drop Champions</span>
        </button>
      </div>

      {isLoading ? (
        <div className="py-20 text-center text-xs text-slate-400">
          <div className="size-6 mx-auto border-2 border-brand border-t-transparent rounded-full animate-spin mb-2" />
          <span>Calculating verified achievements...</span>
        </div>
      ) : data.length === 0 ? (
        <Card className="p-8 text-center bg-slate-900 border-slate-800 text-white space-y-2">
          <Trophy size={36} className="mx-auto text-slate-600" />
          <h3 className="text-sm font-bold">No entries in this period</h3>
          <p className="text-xs text-slate-400">
            Share helpful product picks and recommendations with your friends.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-2.5">
          {data.map((entry, index) => {
            const rank = index + 1
            const isPodium = rank <= 3

            return (
              <Card
                key={entry.user_id || entry.id || index}
                className={`p-4 bg-slate-900 border-slate-800 text-white flex items-center justify-between gap-4 transition-all ${
                  isPodium ? 'border-orange-500/20 bg-gradient-to-r from-slate-900 to-slate-950' : ''
                }`}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  {/* Rank Badge */}
                  <div
                    className={`size-10 rounded-xl flex items-center justify-center font-black text-sm shrink-0 ${
                      rank === 1
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        : rank === 2
                        ? 'bg-slate-400/20 text-slate-300 border border-slate-400/30'
                        : rank === 3
                        ? 'bg-amber-700/20 text-amber-600 border border-amber-700/30'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {rank === 1 ? <Crown size={18} /> : rank}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-white truncate">
                        {entry.name || entry.user?.name || 'Community Member'}
                      </h4>
                      {UI_FEATURES.personalStores && entry.shop_name && (
                        <span className="text-xs text-brand font-semibold">
                          ({entry.shop_name})
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400">
                      {UI_FEATURES.personalStores && activeTab === 'sellers' && (
                        <span>
                          {entry.sales_count ?? entry.total_orders ?? 0} store sales ·{' '}
                          <strong className="text-emerald-400 font-mono">
                            {formatCurrency(entry.total_earnings || 0)} earned
                          </strong>
                        </span>
                      )}
                      {activeTab === 'curators' && (
                        <span>
                          {entry.referral_count ?? entry.units_sold ?? 0} recommendations ·{' '}
                          <strong className="text-emerald-400 font-mono">
                            {formatCurrency(entry.total_commissions || 0)} profit earned
                          </strong>
                        </span>
                      )}
                      {activeTab === 'organizers' && (
                        <span>
                          {entry.successful_drops ?? 0} successful drops ·{' '}
                          <strong className="text-orange-400 font-mono">
                            {entry.total_buyers_mobilized ?? 0} buyers mobilized
                          </strong>
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                {UI_FEATURES.personalStores && entry.shop_slug && (
                  <Link to={`/shop/${entry.shop_slug}`} className="shrink-0">
                    <Button variant="secondary" size="sm" className="gap-1 text-xs border-slate-700 bg-slate-800">
                      <span>Visit Store</span>
                      <ArrowRight size={13} />
                    </Button>
                  </Link>
                )}
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
