import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Card } from '@/shared/ui/Card'
import { Button } from '@/shared/ui/Button'
import { communityApi } from '@/features/community/api/communityApi'
import { formatCurrency } from '@/shared/lib/formatCurrency'
import { UI_FEATURES } from '@/shared/config/features'

const money = (value) => value !== null && value !== undefined && Number.isFinite(Number(value)) ? formatCurrency(value) : 'Unavailable'

export default function AdminSettlementReportPage() {
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [reload, setReload] = useState(0)
  const requestVersion = useRef(0)
  useEffect(() => {
    const version = ++requestVersion.current
    setLoading(true)
    setError('')
    communityApi.admin.getSettlementReport().then((response) => {
      if (requestVersion.current !== version) return
      const data = response.report ?? response.data ?? response
      if (!data || typeof data !== 'object' || !Number.isFinite(Number(data.gross_merchandise_value))) throw new Error('Settlement totals could not be verified. Please retry.')
      setReport(data)
    }).catch((err) => { if (requestVersion.current === version) setError(err.message || 'Could not load the settlement report.') })
      .finally(() => { if (requestVersion.current === version) setLoading(false) })
    return () => { requestVersion.current += 1 }
  }, [reload])

  return (
    <div className="space-y-5 pb-12">
      <div className="flex flex-wrap items-start justify-between gap-3"><div><h1 className="text-2xl font-bold text-white">Commission reconciliation</h1><p className="mt-1 text-sm text-slate-400">Order allocations, earnings balances, and payout records.</p></div><Button variant="secondary" disabled={loading} onClick={() => setReload((value) => value + 1)}>Refresh report</Button></div>
      {loading ? <p role="status" className="p-8 text-sm text-slate-400">Checking settlement totals…</p> : error ? <Card role="alert" className="space-y-3 p-5"><p className="text-sm text-red-300">{error}</p><Button onClick={() => setReload((value) => value + 1)}>Retry settlement report</Button></Card> : report && <>
        <Card className="space-y-2 p-4 text-sm text-slate-300"><p>Order allocation totals below include paid, delivered orders. They describe recorded allocations, and do not confirm that suppliers or beneficiaries have received a bank transfer.</p><p className="text-xs text-slate-400">{Number(report.total_orders ?? 0)} eligible orders{report.pending_orders !== undefined ? ' · ' + report.pending_orders + ' orders still pending eligibility' : ''}.</p></Card>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[
            ['Eligible merchandise value', 'gross_merchandise_value', 'Recorded item totals for paid, delivered orders.'],
            ['Supplier allocation', 'total_supplier_allocation', 'Snapshot allocation to suppliers; separate from supplier payments.'],
            ['Platform fee allocation', 'total_platform_fees', 'Recorded fee allocation, excluding delivery fees.'],
            ...(UI_FEATURES.personalStores ? [['Shop earnings allocation', 'total_community_seller_earnings', 'Recorded shop earnings under the purchase snapshot.']] : []),
            ['Recommendation commission allocation', 'total_recommendation_commissions', 'Eligible recommendation commissions before payout.'],
            ['Drop organizer allocation', 'total_drop_commissions', 'Eligible organizer earnings under campaign terms.'],
          ].map(([label, key, detail]) => <Card key={key} className="space-y-2 p-4"><h2 className="text-xs font-semibold text-slate-400">{label}</h2><p className="break-words text-2xl font-bold text-white">{money(report[key])}</p><p className="text-xs text-slate-400">{detail}</p></Card>)}
        </div>
        <h2 className="font-semibold text-white">Earnings and payout balances</h2>
        <p className="text-xs text-slate-400">Current balances cover all beneficiaries. These are separate accounting views; do not add allocation and balance cards together.</p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[
            ['Pending eligibility', 'total_pending_balances'],
            ['Available to request', 'total_available_balances'],
            ['Reserved for payout', 'total_reserved_balances'],
            ['Completed payouts', 'payouts_completed'],
            ['Outstanding recovery', 'total_recovery_balances'],
          ].map(([label, key]) => <Card key={key} className="space-y-2 p-4"><h3 className="text-xs font-semibold text-slate-400">{label}</h3><p className="break-words text-xl font-bold text-white">{money(report[key])}</p></Card>)}
        </div>
        {Number(report.accounts_requiring_reconciliation) > 0 && <p role="alert" className="rounded-xl border border-amber-500/30 p-3 text-sm text-amber-300">{report.accounts_requiring_reconciliation} accounts require reconciliation. Their new payouts remain paused.</p>}
        <Card className="space-y-3 p-4 text-sm">
          <h2 className="font-semibold text-white">Follow a commission</h2>
          <p className="text-slate-300">Open an order to inspect each item's source, beneficiary, commercial snapshot and earnings events. Follow the payout request reference on related reservation or payment events.</p>
          <div className="flex flex-wrap gap-3"><Link to="/admin/orders" className="inline-flex min-h-11 items-center text-brand underline">Inspect orders</Link><Link to="/admin/payouts" className="inline-flex min-h-11 items-center text-brand underline">Review payout requests</Link></div>
        </Card>
        <Card className="space-y-2 p-4 text-sm text-slate-300"><h2 className="font-semibold text-white">Eligibility and recovery</h2><p>Earnings become available only when payment and delivery are both confirmed, with no additional hold. Self-purchases do not earn referral commission. Cancellation and full refunds reverse the related earnings.</p><p>Any reversal after payout becomes recovery against future eligible earnings. Pending payouts cannot be recorded as paid when their reservations are underfunded. Partial refunds require a separate process and are not supported here.</p></Card>
      </>}
    </div>
  )
}
