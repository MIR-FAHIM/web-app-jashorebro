import React from 'react'
import { Plus, Tag } from 'lucide-react'
import { Card } from '@/shared/ui/Card'
import { Button } from '@/shared/ui/Button'
import { formatCurrency } from '@/shared/lib/formatCurrency'

export default function CatalogPage() {
  const products = [
    {
      id: 'p1',
      title: 'Vintage Oversized Corduroy Hoodie',
      sku: 'JB-HOOD-01',
      stock: 240,
      retailPrice: 1200,
      seller: 'TrendFabric BD',
    },
    {
      id: 'p2',
      title: 'Havit H2002D RGB Gaming Headset',
      sku: 'JB-AUDIO-02',
      stock: 85,
      retailPrice: 2600,
      seller: 'GadgetZone Jashore',
    },
    {
      id: 'p3',
      title: 'Redragon K552 Mechanical Keyboard',
      sku: 'JB-TECH-03',
      stock: 50,
      retailPrice: 3200,
      seller: 'GadgetZone Jashore',
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
            Product Catalog
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage base products eligible for community recommendations and Drop campaigns.
          </p>
        </div>
        <Button variant="primary" size="sm">
          <Plus size={16} /> Add Product
        </Button>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">Product</th>
                <th className="py-3 px-4">SKU</th>
                <th className="py-3 px-4">Stock</th>
                <th className="py-3 px-4">Retail Price</th>
                <th className="py-3 px-4">Merchant</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4 font-bold text-slate-900">{p.title}</td>
                  <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">{p.sku}</td>
                  <td className="py-3 px-4 text-slate-700">{p.stock} units</td>
                  <td className="py-3 px-4 font-bold text-slate-900">{formatCurrency(p.retailPrice)}</td>
                  <td className="py-3 px-4 text-slate-600">{p.seller}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
