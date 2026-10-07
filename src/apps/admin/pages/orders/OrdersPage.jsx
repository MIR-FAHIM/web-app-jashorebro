import React from 'react'
import { Card } from '@/shared/ui/Card'
import { Badge } from '@/shared/ui/Badge'
import { Button } from '@/shared/ui/Button'
import { formatCurrency } from '@/shared/lib/formatCurrency'

export default function OrdersPage() {
  const orders = [
    {
      id: 'ORD-8921',
      customer: 'Fahim Ahmed',
      drop: 'Vintage Corduroy Hoodie',
      price: 999,
      hub: 'Home Delivery (Jashore)',
      status: 'confirmed',
      date: 'Today, 2:30 PM',
    },
    {
      id: 'ORD-8920',
      customer: 'Tanvir Hossain',
      drop: 'Havit Gaming Headset',
      price: 2099,
      hub: 'JUST Campus Hub',
      status: 'shipped',
      date: 'Yesterday',
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
          Batch Order Fulfillment
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Process aggregated orders unlocked through community drops. Grouped for campus and local pickup hubs.
        </p>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">Order ID</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Unlocked Drop Item</th>
                <th className="py-3 px-4">Paid Amount</th>
                <th className="py-3 px-4">Delivery Hub</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {orders.map((o) => (
                <tr key={o.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-slate-900">{o.id}</td>
                  <td className="py-3 px-4 text-slate-700">{o.customer}</td>
                  <td className="py-3 px-4 font-bold text-slate-900">{o.drop}</td>
                  <td className="py-3 px-4 text-emerald-700 font-bold">{formatCurrency(o.price)}</td>
                  <td className="py-3 px-4 text-slate-500">{o.hub}</td>
                  <td className="py-3 px-4">
                    <Badge variant={o.status === 'shipped' ? 'unlocked' : 'brand'} size="sm">
                      {o.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
