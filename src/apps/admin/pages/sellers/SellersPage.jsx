import { RecordsView } from '../../components/RecordsView'
import { Badge } from '@/shared/ui/Badge'

const rows = [
  { id: 's1', name: 'GadgetZone Jashore', phone: '01912345678', drops: 4, settlement: 'Weekly batch', status: 'Verified' },
  { id: 's2', name: 'TrendFabric BD', phone: '01812345678', drops: 2, settlement: 'Weekly batch', status: 'Verified' },
]
const columns = [
  { key: 'name', label: 'Seller', render: (row) => <span className="font-medium text-ink">{row.name}</span> },
  { key: 'phone', label: 'Phone' },
  { key: 'drops', label: 'Active Drops' },
  { key: 'settlement', label: 'Settlement schedule' },
  { key: 'status', label: 'Status', render: (row) => <Badge variant="unlocked">{row.status}</Badge> },
]

export default function SellersPage() {
  return <RecordsView title="Sellers" description="Review the merchants supplying your community's products and Drops." rows={rows} columns={columns} statusKey="status" />
}
