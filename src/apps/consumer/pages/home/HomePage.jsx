import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowUpRight, ArrowRight, Check, Copy, Share2, Users } from 'lucide-react'
import { Card } from '@/shared/ui/Card'
import { Badge } from '@/shared/ui/Badge'
import { Avatar } from '@/shared/ui/Avatar'
import { DropProgress } from '@/features/drops/components/DropProgress'
import { ImInButton } from '@/features/drops/components/ImInButton'
import { setDropInterest, useDropInterests } from '@/features/drops/model/useDropInterest'
import { Sheet } from '@/shared/ui/Sheet'
import { Button } from '@/shared/ui/Button'
import { MOCK_DROPS } from '../mockCatalog'

const FILTERS = ['For you', 'Following', 'Streetwear']

export default function HomePage() {
  const navigate = useNavigate()
  const feedItems = useDropInterests(MOCK_DROPS)
  const [filter, setFilter] = useState('For you')
  const [activeShareDrop, setActiveShareDrop] = useState(null)
  const [copied, setCopied] = useState(false)
  const [copyError, setCopyError] = useState('')
  const visibleItems = feedItems.filter((item) => filter === 'Streetwear' ? item.category === 'Streetwear' : filter === 'Following' ? item.id === 'drop_2' : true)
  const toggleJoin = (dropId) => {
    const drop = feedItems.find((item) => item.id === dropId)
    setDropInterest(dropId, !drop.isJoined)
  }
  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.origin + '/drops/' + activeShareDrop.id)
      setCopied(true)
    } catch {
      setCopyError('Could not copy. Select and copy the link below.')
    }
  }

  return (
    <div className="mx-auto w-full max-w-5xl space-y-7">
      <section className="relative overflow-hidden rounded-3xl border border-line bg-surface p-6 sm:p-8">
        <div className="pointer-events-none absolute -right-12 -top-16 h-64 w-64 rounded-full bg-brand/10 blur-3xl" />
        <div className="relative max-w-xl">
          <span className="mb-4 inline-flex items-center gap-2 text-xs font-medium tracking-wide text-brand"><span className="h-1.5 w-1.5 rounded-full bg-brand" /> YOUR PEOPLE. BETTER PRICES.</span>
          <h1 className="text-3xl font-semibold leading-tight tracking-tight text-ink sm:text-4xl">Good finds.<br /><span className="text-brand">Better together.</span></h1>
          <p className="mt-3 max-w-md text-[15px] leading-relaxed text-soft">Discover picks from your community. Join a Drop and help unlock the next group price.</p>
          <div className="mt-6 flex flex-wrap items-center gap-4">
            <Button onClick={() => navigate('/explore')}>Explore Drops <ArrowUpRight size={17} /></Button>
            <div className="flex items-center gap-2.5 text-xs text-muted"><Users size={17} className="text-brand" /> Made for the Jashore community</div>
          </div>
        </div>
      </section>
      <section aria-labelledby="feed-heading" className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div><h2 id="feed-heading" className="text-xl font-semibold tracking-tight text-ink">Your next good find</h2><p className="mt-1 text-sm text-muted">Community picks worth a closer look.</p></div>
          <span className="rounded-full border border-line px-3 py-1.5 text-xs text-muted">Preview collection</span>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1" aria-label="Filter feed">
          {FILTERS.map((label) => <button key={label} onClick={() => setFilter(label)} aria-pressed={filter === label} className={`min-h-11 whitespace-nowrap rounded-full px-4 text-sm font-medium transition-colors ${filter === label ? 'bg-ink text-canvas' : 'border border-line bg-surface text-soft hover:border-field-border'}`}>{label}</button>)}
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          {visibleItems.map((item) => <Card key={item.id} className="group overflow-hidden">
            <div className="flex items-center justify-between gap-2 p-4">
              <button onClick={() => navigate(`/profile?person=${item.curator.handle}`)} className="flex min-h-11 min-w-0 items-center gap-3 text-left">
                <Avatar name={item.curator.name} size="sm" />
                <div className="min-w-0"><p className="truncate text-sm font-semibold text-ink">{item.curator.name}</p><p className="text-xs text-muted">Recommended a good find</p></div>
              </button>
              <button aria-label={`Share ${item.title}`} onClick={() => { setActiveShareDrop(item); setCopied(false); setCopyError('') }} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-muted hover:bg-elevated hover:text-ink"><Share2 size={18} /></button>
            </div>
            <button onClick={() => navigate(`/drops/${item.id}`)} className="relative block aspect-[4/3] w-full overflow-hidden bg-elevated" aria-label={`View ${item.title}`}>
              <img src={item.image} alt={item.title} className="h-full w-full object-cover transition-transform duration-500 motion-safe:group-hover:scale-105" />
              <span className="absolute left-4 top-4 rounded-full border border-white/15 bg-canvas/85 px-3 py-1.5 text-xs font-medium text-ink backdrop-blur-sm">{item.category}</span>
              {item.isJoined && <span className="absolute bottom-4 right-4 inline-flex items-center gap-1.5 rounded-full bg-success-soft px-3 py-1.5 text-xs font-medium text-success"><Check size={14} /> You’re in</span>}
            </button>
            <div className="space-y-4 p-4 sm:p-5">
              <div><button onClick={() => navigate(`/drops/${item.id}`)} className="text-left text-lg font-semibold leading-snug tracking-tight text-ink hover:text-brand">{item.title}</button><p className="mt-2 text-sm leading-relaxed text-muted">{item.recommendation}</p></div>
              <div className="border-t border-line pt-4"><DropProgress tiers={item.tiers} currentParticipants={item.currentParticipants} retailPrice={item.retailPrice} /></div>
              <div className="flex items-center gap-2"><div className="flex-1"><ImInButton isJoined={item.isJoined} onToggleJoin={() => toggleJoin(item.id)} size="md" /></div><Button variant="outline" onClick={() => navigate(`/drops/${item.id}`)} aria-label={`View details for ${item.title}`}><ArrowRight size={18} /></Button></div>
            </div>
          </Card>)}
        </div>
      </section>
      <Sheet isOpen={Boolean(activeShareDrop)} onClose={() => setActiveShareDrop(null)} title="Good finds are better shared">
        {activeShareDrop && <div className="space-y-4"><Badge variant="brand">Share this Drop</Badge><p className="text-base leading-relaxed text-soft">Invite your circle to {activeShareDrop.title}. More people can help unlock the next price.</p><div className="break-all rounded-xl border border-line bg-elevated p-3 text-sm text-muted">{window.location.origin}/drops/{activeShareDrop.id}</div><Button className="w-full" onClick={copyLink}>{copied ? <Check size={17} /> : <Copy size={17} />}{copied ? 'Link copied' : 'Copy Drop link'}</Button><p aria-live="polite" className="text-sm text-danger">{copyError}</p></div>}
      </Sheet>
    </div>
  )
}
