import { useState } from 'react'
import { Award, DollarSign, Check, Clock, ArrowUpRight, CheckCircle2 } from 'lucide-react'
import { Card } from '@/shared/ui/Card'
import { Badge } from '@/shared/ui/Badge'
import { Button } from '@/shared/ui/Button'
import { Dialog } from '@/shared/ui/Dialog'
import { formatCurrency } from '@/shared/lib/formatCurrency'

const initialPayouts = [
  {
    id: 'PAY-401',
    curator: 'Fahim Ahmed',
    phone: '01712345678',
    channel: 'bKash Personal',
    account: '01712345678',
    amount: 1500,
    requestedAt: 'Oct 07, 2026',
    status: 'Pending',
  },
  {
    id: 'PAY-402',
    curator: 'Nabila Rahman',
    phone: '01911223344',
    channel: 'Nagad Personal',
    account: '01911223344',
    amount: 1200,
    requestedAt: 'Oct 06, 2026',
    status: 'Pending',
  },
  {
    id: 'PAY-399',
    curator: 'Sakib Hasan',
    phone: '01655443322',
    channel: 'bKash Personal',
    account: '01655443322',
    amount: 800,
    requestedAt: 'Oct 04, 2026',
    status: 'Settled',
  },
]

export default function RewardsPage() {
  const [payouts, setPayouts] = useState(initialPayouts)
  const [selectedPayout, setSelectedPayout] = useState(null)

  const approvePayout = (id) => {
    setPayouts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: 'Settled' } : p))
    )
    setSelectedPayout(null)
  }

  const pendingTotal = payouts
    .filter((p) => p.status === 'Pending')
    .reduce((sum, p) => sum + p.amount, 0)

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Award size={18} className="text-orange-500" />
            <span className="text-xs font-bold uppercase tracking-wider text-orange-400">
              Incentives & Curator Economy
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Wallets & Reward Settlements
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-400 max-w-2xl">
            Review Drop kickback balances, verify curator referral earnings, and authorize bKash / Nagad payouts.
          </p>
        </div>

        <Card className="px-4 py-2.5 bg-slate-900 border-slate-800 flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30">
            <DollarSign size={18} />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Pending Batch</p>
            <p className="text-base font-extrabold text-white">{formatCurrency(pendingTotal)}</p>
          </div>
        </Card>
      </div>

      {/* Payouts Table */}
      <Card className="bg-slate-900 border-slate-800 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-left text-xs">
            <thead className="bg-slate-950/60 text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th scope="col" className="px-5 py-3.5">Payout Reference</th>
                <th scope="col" className="px-5 py-3.5">Curator</th>
                <th scope="col" className="px-5 py-3.5">Disbursement Channel</th>
                <th scope="col" className="px-5 py-3.5">Payout Amount</th>
                <th scope="col" className="px-5 py-3.5">Date</th>
                <th scope="col" className="px-5 py-3.5">Status</th>
                <th scope="col" className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {payouts.map((row) => (
                <tr key={row.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="px-5 py-4 font-mono font-bold text-white">
                    {row.id}
                  </td>

                  <td className="px-5 py-4">
                    <p className="font-bold text-white">{row.curator}</p>
                    <p className="text-[11px] text-slate-400 font-mono mt-0.5">{row.phone}</p>
                  </td>

                  <td className="px-5 py-4">
                    <p className="font-medium text-slate-200">{row.channel}</p>
                    <p className="text-[11px] font-mono text-slate-400 mt-0.5">{row.account}</p>
                  </td>

                  <td className="px-5 py-4">
                    <span className="font-extrabold text-white text-sm">
                      {formatCurrency(row.amount)}
                    </span>
                  </td>

                  <td className="px-5 py-4 text-slate-400">
                    {row.requestedAt}
                  </td>

                  <td className="px-5 py-4">
                    <Badge
                      size="sm"
                      variant={row.status === 'Settled' ? 'unlocked' : 'brand'}
                      className={
                        row.status === 'Settled'
                          ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                          : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                      }
                    >
                      {row.status}
                    </Badge>
                  </td>

                  <td className="px-5 py-4 text-right">
                    {row.status === 'Pending' ? (
                      <Button
                        variant="drop-fire"
                        size="xs"
                        onClick={() => setSelectedPayout(row)}
                        className="font-bold"
                      >
                        Authorize
                      </Button>
                    ) : (
                      <span className="text-emerald-400 text-xs font-semibold flex items-center justify-end gap-1">
                        <CheckCircle2 size={13} /> Paid
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Payout Dialog */}
      <Dialog
        isOpen={Boolean(selectedPayout)}
        onClose={() => setSelectedPayout(null)}
        title={`Authorize Payout: ${selectedPayout?.id}`}
        description="Verify MFS transfer details before completing"
      >
        {selectedPayout && (
          <div className="space-y-4 pt-2 text-xs">
            <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Recipient:</span>
                <span className="font-bold text-white">{selectedPayout.curator}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Channel & Number:</span>
                <span className="font-mono font-bold text-orange-400">
                  {selectedPayout.channel} - {selectedPayout.account}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Settlement Amount:</span>
                <span className="font-bold text-emerald-400 text-sm">
                  {formatCurrency(selectedPayout.amount)}
                </span>
              </div>
            </div>

            <div className="pt-2 flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setSelectedPayout(null)}
                className="w-1/3"
              >
                Cancel
              </Button>
              <Button
                variant="drop-fire"
                size="sm"
                className="w-2/3 font-bold gap-1.5"
                onClick={() => approvePayout(selectedPayout.id)}
              >
                <Check size={16} />
                <span>Confirm & Mark as Disbursed</span>
              </Button>
            </div>
          </div>
        )}
      </Dialog>
    </div>
  )
}
