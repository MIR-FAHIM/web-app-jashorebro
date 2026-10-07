import { useState } from 'react'
import { Users, Search, Sparkles, Shield, UserCheck, ArrowUpRight } from 'lucide-react'
import { Card } from '@/shared/ui/Card'
import { Avatar } from '@/shared/ui/Avatar'
import { Badge } from '@/shared/ui/Badge'
import { Button } from '@/shared/ui/Button'
import { Dialog } from '@/shared/ui/Dialog'
import { formatCurrency } from '@/shared/lib/formatCurrency'

const initialUsers = [
  {
    id: 1,
    name: 'Fahim Ahmed',
    username: 'fahim_vibes',
    phone: '01712345678',
    tasteScore: '4.9',
    ordersCount: 42,
    shelfCount: 16,
    rewardsEarned: 1850,
    role: 'Top Curator',
    badge: 'Trendsetter',
    status: 'active',
  },
  {
    id: 2,
    name: 'Nabila Rahman',
    username: 'nabila_edits',
    phone: '01911223344',
    tasteScore: '4.8',
    ordersCount: 31,
    shelfCount: 12,
    rewardsEarned: 1420,
    role: 'Curator',
    badge: 'Drop Catalyst',
    status: 'active',
  },
  {
    id: 3,
    name: 'Sakib Hasan',
    username: 'sakib_tech',
    phone: '01655443322',
    tasteScore: '4.7',
    ordersCount: 19,
    shelfCount: 8,
    rewardsEarned: 980,
    role: 'Member',
    badge: 'Tech Explorer',
    status: 'active',
  },
  {
    id: 4,
    name: 'Tanvir Hossain',
    username: 'tanvir_h',
    phone: '01898765432',
    tasteScore: '4.6',
    ordersCount: 24,
    shelfCount: 7,
    rewardsEarned: 1100,
    role: 'Member',
    badge: 'Verified Buyer',
    status: 'active',
  },
]

export default function UsersPage() {
  const [users, setUsers] = useState(initialUsers)
  const [query, setQuery] = useState('')
  const [selectedUser, setSelectedUser] = useState(null)

  const filtered = users.filter((u) => {
    const term = query.toLowerCase()
    return (
      u.name.toLowerCase().includes(term) ||
      u.username.toLowerCase().includes(term) ||
      u.phone.includes(term) ||
      u.role.toLowerCase().includes(term)
    )
  })

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Users size={18} className="text-orange-500" />
            <span className="text-xs font-bold uppercase tracking-wider text-orange-400">
              Community & Social Graph
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Users & Curators Directory
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-400 max-w-2xl">
            Inspect community curators, track recommendation attributed orders, and review user taste scores.
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <Card className="p-4 bg-slate-900 border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md">
        <div className="relative w-full sm:max-w-md">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search curator by name, username, phone..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder:text-slate-500 focus:border-brand focus:outline-none"
          />
        </div>
        <div className="text-xs text-slate-400 font-medium">
          {filtered.length} active curators & shoppers
        </div>
      </Card>

      {/* Users Table */}
      <Card className="bg-slate-900 border-slate-800 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-left text-xs">
            <thead className="bg-slate-950/60 text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th scope="col" className="px-5 py-3.5">Member & Handle</th>
                <th scope="col" className="px-5 py-3.5">Taste Score</th>
                <th scope="col" className="px-5 py-3.5">Shelf Items</th>
                <th scope="col" className="px-5 py-3.5">Attributed Orders</th>
                <th scope="col" className="px-5 py-3.5">Rewards Earned</th>
                <th scope="col" className="px-5 py-3.5">Recognition</th>
                <th scope="col" className="px-5 py-3.5 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filtered.map((u) => (
                <tr key={u.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <Avatar name={u.name} size="sm" className="ring-1 ring-slate-700" />
                      <div>
                        <p className="font-bold text-white">{u.name}</p>
                        <p className="text-[11px] text-orange-400 font-mono mt-0.5">@{u.username}</p>
                      </div>
                    </div>
                  </td>

                  <td className="px-5 py-4">
                    <span className="inline-flex items-center gap-1 font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                      <Sparkles size={11} /> {u.tasteScore}
                    </span>
                  </td>

                  <td className="px-5 py-4 font-semibold text-slate-200">
                    {u.shelfCount} picks
                  </td>

                  <td className="px-5 py-4 font-bold text-white">
                    {u.ordersCount} orders
                  </td>

                  <td className="px-5 py-4 font-bold text-orange-400">
                    {formatCurrency(u.rewardsEarned)}
                  </td>

                  <td className="px-5 py-4">
                    <Badge size="sm" variant="unlocked" className="bg-orange-500/15 text-orange-400 border-orange-500/30">
                      {u.badge}
                    </Badge>
                  </td>

                  <td className="px-5 py-4 text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setSelectedUser(u)}
                      className="text-slate-400 hover:text-white hover:bg-slate-800"
                    >
                      <ArrowUpRight size={16} />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* User Dialog */}
      <Dialog
        isOpen={Boolean(selectedUser)}
        onClose={() => setSelectedUser(null)}
        title={selectedUser?.name}
        description="Community member & curator profile details"
      >
        {selectedUser && (
          <div className="space-y-4 pt-2 text-xs">
            <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Username:</span>
                <span className="font-bold text-orange-400">@{selectedUser.username}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Phone:</span>
                <span className="font-mono text-slate-300">{selectedUser.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Role:</span>
                <span className="font-medium text-white">{selectedUser.role}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Lifetime Attributed Orders:</span>
                <span className="font-bold text-white">{selectedUser.ordersCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Total Reward Credits:</span>
                <span className="font-bold text-emerald-400">{formatCurrency(selectedUser.rewardsEarned)}</span>
              </div>
            </div>

            <div className="pt-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setSelectedUser(null)}
                className="w-full"
              >
                Close Preview
              </Button>
            </div>
          </div>
        )}
      </Dialog>
    </div>
  )
}
