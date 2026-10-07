import { RecordsView } from '../../components/RecordsView'
import { Avatar } from '@/shared/ui/Avatar'
import { Badge } from '@/shared/ui/Badge'
import { formatCurrency } from '@/shared/lib/formatCurrency'

const rows = [
  { id: 'u1', name: 'Fahim Ahmed', handle: '@fahim_vibes', score: '4.9', orders: 42, rewards: 1850, badge: 'Trendsetter' },
  { id: 'u2', name: 'Nabila Rahman', handle: '@nabila_edits', score: '4.8', orders: 31, rewards: 1420, badge: 'Drop catalyst' },
  { id: 'u3', name: 'Sakib Hasan', handle: '@sakib_tech', score: '4.7', orders: 19, rewards: 980, badge: 'Curator' },
]
const columns = [
  { key: 'name', label: 'Person', render: (row) => <div className="flex items-center gap-3"><Avatar name={row.name} size="sm" /><div><p className="font-medium text-ink">{row.name}</p><p className="text-xs text-muted">{row.handle}</p></div></div> },
  { key: 'score', label: 'Sample taste score' },
  { key: 'orders', label: 'Attributed orders' },
  { key: 'rewards', label: 'Sample rewards', render: (row) => formatCurrency(row.rewards) },
  { key: 'badge', label: 'Recognition', render: (row) => <Badge variant="outline">{row.badge}</Badge> },
]

export default function UsersPage() {
  return <RecordsView title="People & curators" description="Explore community profiles and sample recommendation activity." rows={rows} columns={columns} />
}
