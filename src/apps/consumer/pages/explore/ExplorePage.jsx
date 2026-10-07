import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ArrowUpRight, Search, Users, X } from 'lucide-react'
import { Card } from '@/shared/ui/Card'
import { Badge } from '@/shared/ui/Badge'
import { Button } from '@/shared/ui/Button'
import { formatCurrency } from '@/shared/lib/formatCurrency'
import { calculateDropTier } from '@/features/drops/model/dropStatuses'
import { useDropInterests } from '@/features/drops/model/useDropInterest'
import { MOCK_DROPS, MOCK_PRODUCTS } from '../mockCatalog'

const CATEGORIES = ['All categories', 'Streetwear', 'Tech & Gadgets', 'Footwear']

export default function ExplorePage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const drops = useDropInterests(MOCK_DROPS)
  const items = [...drops.map((item) => ({ ...item, type: 'drop', price: calculateDropTier(item.tiers, item.currentParticipants).currentTier.price })), ...MOCK_PRODUCTS.map((item) => ({ ...item, type: 'product', price: item.retailPrice }))]
  const activeTab = searchParams.get('tab') === 'products' ? 'product' : searchParams.get('tab') === 'drops' ? 'drop' : 'all'
  const searchQuery = searchParams.get('q') || ''
  const setSearchQuery = (value) => {
    const next = new URLSearchParams(searchParams)
    if (value) next.set('q', value)
    else next.delete('q')
    setSearchParams(next, { replace: true })
  }
  const setActiveTab = (value) => {
    const next = new URLSearchParams(searchParams)
    if (value === 'all') next.delete('tab')
    else next.set('tab', value === 'product' ? 'products' : 'drops')
    setSearchParams(next, { replace: true })
  }
  const [category, setCategory] = useState('All categories')
  const filteredItems = items.filter((item) => (activeTab === 'all' || item.type === activeTab) && (category === 'All categories' || item.category === category) && `${item.title} ${item.category}`.toLowerCase().includes(searchQuery.trim().toLowerCase()))

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div><p className="mb-2 text-xs font-medium tracking-wide text-brand">DISCOVER YOUR NEXT FAVORITE</p><h1 className="text-3xl font-semibold tracking-tight text-ink">Explore</h1><p className="mt-2 text-[15px] text-muted">Browse the catalog. Find a Drop. Bring your circle.</p></div>
      <div className="space-y-4 rounded-2xl border border-line bg-surface p-4 sm:p-5">
        <div className="relative"><Search size={20} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" /><input aria-label="Search products and categories" type="search" placeholder="Search products or categories" value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} className="h-13 w-full rounded-xl border border-field-border bg-elevated pl-12 pr-12 text-base text-ink placeholder:text-muted focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20" />{searchQuery && <button onClick={() => setSearchQuery('')} aria-label="Clear search" className="absolute right-1 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-lg text-muted hover:text-ink"><X size={18} /></button>}</div>
        <div className="flex flex-wrap gap-2" aria-label="Item type">{[['all', 'Everything'], ['drop', 'Active Drops'], ['product', 'Products']].map(([value, label]) => <button key={value} onClick={() => setActiveTab(value)} aria-pressed={activeTab === value} className={`min-h-11 rounded-xl px-4 text-sm font-medium ${activeTab === value ? 'bg-brand text-on-brand' : 'bg-elevated text-soft hover:text-ink'}`}>{label}</button>)}</div>
      </div>
      <div className="flex items-center gap-2 overflow-x-auto pb-1" aria-label="Product category">{CATEGORIES.map((label) => <button key={label} aria-pressed={category === label} onClick={() => setCategory(label)} className={`min-h-11 whitespace-nowrap rounded-full border px-4 text-sm ${category === label ? 'border-field-border bg-elevated text-ink' : 'border-line text-muted hover:text-ink'}`}>{label}</button>)}</div>
      <div className="flex items-center justify-between gap-3"><h2 className="text-base font-semibold text-ink">{category === 'All categories' ? 'The discovery edit' : category}</h2><p className="text-xs text-muted" aria-live="polite">{filteredItems.length} {filteredItems.length === 1 ? 'find' : 'finds'}</p></div>
      {filteredItems.length ? <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3">{filteredItems.map((item) => <Card key={item.id} className="group flex flex-col overflow-hidden"><Link to={item.type === 'drop' ? `/drops/${item.id}` : `/products/${item.id}`} className="relative block aspect-square overflow-hidden bg-elevated"><img src={item.image} alt={item.title} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 motion-safe:group-hover:scale-105" /><span className="absolute left-2 top-2 sm:left-3 sm:top-3"><Badge variant={item.type === 'drop' ? 'brand' : 'default'}>{item.type === 'drop' ? 'Active Drop' : 'Catalog'}</Badge></span></Link><div className="flex flex-1 flex-col p-3 sm:p-4"><p className="text-xs text-muted">{item.category}</p><Link to={item.type === 'drop' ? `/drops/${item.id}` : `/products/${item.id}`} className="mt-1.5 line-clamp-2 text-sm font-medium leading-snug text-ink hover:text-brand sm:text-base">{item.title}</Link><div className="mt-auto pt-4"><div className="flex flex-wrap items-baseline gap-x-2 gap-y-1"><span className="text-lg font-semibold tracking-tight text-ink sm:text-xl">{formatCurrency(item.price)}</span>{item.retailPrice > item.price && <span className="text-xs text-muted line-through">{formatCurrency(item.retailPrice)}</span>}</div><div className="mt-3 flex items-center justify-between gap-1 border-t border-line pt-3"><span className="flex items-center gap-1.5 text-xs text-muted">{item.type === 'drop' ? <><Users size={14} /> {item.currentParticipants} in</> : 'Regular price'}</span><Link className="flex min-h-8 items-center gap-1 text-xs font-medium text-brand" to={item.type === 'drop' ? `/drops/${item.id}` : `/products/${item.id}`}>{item.type === 'drop' ? 'View Drop' : 'Details'}<ArrowUpRight size={14} /></Link></div></div></div></Card>)}</div> : <Card className="px-6 py-12 text-center"><Search size={28} className="mx-auto mb-4 text-muted" /><h2 className="text-lg font-semibold text-ink">No finds yet</h2><p className="mt-2 text-sm text-muted">Try another search or broaden your category.</p><Button className="mt-5" variant="outline" onClick={() => { setSearchParams({}); setCategory('All categories') }}>Reset filters</Button></Card>}
    </div>
  )
}
