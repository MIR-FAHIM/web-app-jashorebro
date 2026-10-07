import React from 'react'
import { Card } from '@/shared/ui/Card'
import { Badge } from '@/shared/ui/Badge'
import { Button } from '@/shared/ui/Button'
import { formatCurrency } from '@/shared/lib/formatCurrency'

export default function RewardsPage() {
  const payouts = [
    {
      id: 'PAY-101',
      curator: 'Fahim Ahmed (@fahim_vibes)',
      method: 'bKash (01712345678)',
      amount: 1850,
      influencedOrders: 14,
      status: 'pending_approval',
    },
    {
      id: 'PAY-102',
      curator: 'Nabila Rahman (@nabila_edits)',
      method: 'Nagad (01812345678)',
      amount: 1420,
      influencedOrders: 11,
      status: 'completed',
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
          Curator Rewards & Payout Ledger
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Review attributed sales commissions and disburse mobile financial payouts (bKash / Nagad).
        </p>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">Payout ID</th>
                <th className="py-3 px-4">Curator</th>
                <th className="py-3 px-4">Payout Method</th>
                <th className="py-3 px-4">Attributed Buys</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {payouts.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-slate-900">{p.id}</td>
                  <td className="py-3 px-4 text-slate-800">{p.curator}</td>
                  <td className="py-3 px-4 text-slate-600">{p.method}</td>
                  <td className="py-3 px-4 text-slate-600">{p.influencedOrders} orders</td>
                  <td className="py-3 px-4 font-black text-emerald-700">{formatCurrency(p.amount)}</td>
                  <td className="py-3 px-4">
                    <Badge variant={p.status === 'completed' ? 'unlocked' : 'warning'} size="sm">
                      {p.status === 'completed' ? 'Disbursed' : 'Pending Batch'}
                    </Badge>
                  </td>
                  <td className="py-3 px-4">
                    {p.status === 'pending_approval' ? (
                      <Button variant="primary" size="sm" className="text-xs">
                        Approve & Send
                      </Button>
                    ) : (
                      <span className="text-slate-400 text-[11px]">Settled</span>
                    )}
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
