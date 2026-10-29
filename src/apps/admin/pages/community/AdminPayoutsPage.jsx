import { useEffect, useRef, useState } from 'react'
import { Wallet } from 'lucide-react'
import { Card } from '@/shared/ui/Card'
import { Badge } from '@/shared/ui/Badge'
import { Button } from '@/shared/ui/Button'
import { Input } from '@/shared/ui/Input'
import { Dialog } from '@/shared/ui/Dialog'
import { communityApi } from '@/features/community/api/communityApi'
import { formatCurrency } from '@/shared/lib/formatCurrency'

const dateText = (value) => value && Number.isFinite(new Date(value).getTime()) ? new Date(value).toLocaleString() : '—'
const accountNumber = (payout) => payout.account_details?.account_number ?? payout.account_identifier ?? 'Account unavailable'

export default function AdminPayoutsPage() {
  const [payouts, setPayouts] = useState([])
  const [filter, setFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [meta, setMeta] = useState(null)
  const [reload, setReload] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [selected, setSelected] = useState(null)
  const [action, setAction] = useState('paid')
  const [reference, setReference] = useState('')
  const [notes, setNotes] = useState('')
  const [actionError, setActionError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const requestVersion = useRef(0)
  const busy = useRef(false)

  useEffect(() => {
    const version = ++requestVersion.current
    setLoading(true)
    setError('')
    communityApi.admin.getPayouts({ status: filter, page }).then((response) => {
      if (requestVersion.current !== version) return
      const items = response.payouts ?? response.data
      if (!Array.isArray(items)) throw new Error('Payout requests could not be read. Please retry.')
      setPayouts(items)
      setMeta(response.meta)
    }).catch((err) => { if (requestVersion.current === version) setError(err.message || 'Could not load payout requests.') })
      .finally(() => { if (requestVersion.current === version) setLoading(false) })
    return () => { requestVersion.current += 1 }
  }, [filter, page, reload])

  const openAction = (payout, selectedAction) => {
    if (busy.current) return
    setSelected(payout); setAction(selectedAction); setReference(''); setNotes(''); setActionError('')
  }
  const processPayout = async (event) => {
    event.preventDefault()
    if (!selected || busy.current) return
    if (action === 'paid' && !reference.trim()) { setActionError('Enter the completed transfer reference.'); return }
    if (action === 'rejected' && !notes.trim()) { setActionError('Enter a reason for rejecting this request.'); return }
    const payoutId = selected.id
    busy.current = true
    setSubmitting(true)
    setActionError('')
    try {
      await communityApi.admin.processPayout(payoutId, {
        action, transaction_reference: action === 'paid' ? reference.trim() : undefined,
        notes: notes.trim() || undefined,
      })
      setNotice(action === 'paid' ? 'Payout #' + payoutId + ' recorded as paid.' : 'Payout #' + payoutId + ' rejected. Its reservation has been released; the remaining balance still reflects any reversals.')
      setSelected(null)
      setReload((value) => value + 1)
    } catch (err) { setActionError(err.message || 'The payout update was not confirmed. Retry to check the same request.') }
    finally { busy.current = false; setSubmitting(false) }
  }

  return (
    <div className="space-y-5 pb-12">
      <div className="flex flex-wrap items-start justify-between gap-3"><div><h1 className="text-2xl font-bold text-white">Payout requests</h1><p className="mt-1 text-sm text-slate-400">Review reserved earnings and record completed transfers. This screen does not send money.</p></div><Button variant="secondary" disabled={loading || submitting} onClick={() => setReload((value) => value + 1)}>Refresh</Button></div>
      {notice && <p role="status" className="rounded-xl border border-emerald-500/30 p-3 text-sm text-emerald-300">{notice}</p>}
      <div aria-label="Filter payout requests" className="flex flex-wrap gap-2">
        {['all', 'pending', 'paid', 'rejected', 'cancelled'].map((status) => <Button key={status} variant={filter === status ? 'primary' : 'secondary'} disabled={submitting} aria-pressed={filter === status} onClick={() => { setFilter(status); setPage(1) }} className="capitalize">{status}</Button>)}
      </div>
      {loading ? <p role="status" className="p-8 text-sm text-slate-400">Loading payout requests…</p> : error ? <Card role="alert" className="space-y-3 p-5"><p className="text-sm text-red-300">{error}</p><Button onClick={() => setReload((value) => value + 1)}>Retry payouts</Button></Card> : payouts.length === 0 ? <Card className="space-y-2 p-8 text-center"><Wallet size={30} className="mx-auto text-slate-500" /><h2 className="font-semibold">No payout requests in this view</h2></Card> : <div className="space-y-3">{payouts.map((payout) => {
        const underfunded = payout.can_pay === false || payout.funding_status === 'underfunded' || payout.reconciliation_required
        return <Card key={payout.id} className="space-y-3 p-4 text-sm">
          <div className="flex flex-wrap justify-between gap-2"><h2 className="font-bold">Request #{payout.id} · {formatCurrency(payout.amount)}</h2><Badge>{payout.status}</Badge></div>
          <p className="break-words text-slate-300">{payout.user?.name ?? 'Member'} · {payout.user?.phone ?? 'Phone unavailable'}</p>
          <p className="break-words text-slate-300">{payout.payout_method?.replace(/_/g, ' ')} · {accountNumber(payout)}</p>
          {payout.account_details?.account_name && <p className="text-xs text-slate-400">Account name: {payout.account_details.account_name}</p>}
          <p className="text-xs text-slate-400">Requested {dateText(payout.created_at)}{payout.processed_at ? ' · Processed ' + dateText(payout.processed_at) : ''}</p>
          {payout.transaction_reference && <p className="break-all text-xs">Transfer reference: {payout.transaction_reference}</p>}
          {payout.admin_notes && <p className="break-words text-xs text-slate-400">Review note: {payout.admin_notes}</p>}
          {underfunded && payout.status === 'pending' && <p role="status" className="text-sm text-amber-300">{payout.funding_reason || 'Payment is blocked until this request is fully funded and reconciled.'} Refresh after resolving the balance, or reject the request to release its reservation.</p>}
          {payout.status === 'pending' && <div className="flex flex-wrap gap-2"><Button disabled={submitting || loading || underfunded} onClick={() => openAction(payout, 'paid')}>Record paid</Button><Button variant="danger" disabled={submitting || loading} onClick={() => openAction(payout, 'rejected')}>Reject request</Button></div>}
          {Array.isArray(payout.ledgers) && payout.ledgers.length > 0 && <details className="rounded-xl border border-slate-800 p-3"><summary className="min-h-11 cursor-pointer font-semibold">Reservation activity</summary><div className="space-y-2 text-xs">{payout.ledgers.map((entry) => <p key={entry.id}>Ledger #{entry.id} · {entry.type?.replace(/_/g, ' ')} · {formatCurrency(entry.amount)}{entry.order_item_id ? ' · Order item #' + entry.order_item_id : ''}</p>)}</div></details>}
          {payout.funding_snapshot && <details className="rounded-xl border border-slate-800 p-3"><summary className="min-h-11 cursor-pointer font-semibold">Funding evidence at request and processing</summary><p className="mb-2 text-xs text-slate-400">These snapshots show the account funding basis and eligible earning references. A payout draws from the account balance and is not an allocation of each order item's commission.</p><pre className="whitespace-pre-wrap break-all text-xs text-slate-300">{JSON.stringify(payout.funding_snapshot, null, 2)}</pre></details>}
        </Card>
      })}</div>}
      {!loading && !error && Number(meta?.last_page ?? 1) > 1 && <div className="flex flex-wrap items-center justify-between gap-2"><Button variant="secondary" disabled={page <= 1 || submitting} onClick={() => setPage((value) => value - 1)}>Previous</Button><span className="text-sm text-slate-400">Page {page} of {meta.last_page} · {meta.total} requests</span><Button variant="secondary" disabled={page >= meta.last_page || submitting} onClick={() => setPage((value) => value + 1)}>Next</Button></div>}
      {selected && <Dialog isOpen onClose={() => { if (!busy.current) setSelected(null) }} title={action === 'paid' ? 'Record a completed payout' : 'Reject payout request'} description={action === 'paid' ? 'Only confirm after the external transfer has completed. The server rechecks the reserved balance before recording payment.' : 'Rejection releases this reservation. It does not undo refunded earnings or transfer money.'}>
        <form className="space-y-4" onSubmit={processPayout}>
          <div className="space-y-1 rounded-xl border border-slate-800 p-3 text-sm"><p className="font-bold">Request #{selected.id} · {formatCurrency(selected.amount)}</p><p className="break-words">{selected.user?.name} · {selected.payout_method?.replace(/_/g, ' ')}</p><p className="break-all">{accountNumber(selected)}</p></div>
          {actionError && <p role="alert" className="text-sm text-red-300">{actionError}</p>}
          {action === 'paid' && <label className="block space-y-2 text-sm"><span>Completed transfer reference</span><Input required maxLength={100} disabled={submitting} value={reference} onChange={(event) => setReference(event.target.value)} /></label>}
          <label className="block space-y-2 text-sm"><span>{action === 'rejected' ? 'Rejection reason' : 'Review note (optional)'}</span><Input required={action === 'rejected'} maxLength={500} disabled={submitting} value={notes} onChange={(event) => setNotes(event.target.value)} /></label>
          <div className="flex flex-wrap justify-end gap-2"><Button variant="secondary" disabled={submitting} onClick={() => setSelected(null)}>Cancel</Button><Button type="submit" variant={action === 'rejected' ? 'danger' : 'primary'} disabled={submitting}>{submitting ? 'Recording…' : action === 'paid' ? 'Confirm paid record' : 'Confirm rejection'}</Button></div>
        </form>
      </Dialog>}
    </div>
  )
}
