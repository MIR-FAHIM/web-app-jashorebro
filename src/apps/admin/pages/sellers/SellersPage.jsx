import { useState, useEffect } from 'react'
import { Store, Search, ShieldCheck, Phone, MapPin, Check, X, ArrowUpRight } from 'lucide-react'
import { Card } from '@/shared/ui/Card'
import { Badge } from '@/shared/ui/Badge'
import { Button } from '@/shared/ui/Button'
import { Dialog } from '@/shared/ui/Dialog'
import { catalogApi } from '@/features/catalog/api/catalogApi'

const fallbackSellers = [
  {
    id: 1,
    store_name: 'GadgetZone Jashore',
    owner: 'Kamrul Hasan',
    phone: '01912345678',
    upazila: 'Kotwali, Jashore Sadar',
    district: 'Jashore',
    status: 'active',
    products_count: 8,
    rating_avg: '4.8',
  },
  {
    id: 2,
    store_name: 'TrendFabric BD',
    owner: 'Arif Chowdhury',
    phone: '01812345678',
    upazila: 'Doratana Moor, Kotwali',
    district: 'Jashore',
    status: 'active',
    products_count: 5,
    rating_avg: '4.9',
  },
  {
    id: 3,
    store_name: 'Artisan Hub Jashore',
    owner: 'Md. Shahidul Islam',
    phone: '01711223344',
    upazila: 'Benapole Port Area',
    district: 'Jashore',
    status: 'active',
    products_count: 4,
    rating_avg: '4.7',
  },
  {
    id: 4,
    store_name: 'Keshabpur Clay & Pottery',
    owner: 'Subrata Pal',
    phone: '01799887766',
    upazila: 'Keshabpur',
    district: 'Jashore',
    status: 'pending',
    products_count: 2,
    rating_avg: '5.0',
  },
]

export default function SellersPage() {
  const [sellers, setSellers] = useState(fallbackSellers)
  const [query, setQuery] = useState('')
  const [activeTab, setActiveTab] = useState('All')
  const [selectedSeller, setSelectedSeller] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    async function loadSellers() {
      setIsLoading(true)
      try {
        const res = await catalogApi.getSellers()
        if (res && res.data && res.data.length > 0) {
          setSellers(res.data)
        }
      } catch {
        // fallback
      } finally {
        setIsLoading(false)
      }
    }
    loadSellers()
  }, [])

  const filtered = sellers.filter((s) => {
    const matchesTab =
      activeTab === 'All' ||
      (activeTab === 'Verified' && s.status === 'active') ||
      (activeTab === 'Pending' && s.status === 'pending')

    const term = query.toLowerCase()
    const matchesQuery =
      s.store_name?.toLowerCase().includes(term) ||
      s.upazila?.toLowerCase().includes(term) ||
      s.phone?.includes(term)

    return matchesTab && matchesQuery
  })

  const updateStatus = (id, newStatus) => {
    setSellers((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: newStatus } : s))
    )
    if (selectedSeller && selectedSeller.id === id) {
      setSelectedSeller((prev) => ({ ...prev, status: newStatus }))
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Store size={18} className="text-orange-500" />
            <span className="text-xs font-bold uppercase tracking-wider text-orange-400">
              Ecosystem & Merchants
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Jashore Producers & Merchants
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-400 max-w-2xl">
            Authorize local workshops, textile vendors, and tech retailers powering the JashoreBro ecosystem.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          {['All', 'Verified', 'Pending'].map((tab) => (
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

        <div className="relative w-full sm:max-w-xs">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search producer, upazila, phone..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder:text-slate-500 focus:border-brand focus:outline-none"
          />
        </div>
      </div>

      {/* Producers Table */}
      <Card className="bg-slate-900 border-slate-800 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-left text-xs">
            <thead className="bg-slate-950/60 text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th scope="col" className="px-5 py-3.5">Producer Store</th>
                <th scope="col" className="px-5 py-3.5">Upazila / Hub</th>
                <th scope="col" className="px-5 py-3.5">Phone Contact</th>
                <th scope="col" className="px-5 py-3.5">Products</th>
                <th scope="col" className="px-5 py-3.5">Status</th>
                <th scope="col" className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filtered.map((s) => (
                <tr key={s.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="px-5 py-4">
                    <p className="font-bold text-white">{s.store_name}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">{s.owner || 'Verified Vendor'}</p>
                  </td>

                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1.5 text-slate-300">
                      <MapPin size={13} className="text-orange-400 shrink-0" />
                      <span>{s.upazila || 'Jashore'}</span>
                    </div>
                  </td>

                  <td className="px-5 py-4 font-mono text-slate-300">
                    {s.phone}
                  </td>

                  <td className="px-5 py-4">
                    <span className="font-bold text-white">{s.products_count ?? 1}</span>
                    <span className="text-[10px] text-slate-500 ml-1">listed</span>
                  </td>

                  <td className="px-5 py-4">
                    <Badge
                      size="sm"
                      variant={s.status === 'active' ? 'unlocked' : 'brand'}
                      className={
                        s.status === 'active'
                          ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                          : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                      }
                    >
                      {s.status === 'active' ? 'Verified' : 'Pending Review'}
                    </Badge>
                  </td>

                  <td className="px-5 py-4 text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setSelectedSeller(s)}
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

      {/* Seller Verification Dialog */}
      <Dialog
        isOpen={Boolean(selectedSeller)}
        onClose={() => setSelectedSeller(null)}
        title={selectedSeller?.store_name}
        description="Producer verification and store status"
      >
        {selectedSeller && (
          <div className="space-y-4 pt-2 text-xs">
            <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Business:</span>
                <span className="font-bold text-white">{selectedSeller.store_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Contact:</span>
                <span className="font-medium text-slate-300">{selectedSeller.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Location:</span>
                <span className="font-medium text-slate-300">{selectedSeller.upazila}, Jashore</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Status:</span>
                <span className="font-bold text-orange-400">{selectedSeller.status}</span>
              </div>
            </div>

            <div className="pt-2 flex gap-2">
              {selectedSeller.status !== 'active' ? (
                <Button
                  variant="unlocked"
                  size="sm"
                  className="w-full font-bold gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white"
                  onClick={() => updateStatus(selectedSeller.id, 'active')}
                >
                  <Check size={16} />
                  <span>Approve & Verify Merchant</span>
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full font-bold gap-1.5 text-red-400 border-red-500/30 hover:bg-red-500/10"
                  onClick={() => updateStatus(selectedSeller.id, 'suspended')}
                >
                  <X size={16} />
                  <span>Suspend Store Account</span>
                </Button>
              )}
            </div>
          </div>
        )}
      </Dialog>
    </div>
  )
}
