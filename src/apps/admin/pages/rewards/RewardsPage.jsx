import { RecordsView } from '../../components/RecordsView'
import { Badge } from '@/shared/ui/Badge'
import { formatCurrency } from '@/shared/lib/formatCurrency'

const rows = [
  { id: 'PAY-101', name: 'Fahim Ahmed', handle: '@fahim_vibes', method: 'bKash · ••••5678', amount: 1850, orders: 14, status: 'Pending review' },
  { id: 'PAY-102', name: 'Nabila Rahman', handle: '@nabila_edits', method: 'Nagad · ••••5678', amount: 1420, orders: 11, status: 'Completed' },
]
const columns = [
  { key: 'id', label: 'Payout', render: (row) => <span className="font-mono text-xs">{row.id}</span> },
  { key: 'name', label: 'Curator', render: (row) => <div><p className="font-medium text-ink">{row.name}</p><p className="text-xs text-muted">{row.handle}</p></div> },
  { key: 'method', label: 'Method' },
  { key: 'orders', label: 'Attributed orders' },
  { key: 'amount', label: 'Amount', render: (row) => <span className="font-semibold text-ink">{formatCurrency(row.amount)}</span> },
  { key: 'status', label: 'Status', render: (row) => <Badge variant={row.status === 'Completed' ? 'unlocked' : 'warning'}>{row.status}</Badge> },
]

export default function RewardsPage() {
  return <RecordsView title="Rewards" description="Review sample attributed rewards and payout records." rows={rows} columns={columns} statusKey="status" renderDetails={() => 'This is a payout preview. No money is sent or approved from this screen.'} />
}
