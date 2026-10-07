import { RecordsView } from '../../components/RecordsView'
import { Badge } from '@/shared/ui/Badge'
import { formatCurrency } from '@/shared/lib/formatCurrency'

const rows = [
  { id: 'drop_1', title: 'Vintage Oversized Corduroy Hoodie', category: 'Streetwear', currentPrice: 1099, nextPrice: 999, participants: 18, target: 25, status: 'Active', endsIn: '2d 14h' },
  { id: 'drop_2', title: 'Havit H2002D RGB Gaming Headset', category: 'Tech & gadgets', currentPrice: 2350, nextPrice: 2099, participants: 28, target: 30, status: 'Active', endsIn: '18h' },
  { id: 'drop_3', title: 'Retro High-Top White Canvas Sneakers', category: 'Footwear', currentPrice: 1250, nextPrice: null, participants: 50, target: 50, status: 'Completed', endsIn: 'Closed' },
]
const columns = [
  { key: 'title', label: 'Drop', render: (row) => <div className="max-w-[260px]"><p className="font-medium text-ink">{row.title}</p><p className="mt-1 text-xs text-muted">{row.category}</p></div> },
  { key: 'currentPrice', label: 'Current price', render: (row) => <span className="font-semibold text-ink">{formatCurrency(row.currentPrice)}</span> },
  { key: 'participants', label: 'Participants', render: (row) => `${row.participants} joined` },
  { key: 'nextPrice', label: 'Next milestone', render: (row) => row.nextPrice ? <span>{formatCurrency(row.nextPrice)} at {row.target}</span> : <span className="text-success">Lowest tier reached</span> },
  { key: 'endsIn', label: 'Time remaining' },
  { key: 'status', label: 'Status', render: (row) => <Badge variant={row.status === 'Completed' ? 'unlocked' : 'brand'}>{row.status}</Badge> },
]

export default function DropManagementPage() {
  return <RecordsView title="Drops" description="Review participation, price milestones, and campaign status." rows={rows} columns={columns} statusKey="status" renderDetails={(row) => row.nextPrice ? `${row.target - row.participants} more participants to reach the next price milestone.` : 'This sample campaign has reached its lowest price tier.'} />
}
