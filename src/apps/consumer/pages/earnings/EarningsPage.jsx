import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Wallet, ArrowUpRight, Receipt } from 'lucide-react'
import { Card } from '@/shared/ui/Card'
import { Badge } from '@/shared/ui/Badge'
import { Button } from '@/shared/ui/Button'
import { Input } from '@/shared/ui/Input'
import { Dialog } from '@/shared/ui/Dialog'
import { PageHeader } from '@/shared/patterns/PageHeader'
import { communityApi } from '@/features/community/api/communityApi'
import { useAuth } from '@/features/auth/model/authContext'
import { formatCurrency } from '@/shared/lib/formatCurrency'

const eventLabels = {
  credit_pending: 'Earning recorded', release_available: 'Earning released',
  reversal: 'Earning reversed', payout_reserved: 'Payout reserved',
  payout_paid: 'Payout paid', payout_rejected: 'Payout reservation released',
}
const dateText = (value) => value && Number.isFinite(new Date(value).getTime())
  ? new Date(value).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : '—'
const list = (response, name) => {
  const items = response?.[name] ?? response?.data
  if (!Array.isArray(items)) throw new Error('The earnings response could not be read. Please retry.')
  return items
}
const emptyForm = { amount: '', payout_method: 'bkash', account_number: '' }
const attemptStorageKey = (accountKey) => 'jb_payout_attempt_v1:' + accountKey

async function getPayoutAttempt(accountKey, payload, previous) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(JSON.stringify([accountKey, payload])))
  const fingerprint = Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('')
  let stored
  try { stored = JSON.parse(sessionStorage.getItem(attemptStorageKey(accountKey)) || 'null') } catch { /* Storage may be unavailable. */ }
  const candidate = previous?.fingerprint === fingerprint ? previous : stored?.fingerprint === fingerprint && typeof stored.key === 'string' ? stored : null
  const attempt = candidate ?? { fingerprint, key: crypto.randomUUID() }
  try { sessionStorage.setItem(attemptStorageKey(accountKey), JSON.stringify(attempt)) } catch { /* The in-memory key still protects retries. */ }
  return attempt
}

export default function EarningsPage() {
  const { isAuthenticated, isLoading: authLoading, user } = useAuth()
  const location = useLocation()
  const accountKey = isAuthenticated ? String(user?.id ?? '') : ''
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [reload, setReload] = useState(0)
  const [page, setPage] = useState(1)
  const [moreBusy, setMoreBusy] = useState(false)
  const [moreError, setMoreError] = useState('')
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [submitting, setSubmitting] = useState(false)
  const [payoutError, setPayoutError] = useState('')
  const [notice, setNotice] = useState('')
  const requestVersion = useRef(0)
  const payoutAttempt = useRef(null)
  const actionBusy = useRef(false)
  const currentAccount = useRef(accountKey)
  currentAccount.current = accountKey

  useEffect(() => { setNotice(''); payoutAttempt.current = null }, [accountKey])

  useEffect(() => {
    const version = ++requestVersion.current
    setModal(false)
    setPayoutError('')
    setPage(1)
    setMoreError('')
    if (!accountKey || authLoading) { setData(null); setLoading(authLoading); return }
    setLoading(true)
    setError('')
    Promise.all([
      communityApi.earnings.getBalance(), communityApi.earnings.getLedger(1),
      communityApi.earnings.getPayoutHistory(),
    ]).then(([balanceResponse, ledgerResponse, payoutResponse]) => {
      if (version !== requestVersion.current) return
      const balances = balanceResponse.balances ?? balanceResponse.data ?? balanceResponse
      for (const key of ['pending', 'available', 'reserved_for_payout', 'paid']) {
        if (!Number.isFinite(Number(balances[key]))) throw new Error('Balances could not be verified. Please retry.')
      }
      setData({ accountKey, balances, ledger: list(ledgerResponse, 'entries'), payouts: list(payoutResponse, 'payouts'), meta: ledgerResponse.meta })
    }).catch((err) => { if (version === requestVersion.current) setError(err.message || 'Could not load earnings.') })
      .finally(() => { if (version === requestVersion.current) setLoading(false) })
    return () => { requestVersion.current += 1 }
  }, [accountKey, authLoading, reload])

  const current = data?.accountKey === accountKey ? data : null
  const balances = current?.balances
  const minimum = Number(balances?.minimum_payout ?? 50)
  const available = Number(balances?.available ?? 0)
  const recovery = Number(balances?.outstanding_recovery ?? 0)
  const ready = Boolean(current && !loading && !error)

  const loadMore = async () => {
    if (moreBusy || !ready) return
    const version = requestVersion.current
    setMoreBusy(true)
    setMoreError('')
    try {
      const response = await communityApi.earnings.getLedger(page + 1)
      const entries = list(response, 'entries')
      if (version !== requestVersion.current) return
      setData((previous) => ({ ...previous, ledger: [...previous.ledger, ...entries.filter((entry) => !previous.ledger.some((old) => old.id === entry.id))], meta: response.meta }))
      setPage((value) => value + 1)
    } catch (err) { if (version === requestVersion.current) setMoreError(err.message || 'Could not load more entries.') }
    finally { setMoreBusy(false) }
  }

  const requestPayout = async (event) => {
    event.preventDefault()
    if (actionBusy.current || !ready) return
    const amount = Number(form.amount)
    if (!Number.isFinite(amount) || amount < minimum || Math.abs(Math.round(amount * 100) - amount * 100) > 0.000001) {
      setPayoutError('Enter at least ' + formatCurrency(minimum) + ', with up to two decimal places.'); return
    }
    if (amount > available) { setPayoutError('The amount exceeds your verified available balance.'); return }
    if (!form.account_number.trim()) { setPayoutError('Enter the destination account number.'); return }
    const payload = { amount, payout_method: form.payout_method, account_number: form.account_number.trim() }
    const submittedAccount = accountKey
    actionBusy.current = true
    setSubmitting(true)
    setPayoutError('')
    try {
      payoutAttempt.current = await getPayoutAttempt(accountKey, payload, payoutAttempt.current)
      if (currentAccount.current !== submittedAccount) return
      const response = await communityApi.earnings.requestPayout({ ...payload, idempotency_key: payoutAttempt.current.key })
      if (currentAccount.current !== submittedAccount) return
      const payout = response.payout ?? response.data ?? response
      setNotice('Payout request' + (payout.id ? ' #' + payout.id : '') + ' received for review. This does not confirm a transfer.')
      payoutAttempt.current = null
      try { sessionStorage.removeItem(attemptStorageKey(accountKey)) } catch { /* Optional retry storage. */ }
      setForm(emptyForm)
      setModal(false)
      setReload((value) => value + 1)
    } catch (err) {
      if (currentAccount.current === submittedAccount) setPayoutError(err.message || 'The request was not confirmed. Retry the same details to check it safely.')
    } finally { actionBusy.current = false; setSubmitting(false) }
  }

  if (authLoading) return <p role="status" className="p-8 text-sm text-slate-400">Loading your account…</p>
  if (!isAuthenticated) return (
    <Card className="mx-auto mt-10 max-w-md space-y-4 p-6 text-center">
      <Wallet size={36} className="mx-auto text-brand" />
      <h1 className="text-xl font-bold">Earnings & Payouts</h1>
      <p className="text-sm text-slate-400">Sign in to view your earnings and payout requests.</p>
      <Link to="/auth" state={{ from: location }} className="inline-block"><Button>Sign in to continue</Button></Link>
    </Card>
  )

  return (
    <div className="mx-auto max-w-5xl space-y-5 pb-16">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <PageHeader title="Earnings & Payouts" subtitle="Follow eligible earnings, reversals, and withdrawal requests." />
        <Button disabled={!ready || available < minimum || recovery > 0 || balances?.reconciliation_required} onClick={() => {
          setPayoutError(''); setForm({ ...emptyForm, amount: available.toFixed(2) }); setModal(true)
        }}><ArrowUpRight size={16} />Request payout</Button>
      </div>
      {notice && <p role="status" className="rounded-xl border border-emerald-500/30 bg-emerald-950/40 p-3 text-sm text-emerald-300">{notice}</p>}
      {loading && <p role="status" className="rounded-xl border border-slate-800 p-5 text-sm text-slate-400">Checking balances and history…</p>}
      {error && <Card role="alert" className="space-y-3 p-5"><p className="text-sm text-red-300">{error}</p><Button onClick={() => setReload((value) => value + 1)}>Retry earnings</Button></Card>}
      {ready && <>
        <div className="grid grid-cols-1 gap-3 min-[360px]:grid-cols-2 lg:grid-cols-4">
          {[
            ['Available', balances.available, 'Available to request; minimum ' + formatCurrency(minimum) + '.'],
            ['Pending eligibility', balances.pending, 'Released after both payment and delivery are confirmed.'],
            ['Reserved for payout', balances.reserved_for_payout, 'Held for pending payout requests; not yet transferred.'],
            ['Paid out', balances.paid, 'Payouts recorded as completed by an administrator.'],
          ].map(([label, amount, detail]) => <Card key={label} className="space-y-2 p-4"><h2 className="text-xs font-semibold text-slate-400">{label}</h2><p className="break-words text-2xl font-bold text-white">{formatCurrency(amount)}</p><p className="text-xs text-slate-400">{detail}</p></Card>)}
        </div>
        {recovery > 0 && <Card role="status" className="space-y-1 border-amber-500/30 p-4"><h2 className="font-semibold text-amber-300">Recovery outstanding: {formatCurrency(recovery)}</h2><p className="text-sm text-slate-300">Reversed earnings exceed the remaining balance. Future eligible earnings offset this amount before another payout is available.</p></Card>}
        {balances.reconciliation_required && <Card role="alert" className="p-4 text-sm text-amber-300">Your balance needs administrative reconciliation. New payout requests are paused while these records are reviewed.</Card>}
        {Number(balances.reserved_for_payout) > 0 && Number(balances.payout_shortfall) > 0 && <Card role="status" className="p-4 text-sm text-amber-300">A pending payout is no longer fully funded after an earnings adjustment. Payment is paused until an administrator reviews or rejects the request.</Card>}
        <p className="text-xs leading-relaxed text-slate-400">Only eligible attributed purchases earn rewards. Payment and delivery must both be confirmed; there is no additional hold. Cancellation or a full refund reverses the related earnings. Partial refunds are not supported in this flow.</p>
        <section className="space-y-3" aria-labelledby="payout-history-title">
          <h2 id="payout-history-title" className="font-semibold">Payout requests ({current.payouts.length})</h2>
          {current.payouts.length === 0 ? <Card className="p-5 text-sm text-slate-400">No payout requests yet.</Card> : current.payouts.map((payout) => <Card key={payout.id} className="space-y-2 p-4 text-sm">
            <div className="flex flex-wrap justify-between gap-2"><strong>Request #{payout.id} · {formatCurrency(payout.amount)}</strong><Badge>{payout.status}</Badge></div>
            <p className="break-words text-slate-300">{payout.payout_method?.replace(/_/g, ' ')} · {payout.account_details?.account_number ?? payout.account_identifier ?? 'Account unavailable'}</p>
            <p className="text-xs text-slate-400">Requested {dateText(payout.created_at)}</p>
            {payout.transaction_reference && <p className="break-all text-xs">Transfer reference: {payout.transaction_reference}</p>}
            {payout.admin_notes && <p className="break-words text-xs text-slate-400">Review note: {payout.admin_notes}</p>}
          </Card>)}
        </section>
        <section className="space-y-3" aria-labelledby="earnings-history-title">
          <h2 id="earnings-history-title" className="flex items-center gap-2 font-semibold"><Receipt size={17} />Earnings activity</h2>
          <p className="text-xs text-slate-400">Activity records describe movements between balances. Adding every row does not give your available balance.</p>
          {current.ledger.length === 0 ? <Card className="p-5 text-sm text-slate-400">No earnings activity yet. Eligible attributed orders will appear here.</Card> : current.ledger.map((entry) => <Card key={entry.id} className="space-y-2 p-4 text-sm">
            <div className="flex flex-wrap justify-between gap-2"><strong>{eventLabels[entry.type] ?? entry.type?.replace(/_/g, ' ') ?? 'Earnings activity'}</strong><span className="font-semibold">{formatCurrency(entry.amount)}</span></div>
            <p className="break-words text-slate-300">{entry.description ?? entry.notes ?? 'Earnings adjustment'}</p>
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400"><span>{dateText(entry.occurred_at ?? entry.created_at)}</span><Badge>{entry.status}</Badge></div>
            {entry.order && <Link className="inline-flex min-h-11 items-center text-xs text-brand underline" to={'/orders/' + entry.order_id}>Order {entry.order.order_number ?? '#' + entry.order_id}{entry.order_item?.product_title ? ' · ' + entry.order_item.product_title : ''}</Link>}
            {entry.payout_request_id && <p className="text-xs text-slate-400">Payout request #{entry.payout_request_id}</p>}
          </Card>)}
          {moreError && <p role="alert" className="text-sm text-red-300">{moreError}</p>}
          {page < Number(current.meta?.last_page ?? 1) && <Button variant="secondary" disabled={moreBusy} onClick={loadMore}>{moreBusy ? 'Loading…' : moreError ? 'Retry more activity' : 'Load more activity'}</Button>}
        </section>
      </>}
      {modal && <Dialog isOpen title="Request a payout" description="Submit your destination for administrative review. A request does not transfer money automatically." onClose={() => { if (!actionBusy.current) setModal(false) }}>
        <form onSubmit={requestPayout} className="space-y-4">
          {payoutError && <p role="alert" className="rounded-xl bg-red-950/40 p-3 text-sm text-red-300">{payoutError}</p>}
          <label className="block space-y-2 text-sm"><span>Payout method</span><select disabled={submitting} value={form.payout_method} onChange={(event) => setForm((previous) => ({ ...previous, payout_method: event.target.value }))} className="min-h-11 w-full rounded-xl border border-slate-700 bg-slate-900 px-3"><option value="bkash">bKash</option><option value="nagad">Nagad</option><option value="bank_transfer">Bank transfer</option></select></label>
          <label className="block space-y-2 text-sm"><span>{form.payout_method === 'bank_transfer' ? 'Bank account number' : 'Mobile account number'}</span><Input required maxLength={50} autoComplete="off" disabled={submitting} value={form.account_number} onChange={(event) => setForm((previous) => ({ ...previous, account_number: event.target.value }))} /></label>
          <label className="block space-y-2 text-sm"><span>Amount (BDT)</span><Input type="number" required min={minimum} max={available} step="0.01" disabled={submitting} value={form.amount} onChange={(event) => setForm((previous) => ({ ...previous, amount: event.target.value }))} /></label>
          <p className="text-xs text-slate-400">Minimum {formatCurrency(minimum)} · Available {formatCurrency(available)}</p>
          <div className="flex flex-wrap justify-end gap-2"><Button variant="secondary" disabled={submitting} onClick={() => setModal(false)}>Cancel</Button><Button type="submit" disabled={submitting || !ready}>{submitting ? 'Submitting…' : 'Submit payout request'}</Button></div>
        </form>
      </Dialog>}
    </div>
  )
}
