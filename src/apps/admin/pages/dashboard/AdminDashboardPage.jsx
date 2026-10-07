import { useNavigate } from 'react-router-dom'
import { Flame, Users, ShoppingBag, DollarSign, ArrowRight, Clock, Plus } from 'lucide-react'
import { Card } from '@/shared/ui/Card'
import { Badge } from '@/shared/ui/Badge'
import { Button } from '@/shared/ui/Button'
import { formatCurrency } from '@/shared/lib/formatCurrency'

const stats = [
  { title: 'Active Drops', value: '14', note: '3 added this week', icon: Flame, tone: 'text-brand bg-brand-soft' },
  { title: 'Community members', value: '842', note: '128 joined this month', icon: Users, tone: 'text-info bg-info-soft' },
  { title: 'Order value', value: formatCurrency(284500), note: 'Across completed orders', icon: DollarSign, tone: 'text-success bg-success-soft' },
  { title: 'Pending rewards', value: formatCurrency(14200), note: '42 payouts to review', icon: ShoppingBag, tone: 'text-warning bg-warning-soft' },
]
const campaigns = [
  { id: 'drop_1', title: 'Vintage Oversized Corduroy Hoodie', category: 'Streetwear', seller: 'TrendFabric BD', participants: 18, target: 25, price: 1099, next: 999 },
  { id: 'drop_2', title: 'Havit H2002D RGB Gaming Headset', category: 'Tech & gadgets', seller: 'GadgetZone Jashore', participants: 28, target: 30, price: 2350, next: 2099 },
]

export default function AdminDashboardPage() {
  const navigate = useNavigate()
  return (
    <div className="space-y-7">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div><p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-brand">Community commerce</p><h1 className="text-3xl font-bold tracking-tight text-ink">Overview</h1><p className="mt-2 text-sm text-muted">A clear view of your Drops, orders, and people.</p></div>
        <Button onClick={() => navigate('/admin/drops')}><Plus size={18} /> Manage Drops</Button>
      </div>
      <div className="grid grid-cols-1 gap-3 min-[400px]:grid-cols-2 xl:grid-cols-4">
        {stats.map(({ title, value, note, icon: Icon, tone }) => <Card key={title} className="p-5"><div className="flex items-center justify-between gap-2"><span className="text-sm text-muted">{title}</span><span className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${tone}`}><Icon size={19} /></span></div><p className="mt-5 text-2xl font-bold tracking-tight text-ink">{value}</p><p className="mt-2 text-xs text-muted">{note}</p></Card>)}
      </div>
      <div className="grid gap-5 xl:grid-cols-[1fr_280px]">
        <Card className="min-w-0">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line p-5"><div><h2 className="text-lg font-semibold text-ink">Active Drops</h2><p className="mt-1 text-sm text-muted">Progress toward the next price milestone.</p></div><Button variant="ghost" onClick={() => navigate('/admin/drops')}>View all <ArrowRight size={16} /></Button></div>
          <div className="overflow-x-auto"><table className="w-full min-w-[640px] text-left text-sm"><thead className="bg-elevated/50 text-xs text-muted"><tr>{['Product', 'Community', 'Current price', 'Next milestone'].map((label) => <th key={label} scope="col" className="px-5 py-4 font-medium">{label}</th>)}</tr></thead><tbody className="divide-y divide-line">{campaigns.map((drop) => <tr key={drop.id} className="hover:bg-elevated/40"><td className="max-w-[240px] px-5 py-5"><p className="font-medium text-ink">{drop.title}</p><p className="mt-1 text-xs text-muted">{drop.seller}</p></td><td className="px-5 py-5"><p className="text-soft">{drop.participants} joined</p><div className="mt-2 h-1 w-24 rounded-full bg-line"><div className="h-full rounded-full bg-brand" style={{ width: `${drop.participants / drop.target * 100}%` }} /></div></td><td className="px-5 py-5 font-semibold text-ink">{formatCurrency(drop.price)}</td><td className="px-5 py-5"><Badge variant="brand">{formatCurrency(drop.next)} at {drop.target}</Badge><p className="mt-2 text-xs text-muted">{drop.target - drop.participants} more to go</p></td></tr>)}</tbody></table></div>
        </Card>
        <Card className="p-5"><span className="mb-4 flex size-10 items-center justify-center rounded-xl bg-warning-soft text-warning"><Clock size={20} /></span><h2 className="text-lg font-semibold text-ink">Needs your attention</h2><p className="mt-2 text-sm leading-relaxed text-muted">Review pending rewards and community reports.</p><div className="mt-5 space-y-2"><button onClick={() => navigate('/admin/rewards')} className="flex min-h-12 w-full items-center justify-between rounded-xl bg-elevated px-3 text-sm text-soft">Reward payouts <ArrowRight size={17} /></button><button onClick={() => navigate('/admin/moderation')} className="flex min-h-12 w-full items-center justify-between rounded-xl bg-elevated px-3 text-sm text-soft">Moderation queue <ArrowRight size={17} /></button></div><p className="mt-6 border-t border-line pt-4 text-xs text-muted">Sample data for UI review. Connect the API to show current platform activity.</p></Card>
      </div>
    </div>
  )
}
