import { RecordsView } from '../../components/RecordsView'
import { formatCurrency } from '@/shared/lib/formatCurrency'

const rows = [
  { id: 'p1', title: 'Vintage Oversized Corduroy Hoodie', sku: 'JB-HOOD-01', stock: 240, price: 1200, seller: 'TrendFabric BD' },
  { id: 'p2', title: 'Havit H2002D RGB Gaming Headset', sku: 'JB-AUDIO-02', stock: 85, price: 2600, seller: 'GadgetZone Jashore' },
  { id: 'p3', title: 'Redragon K552 Mechanical Keyboard', sku: 'JB-TECH-03', stock: 50, price: 3200, seller: 'GadgetZone Jashore' },
]
const columns = [
  { key: 'title', label: 'Product', render: (row) => <span className="font-medium text-ink">{row.title}</span> },
  { key: 'sku', label: 'SKU', render: (row) => <span className="text-xs font-mono text-muted">{row.sku}</span> },
  { key: 'stock', label: 'Stock', render: (row) => `${row.stock} units` },
  { key: 'price', label: 'Retail price', render: (row) => formatCurrency(row.price) },
  { key: 'seller', label: 'Seller' },
]

export default function CatalogPage() {
  return <RecordsView title="Product catalog" description="Browse products, stock, and the sellers behind community picks." rows={rows} columns={columns} />
}
