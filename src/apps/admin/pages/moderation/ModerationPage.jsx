import { useState } from 'react'
import { ShieldAlert, CheckCircle2, XCircle, ArrowUpRight, AlertTriangle } from 'lucide-react'
import { Card } from '@/shared/ui/Card'
import { Badge } from '@/shared/ui/Badge'
import { Button } from '@/shared/ui/Button'
import { Dialog } from '@/shared/ui/Dialog'

const initialFlags = [
  {
    id: 'FLG-108',
    type: 'Suspicious Pricing',
    target: 'Drop #3 - Retro Sneakers',
    reporter: 'Tanvir Hossain',
    reason: 'Base retail price appears marked up before applying drop discount.',
    status: 'Pending',
    date: 'Oct 07, 2026',
  },
  {
    id: 'FLG-107',
    type: 'Spam Shelf Item',
    target: 'Curator Shelf @unknown_shop',
    reporter: 'Nabila Rahman',
    reason: 'Repeatedly adding non-Jashore wholesale items with misleading descriptions.',
    status: 'Pending',
    date: 'Oct 06, 2026',
  },
  {
    id: 'FLG-105',
    type: 'Counterfeit Report',
    target: 'Seller GadgetZone Jashore',
    reporter: 'Fahim Ahmed',
    reason: 'Verified authentic warranty documentation requested and fulfilled.',
    status: 'Resolved',
    date: 'Oct 03, 2026',
  },
]

export default function ModerationPage() {
  const [flags, setFlags] = useState(initialFlags)
  const [selectedFlag, setSelectedFlag] = useState(null)

  const resolveFlag = (id, newStatus) => {
    setFlags((prev) =>
      prev.map((f) => (f.id === id ? { ...f, status: newStatus } : f))
    )
    setSelectedFlag(null)
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShieldAlert size={18} className="text-orange-500" />
            <span className="text-xs font-bold uppercase tracking-wider text-orange-400">
              Trust & Platform Safety
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Moderation & Review Flags
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-400 max-w-2xl">
            Protect community integrity by reviewing reported drops, shelf spam, and merchant authenticity inquiries.
          </p>
        </div>
      </div>

      {/* Flags Table */}
      <Card className="bg-slate-900 border-slate-800 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-left text-xs">
            <thead className="bg-slate-950/60 text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th scope="col" className="px-5 py-3.5">Report ID</th>
                <th scope="col" className="px-5 py-3.5">Flag Type</th>
                <th scope="col" className="px-5 py-3.5">Target Entity</th>
                <th scope="col" className="px-5 py-3.5">Reported By</th>
                <th scope="col" className="px-5 py-3.5">Date</th>
                <th scope="col" className="px-5 py-3.5">Status</th>
                <th scope="col" className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {flags.map((row) => (
                <tr key={row.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="px-5 py-4 font-mono font-bold text-white">
                    {row.id}
                  </td>

                  <td className="px-5 py-4">
                    <span className="font-semibold text-orange-400">{row.type}</span>
                  </td>

                  <td className="px-5 py-4 font-medium text-white max-w-[200px] truncate">
                    {row.target}
                  </td>

                  <td className="px-5 py-4 text-slate-300">
                    {row.reporter}
                  </td>

                  <td className="px-5 py-4 text-slate-400">
                    {row.date}
                  </td>

                  <td className="px-5 py-4">
                    <Badge
                      size="sm"
                      variant={row.status === 'Resolved' ? 'unlocked' : 'brand'}
                      className={
                        row.status === 'Resolved'
                          ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                          : 'bg-red-500/15 text-red-400 border-red-500/30'
                      }
                    >
                      {row.status}
                    </Badge>
                  </td>

                  <td className="px-5 py-4 text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setSelectedFlag(row)}
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

      {/* Flag Details Modal */}
      <Dialog
        isOpen={Boolean(selectedFlag)}
        onClose={() => setSelectedFlag(null)}
        title={`Review Flag: ${selectedFlag?.id}`}
        description="Investigate community report and take administrative action"
      >
        {selectedFlag && (
          <div className="space-y-4 pt-2 text-xs">
            <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Flag Type:</span>
                <span className="font-bold text-orange-400">{selectedFlag.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Target:</span>
                <span className="font-bold text-white">{selectedFlag.target}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Reported By:</span>
                <span className="font-medium text-slate-300">{selectedFlag.reporter}</span>
              </div>
              <div className="pt-2 border-t border-slate-800">
                <span className="text-slate-500">Description / Note:</span>
                <p className="text-slate-300 mt-1 leading-relaxed bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                  {selectedFlag.reason}
                </p>
              </div>
            </div>

            {selectedFlag.status === 'Pending' ? (
              <div className="pt-2 flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-1/2 text-slate-400 border-slate-700 hover:text-white"
                  onClick={() => resolveFlag(selectedFlag.id, 'Dismissed')}
                >
                  <XCircle size={15} />
                  <span>Dismiss Report</span>
                </Button>
                <Button
                  variant="unlocked"
                  size="sm"
                  className="w-1/2 font-bold gap-1 bg-emerald-600 hover:bg-emerald-500 text-white"
                  onClick={() => resolveFlag(selectedFlag.id, 'Resolved')}
                >
                  <CheckCircle2 size={15} />
                  <span>Mark Resolved</span>
                </Button>
              </div>
            ) : (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setSelectedFlag(null)}
                className="w-full"
              >
                Close
              </Button>
            )}
          </div>
        )}
      </Dialog>
    </div>
  )
}
