import { RecordsView } from '../../components/RecordsView'
import { Badge } from '@/shared/ui/Badge'
import { formatCurrency } from '@/shared/lib/formatCurrency'

const rows = [
  { id: 'ORD-8921', customer: 'Fahim Ahmed', product: 'Vintage Corduroy Hoodie', amount: 999, delivery: 'Home delivery · Jashore', status: 'Confirmed' },
  { id: 'ORD-8920', customer: 'Tanvir Hossain', product: 'Havit Gaming Headset', amount: 2099, delivery: 'JUST campus hub', status: 'Shipped' },
]
const columns = [
  { key: 'id', label: 'Order', render: (row) => <span className="font-mono text-xs text-ink">{row.id}</span> },
  { key: 'customer', label: 'Customer' },
  { key: 'product', label: 'Items' },
  { key: 'amount', label: 'Order total', render: (row) => <span className="font-semibold text-ink">{formatCurrency(row.amount)}</span> },
  { key: 'delivery', label: 'Delivery' },
  { key: 'status', label: 'Status', render: (row) => <Badge variant={row.status === 'Shipped' ? 'info' : 'brand'}>{row.status}</Badge> },
]

export default function OrdersPage() {
  return <RecordsView title="Orders" description="Review customer orders and delivery progress. Order prices preserve the amount agreed at checkout." rows={rows} columns={columns} statusKey="status" />
}
