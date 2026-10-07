import React from 'react'
import { Card } from '@/shared/ui/Card'
import { Badge } from '@/shared/ui/Badge'
import { Button } from '@/shared/ui/Button'
import { Plus } from 'lucide-react'

export default function SellersPage() {
  const sellers = [
    {
      id: 's1',
      name: 'GadgetZone Jashore',
      contact: '01912345678',
      activeDrops: 4,
      settlementCycle: 'Weekly Batch',
      status: 'verified',
    },
    {
      id: 's2',
      name: 'TrendFabric BD',
      contact: '01812345678',
      activeDrops: 2,
      settlementCycle: 'Weekly Batch',
      status: 'verified',
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
            Merchants & Brand Partners
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage vetted sellers providing products for community drops.
          </p>
        </div>
        <Button variant="primary" size="sm">
          <Plus size={16} /> Register Seller
        </Button>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">Merchant Name</th>
                <th className="py-3 px-4">Contact Phone</th>
                <th className="py-3 px-4">Active Drops</th>
                <th className="py-3 px-4">Settlement Cycle</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {sellers.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4 font-bold text-slate-900">{s.name}</td>
                  <td className="py-3 px-4 text-slate-600">{s.contact}</td>
                  <td className="py-3 px-4 text-slate-900 font-bold">{s.activeDrops} drops</td>
                  <td className="py-3 px-4 text-slate-500">{s.settlementCycle}</td>
                  <td className="py-3 px-4">
                    <Badge variant="unlocked" size="sm">
                      {s.status}
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
