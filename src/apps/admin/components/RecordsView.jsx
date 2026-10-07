import { useState } from 'react'
import { Search, ArrowUpRight } from 'lucide-react'
import { Card } from '@/shared/ui/Card'
import { Button } from '@/shared/ui/Button'
import { Dialog } from '@/shared/ui/Dialog'
import { EmptyState } from '@/shared/patterns/EmptyState'

export function RecordsView({ title, description, rows, columns, statusKey, renderDetails }) {
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('all')
  const [selected, setSelected] = useState(null)
  const statuses = statusKey ? [...new Set(rows.map((row) => row[statusKey]))] : []
  const filtered = rows.filter((row) => Object.values(row).join(' ').toLowerCase().includes(query.toLowerCase()) && (status === 'all' || row[statusKey] === status))

  return (
    <div className="space-y-6">
      <div><p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-brand">Admin workspace</p><h1 className="text-3xl font-bold tracking-tight text-ink">{title}</h1><p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">{description}</p></div>
      <Card>
        <div className="flex flex-col gap-3 border-b border-line p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div role="search" className="relative w-full sm:max-w-sm"><Search size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" /><input aria-label={`Search ${title.toLowerCase()}`} placeholder={`Search ${title.toLowerCase()}…`} value={query} onChange={(event) => setQuery(event.target.value)} className="min-h-11 w-full rounded-xl border border-field-border bg-elevated py-2.5 pl-10 pr-4 text-base text-ink placeholder:text-muted sm:text-sm" /></div>
          <div className="flex items-center justify-between gap-3"><p className="shrink-0 text-xs text-muted" aria-live="polite">{filtered.length} of {rows.length} records</p>{statusKey && <select aria-label="Filter by status" value={status} onChange={(event) => setStatus(event.target.value)} className="min-h-11 max-w-full rounded-xl border border-field-border bg-elevated px-3 text-sm text-soft"><option value="all">All statuses</option>{statuses.map((value) => <option key={value} value={value}>{value}</option>)}</select>}</div>
        </div>
        {filtered.length ? <div className="overflow-x-auto"><table className="w-full min-w-[720px] text-left text-sm"><caption className="sr-only">{title} — demonstration records</caption><thead className="border-b border-line bg-elevated/50 text-xs text-muted"><tr>{columns.map((column) => <th key={column.key} scope="col" className="px-5 py-4 font-medium">{column.label}</th>)}<th scope="col" className="px-5 py-4 font-medium">Details</th></tr></thead><tbody className="divide-y divide-line">{filtered.map((row) => <tr key={row.id} className="transition-colors hover:bg-elevated/40">{columns.map((column) => <td key={column.key} className="px-5 py-4 text-soft">{column.render ? column.render(row) : row[column.key]}</td>)}<td className="px-5 py-4"><Button variant="ghost" size="icon" aria-label={`View ${row.name || row.title || row.id}`} onClick={() => setSelected(row)}><ArrowUpRight size={18} /></Button></td></tr>)}</tbody></table></div> : <EmptyState icon={Search} title="No matching records" description="Try another search or clear your filters." actionLabel="Clear filters" onAction={() => { setQuery(''); setStatus('all') }} />}
        <p className="border-t border-line px-5 py-3 text-xs text-muted">Demo records · changes and management actions will be available after API integration.</p>
      </Card>
      <Dialog isOpen={Boolean(selected)} onClose={() => setSelected(null)} title={selected?.name || selected?.title || selected?.id} description="Record preview">
        {selected && <><dl className="space-y-4">{columns.map((column) => <div key={column.key} className="flex flex-wrap justify-between gap-2 border-b border-line pb-3"><dt className="text-sm text-muted">{column.label}</dt><dd className="text-sm font-medium text-ink">{column.render ? column.render(selected) : selected[column.key]}</dd></div>)}</dl>{renderDetails && <div className="mt-5 text-sm text-muted">{renderDetails(selected)}</div>}<Button variant="secondary" className="mt-6 w-full" onClick={() => setSelected(null)}>Close preview</Button></>}
      </Dialog>
    </div>
  )
}
