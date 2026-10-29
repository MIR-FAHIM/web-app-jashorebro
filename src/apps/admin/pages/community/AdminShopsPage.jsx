import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Store,
  ShieldCheck,
  ShieldAlert,
  Search,
  ExternalLink,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  Eye,
} from 'lucide-react'
import { Card } from '@/shared/ui/Card'
import { Badge } from '@/shared/ui/Badge'
import { Button } from '@/shared/ui/Button'
import { PageHeader } from '@/shared/patterns/PageHeader'
import { communityApi } from '@/features/community/api/communityApi'

export default function AdminShopsPage() {
  const [shops, setShops] = useState([])
  const [query, setQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [actionNotice, setActionNotice] = useState('')
  const [processingId, setProcessingId] = useState(null)

  const loadShops = () => {
    setIsLoading(true)
    communityApi.admin.getShops({ q: query })
      .then((res) => {
        setShops(res.shops || res.data || [])
      })
      .catch(() => {})
      .finally(() => {
        setIsLoading(false)
      })
  }

  useEffect(() => {
    loadShops()
  }, [query])

  const handleUpdateStatus = async (shop, newStatus) => {
    if (!window.confirm(`Are you sure you want to mark '${shop.name}' as ${newStatus}?`)) return

    setProcessingId(shop.id)
    setActionNotice('')

    try {
      await communityApi.admin.updateShopStatus(shop.id, newStatus)
      setShops((prev) =>
        prev.map((s) => (s.id === shop.id ? { ...s, status: newStatus } : s))
      )
      setActionNotice(`Store '${shop.name}' status updated to ${newStatus}.`)
      setTimeout(() => setActionNotice(''), 3000)
    } catch (err) {
      alert(err.message || 'Failed to update shop status.')
    } finally {
      setProcessingId(null)
    }
  }

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Community Stores Moderation</h1>
          <p className="text-xs text-slate-400 mt-1">
            Oversee user storefronts, review catalog curation, and manage suspension status.
          </p>
        </div>
      </div>

      {actionNotice && (
        <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Filter Bar */}
      <Card className="p-4 bg-slate-900 border-slate-800 text-white flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search stores by name, slug, or owner..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-800 bg-slate-950 py-2 pl-9 pr-4 text-xs text-white placeholder-slate-500 focus:border-brand focus:outline-none"
          />
        </div>
        <span className="text-xs text-slate-400 font-semibold">{shops.length} total stores</span>
      </Card>

      {/* Stores Table */}
      {isLoading ? (
        <div className="py-20 text-center text-xs text-slate-400">
          <div className="size-6 mx-auto border-2 border-brand border-t-transparent rounded-full animate-spin mb-2" />
          <span>Loading community stores...</span>
        </div>
      ) : shops.length === 0 ? (
        <Card className="p-8 text-center bg-slate-900 border-slate-800 text-white space-y-2">
          <Store size={36} className="mx-auto text-slate-600" />
          <h3 className="text-sm font-bold">No community stores found</h3>
          <p className="text-xs text-slate-400">Stores created by community sellers will appear here.</p>
        </Card>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="border-b border-slate-800 bg-slate-950 text-slate-400 font-bold">
              <tr>
                <th className="p-3">Store Name</th>
                <th className="p-3">Owner Details</th>
                <th className="p-3">Listings</th>
                <th className="p-3">Status</th>
                <th className="p-3">Created</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {shops.map((s) => (
                <tr key={s.id} className="hover:bg-slate-800/40">
                  <td className="p-3">
                    <div className="font-bold text-white flex items-center gap-1.5">
                      <span>{s.name}</span>
                      <Link to={`/shop/${s.slug}`} target="_blank" className="text-brand hover:underline">
                        <ExternalLink size={12} />
                      </Link>
                    </div>
                    <span className="text-[11px] font-mono text-slate-400">/shop/{s.slug}</span>
                  </td>
                  <td className="p-3">
                    <p className="font-semibold text-white">{s.owner?.name || 'Seller'}</p>
                    <p className="text-[11px] font-mono text-slate-400">{s.owner?.phone || s.owner?.email || '-'}</p>
                  </td>
                  <td className="p-3 font-semibold text-white">
                    {s.listings_count ?? s.listings?.length ?? 0} items
                  </td>
                  <td className="p-3">
                    <Badge
                      variant={s.status === 'active' ? 'unlocked' : 'destructive'}
                      className="text-[10px]"
                    >
                      {s.status}
                    </Badge>
                  </td>
                  <td className="p-3 text-slate-400">
                    {new Date(s.created_at).toLocaleDateString()}
                  </td>
                  <td className="p-3 text-right space-x-2">
                    {s.status === 'active' ? (
                      <Button
                        type="button"
                        variant="danger"
                        size="sm"
                        disabled={processingId === s.id}
                        onClick={() => handleUpdateStatus(s, 'suspended')}
                        className="text-xs py-1"
                      >
                        Suspend
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        variant="primary"
                        size="sm"
                        disabled={processingId === s.id}
                        onClick={() => handleUpdateStatus(s, 'active')}
                        className="text-xs py-1"
                      >
                        Activate
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
