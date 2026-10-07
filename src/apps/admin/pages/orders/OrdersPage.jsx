import { useState } from 'react'
import { Package, Search, Truck, CheckCircle2, Clock, MapPin, ArrowUpRight } from 'lucide-react'
import { Card } from '@/shared/ui/Card'
import { Badge } from '@/shared/ui/Badge'
import { Button } from '@/shared/ui/Button'
import { Dialog } from '@/shared/ui/Dialog'
import { formatCurrency } from '@/shared/lib/formatCurrency'

const initialOrders = [
  {
    id: 'JB-ORD-9024',
    customer: 'Fahim Ahmed',
    phone: '01712345678',
    item: 'Vintage Oversized Corduroy Hoodie',
    quantity: 1,
    amount: 999,
    dropTier: 'Tier 3 Unlocked Price',
    hub: 'Doratana Main Hub',
    address: 'Holding 42, Mujib Sarak, Jashore Sadar',
    status: 'Confirmed',
    createdAt: 'Today, 2:15 PM',
  },
  {
    id: 'JB-ORD-9023',
    customer: 'Tanvir Hossain',
    phone: '01898765432',
    item: 'Havit H2002D RGB Gaming Headset',
    quantity: 1,
    amount: 2099,
    dropTier: 'Tier 2 Target Reached',
    hub: 'JUST Campus Pickup Hub',
    address: 'Shahid Mashiur Rahman Hall, JUST',
    status: 'Shipped',
    createdAt: 'Today, 11:30 AM',
  },
  {
    id: 'JB-ORD-9022',
    customer: 'Nabila Rahman',
    phone: '01911223344',
    item: 'Benapole Pure Leather Bifold Wallet',
    quantity: 2,
    amount: 1440,
    dropTier: 'Tier 2 Unlocked Price',
    hub: 'Chanchra Moor Distribution',
    address: 'Near Chanchra Shiva Temple, Jashore',
    status: 'Delivered',
    createdAt: 'Yesterday, 5:40 PM',
  },
  {
    id: 'JB-ORD-9021',
    customer: 'Sakib Hasan',
    phone: '01655443322',
    item: 'Redragon K552 Mechanical Keyboard',
    quantity: 1,
    amount: 3200,
    dropTier: 'Standard Retail',
    hub: 'Keshabpur Sub-Hub',
    address: 'Bazar Road, Keshabpur',
    status: 'Confirmed',
    createdAt: 'Yesterday, 3:12 PM',
  },
]

export default function OrdersPage() {
  const [orders, setOrders] = useState(initialOrders)
  const [activeTab, setActiveTab] = useState('All')
  const [query, setQuery] = useState('')
  const [selectedOrder, setSelectedOrder] = useState(null)

  const filtered = orders.filter((order) => {
    const matchesTab = activeTab === 'All' || order.status.toLowerCase() === activeTab.toLowerCase()
    const matchesQuery =
      order.id.toLowerCase().includes(query.toLowerCase()) ||
      order.customer.toLowerCase().includes(query.toLowerCase()) ||
      order.item.toLowerCase().includes(query.toLowerCase()) ||
      order.hub.toLowerCase().includes(query.toLowerCase())

    return matchesTab && matchesQuery
  })

  const updateOrderStatus = (id, newStatus) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status: newStatus } : o))
    )
    if (selectedOrder && selectedOrder.id === id) {
      setSelectedOrder((prev) => ({ ...prev, status: newStatus }))
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Delivered':
        return (
          <Badge size="sm" className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30">
            Delivered
          </Badge>
        )
      case 'Shipped':
        return (
          <Badge size="sm" className="bg-blue-500/15 text-blue-400 border-blue-500/30">
            Shipped
          </Badge>
        )
      default:
        return (
          <Badge size="sm" className="bg-orange-500/15 text-orange-400 border-orange-500/30">
            Confirmed
          </Badge>
        )
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Package size={18} className="text-orange-500" />
            <span className="text-xs font-bold uppercase tracking-wider text-orange-400">
              Fulfillment & Dispatch
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Orders & Local Dispatch
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-400 max-w-2xl">
            Track customer group purchases, manage hub dispatches across Jashore, and update delivery states.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          {['All', 'Confirmed', 'Shipped', 'Delivered'].map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition-all shrink-0 ${
                activeTab === tab
                  ? 'bg-orange-500/15 text-orange-400 border border-orange-500/30'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:max-w-xs">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search order ID, customer, hub..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder:text-slate-500 focus:border-brand focus:outline-none"
          />
        </div>
      </div>

      {/* Orders Table */}
      <Card className="bg-slate-900 border-slate-800 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[750px] text-left text-xs">
            <thead className="bg-slate-950/60 text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th scope="col" className="px-5 py-3.5">Order Ref</th>
                <th scope="col" className="px-5 py-3.5">Customer & Phone</th>
                <th scope="col" className="px-5 py-3.5">Items & Pricing</th>
                <th scope="col" className="px-5 py-3.5">Destination Hub</th>
                <th scope="col" className="px-5 py-3.5">Status</th>
                <th scope="col" className="px-5 py-3.5 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filtered.map((order) => (
                <tr key={order.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="px-5 py-4 font-mono font-bold text-white">
                    {order.id}
                    <p className="text-[10px] text-slate-500 font-sans mt-0.5">{order.createdAt}</p>
                  </td>

                  <td className="px-5 py-4">
                    <p className="font-bold text-white">{order.customer}</p>
                    <p className="text-[11px] text-slate-400 font-mono mt-0.5">{order.phone}</p>
                  </td>

                  <td className="px-5 py-4">
                    <p className="font-medium text-slate-200 truncate max-w-[200px]">
                      {order.item} × {order.quantity}
                    </p>
                    <p className="text-[11px] text-emerald-400 font-bold mt-0.5">
                      {formatCurrency(order.amount)} · <span className="text-slate-500 text-[10px]">{order.dropTier}</span>
                    </p>
                  </td>

                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1.5 text-slate-300">
                      <MapPin size={13} className="text-orange-400 shrink-0" />
                      <span className="font-medium">{order.hub}</span>
                    </div>
                  </td>

                  <td className="px-5 py-4">
                    {getStatusBadge(order.status)}
                  </td>

                  <td className="px-5 py-4 text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setSelectedOrder(order)}
                      className="text-slate-400 hover:text-white hover:bg-slate-800"
                    >
                      <ArrowUpRight size={16} />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Order Details Modal */}
      <Dialog
        isOpen={Boolean(selectedOrder)}
        onClose={() => setSelectedOrder(null)}
        title={`Order Details: ${selectedOrder?.id}`}
        description="Fulfillment details and state transitions"
      >
        {selectedOrder && (
          <div className="space-y-4 pt-2 text-xs">
            <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Customer:</span>
                <span className="font-bold text-white">{selectedOrder.customer} ({selectedOrder.phone})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Address:</span>
                <span className="font-medium text-slate-300 text-right max-w-[250px]">{selectedOrder.address}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Item:</span>
                <span className="font-medium text-slate-300">{selectedOrder.item}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Total Charged:</span>
                <span className="font-bold text-emerald-400 text-sm">{formatCurrency(selectedOrder.amount)}</span>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-slate-400 font-semibold">Change Dispatch Status:</p>
              <div className="grid grid-cols-3 gap-2">
                {['Confirmed', 'Shipped', 'Delivered'].map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => updateOrderStatus(selectedOrder.id, st)}
                    className={`py-2 px-3 rounded-xl font-bold border transition-all ${
                      selectedOrder.status === st
                        ? 'bg-orange-500/20 text-orange-400 border-orange-500/40'
                        : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setSelectedOrder(null)}
                className="w-full"
              >
                Done
              </Button>
            </div>
          </div>
        )}
      </Dialog>
    </div>
  )
}
