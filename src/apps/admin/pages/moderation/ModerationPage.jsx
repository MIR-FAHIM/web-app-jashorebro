import React from 'react'
import { Card } from '@/shared/ui/Card'
import { Badge } from '@/shared/ui/Badge'
import { Button } from '@/shared/ui/Button'
import { AlertTriangle, ShieldCheck } from 'lucide-react'

export default function ModerationPage() {
  const flags = [
    {
      id: 'FLG-01',
      type: 'Ghost Drops Alert',
      target: 'User @shakil_99',
      details: 'Joined 3 unlocked drops without completing checkout in 24h window.',
      risk: 'Medium',
      action: 'Apply Cooldown',
    },
    {
      id: 'FLG-02',
      type: 'Return Rate Anomaly',
      target: 'Product #821 (Fake Leather Belt)',
      details: 'Curator @style_hub had 28% return rate on this recommendation.',
      risk: 'High',
      action: 'Deduct Taste Score',
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
          Trust, Safety & Moderation
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Detect abuse vectors, phantom drop joins, self-referral rings, and taste score penalties.
        </p>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">Flag Type</th>
                <th className="py-3 px-4">Subject</th>
                <th className="py-3 px-4">Audit Details</th>
                <th className="py-3 px-4">Risk Level</th>
                <th className="py-3 px-4">Resolution</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {flags.map((f) => (
                <tr key={f.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4">
                    <span className="font-bold text-slate-900 flex items-center gap-1.5">
                      <AlertTriangle size={14} className="text-amber-500" /> {f.type}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-bold text-slate-700">{f.target}</td>
                  <td className="py-3 px-4 text-slate-500 max-w-sm">{f.details}</td>
                  <td className="py-3 px-4">
                    <Badge variant={f.risk === 'High' ? 'fire' : 'warning'} size="sm">
                      {f.risk}
                    </Badge>
                  </td>
                  <td className="py-3 px-4">
                    <Button variant="outline" size="sm" className="text-xs">
                      {f.action}
                    </Button>
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
