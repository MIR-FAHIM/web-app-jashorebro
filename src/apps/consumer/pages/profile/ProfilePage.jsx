import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowUpRight, Bookmark, Check, MapPin, Plus, Share2, Wallet } from 'lucide-react'
import { Card } from '@/shared/ui/Card'
import { Badge } from '@/shared/ui/Badge'
import { Button } from '@/shared/ui/Button'
import { Avatar } from '@/shared/ui/Avatar'
import { Dialog } from '@/shared/ui/Dialog'
import { calculateDropTier } from '@/features/drops/model/dropStatuses'
import { useDropInterests } from '@/features/drops/model/useDropInterest'
import { formatCurrency } from '@/shared/lib/formatCurrency'
import { MOCK_DROPS } from '../mockCatalog'

export default function ProfilePage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [activeTab, setActiveTab] = useState('picks')
  const [shareMessage, setShareMessage] = useState('')
  const [withdrawOpen, setWithdrawOpen] = useState(false)
  const publicHandle = params.get('person')
  const isPublicProfile = Boolean(publicHandle)
  const isNabila = publicHandle === 'nabila_edits'
  const drops = useDropInterests(MOCK_DROPS)
  const picks = isPublicProfile ? drops.filter((drop) => drop.curator.handle === publicHandle) : drops
  const curator = isNabila
    ? { name: 'Nabila Rahman', handle: '@nabila_edits', bio: 'Tech finds and everyday essentials for an easier setup.' }
    : { name: 'Fahim Ahmed', handle: '@fahim_vibes', walletBalance: 1850, bio: 'Tech enthusiast and streetwear lover. A shelf of good finds, with honest notes for my circle.' }
  const shareProfile = async () => {
    try {
      await navigator.clipboard.writeText(window.location.origin + '/profile?person=' + curator.handle.slice(1))
      setShareMessage('Profile link copied')
    } catch {
      setShareMessage('Copy the page address to share this profile.')
    }
  }

  if (isPublicProfile && !['fahim_vibes', 'nabila_edits'].includes(publicHandle)) {
    return <Card className="mx-auto max-w-lg p-8 text-center"><h1 className="text-xl font-semibold text-ink">Profile unavailable</h1><p className="my-3 text-sm text-muted">Discover another community pick in the preview feed.</p><Link to="/" className="inline-flex min-h-11 items-center text-brand">Back to Home</Link></Card>
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Card className="overflow-hidden">
        <div className="relative h-24 border-b border-line bg-elevated sm:h-32">
          <div className="absolute inset-y-0 right-0 w-1/2 bg-gradient-to-l from-brand/10 to-transparent" />
          <span className="absolute right-4 top-4"><Badge>Preview profile</Badge></span>
        </div>
        <div className="px-5 pb-6 sm:px-7">
          <div className="-mt-8 flex items-end justify-between gap-3">
            <Avatar name={curator.name} size="xl" className="relative ring-4 ring-surface" />
            <button onClick={shareProfile} aria-label="Copy profile link" className="flex h-11 w-11 items-center justify-center rounded-xl border border-line text-soft hover:bg-elevated">
              <Share2 size={18} />
            </button>
          </div>
          <div className="mt-4">
            <h1 className="text-2xl font-semibold tracking-tight text-ink">{curator.name}</h1>
            <p className="mt-1 text-sm text-muted">{curator.handle}</p>
            <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-soft">{curator.bio}</p>
            <p className="mt-3 flex items-center gap-1.5 text-xs text-muted"><MapPin size={14} /> Jashore, Bangladesh</p>
          </div>
          {shareMessage && <p role="status" className="mt-3 text-sm text-brand">{shareMessage}</p>}
          <div className={`mt-6 grid gap-3 border-t border-line pt-5 ${isPublicProfile ? 'grid-cols-2' : 'grid-cols-3'}`}>
            <div><p className="text-xl font-semibold text-ink">{picks.length}</p><p className="mt-1 text-xs text-muted">Curated picks</p></div>
            <div><p className="text-xl font-semibold text-ink">{isNabila ? 24 : 42}</p><p className="mt-1 text-xs text-muted">Sample attributed buys</p></div>
            {!isPublicProfile && <div><p className="text-xl font-semibold text-success">{formatCurrency(curator.walletBalance)}</p><p className="mt-1 text-xs text-muted">Sample rewards</p></div>}
          </div>
        </div>
      </Card>
      {!isPublicProfile && (
        <div className="flex gap-2 border-b border-line pb-3">
          {[['picks', 'My Picks', Bookmark], ['rewards', 'Rewards', Wallet]].map(([value, label, Icon]) => (
            <button
              key={value}
              onClick={() => setActiveTab(value)}
              aria-pressed={activeTab === value}
              className={`flex min-h-11 items-center gap-2 rounded-xl px-4 text-sm font-medium ${activeTab === value ? 'bg-ink text-canvas' : 'text-soft hover:bg-elevated'}`}
            ><Icon size={16} />{label}</button>
          ))}
        </div>
      )}
      {activeTab === 'picks' || isPublicProfile ? (
        <section className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div><h2 className="text-xl font-semibold text-ink">A shelf with a point of view</h2><p className="mt-1 text-sm text-muted">Good finds, collected in one place.</p></div>
            {!isPublicProfile && <Button variant="outline" onClick={() => navigate('/explore')}><Plus size={16} /> Find a pick</Button>}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {picks.map((pick) => (
              <Card key={pick.id} className="overflow-hidden">
                <Link to={`/drops/${pick.id}`} className="block aspect-[4/3] overflow-hidden bg-elevated">
                  <img src={pick.image} alt={pick.title} className="h-full w-full object-cover" />
                </Link>
                <div className="space-y-3 p-4">
                  <p className="text-xs text-muted">{pick.category}</p>
                  <Link to={`/drops/${pick.id}`} className="block text-base font-semibold leading-snug text-ink hover:text-brand">{pick.title}</Link>
                  <p className="min-h-10 text-sm leading-relaxed text-muted">{pick.recommendation}</p>
                  <div className="flex items-center justify-between gap-2 border-t border-line pt-3">
                    <span className="text-lg font-semibold text-ink">{formatCurrency(calculateDropTier(pick.tiers, pick.currentParticipants).currentTier.price)}</span>
                    <Link to={`/drops/${pick.id}`} className="flex min-h-11 items-center gap-1 text-sm text-brand">View Drop <ArrowUpRight size={16} /></Link>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>
      ) : (
        <Card className="space-y-5 p-5 sm:p-7">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-success-soft text-success"><Wallet size={24} /></div>
          <div><p className="text-sm text-muted">Sample available balance</p><h2 className="mt-2 text-4xl font-semibold tracking-tight text-ink">{formatCurrency(curator.walletBalance)}</h2></div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl bg-elevated p-4"><p className="text-xs text-muted">Reward source</p><p className="mt-1 text-sm text-soft">Attributed purchases</p></div>
            <div className="rounded-xl bg-elevated p-4"><p className="text-xs text-muted">Payout status</p><p className="mt-1 text-sm text-soft">Preview only</p></div>
          </div>
          <Button className="w-full sm:w-auto" onClick={() => setWithdrawOpen(true)}>Preview withdrawal <ArrowUpRight size={16} /></Button>
          <p className="border-t border-line pt-4 text-sm leading-relaxed text-muted">Reward eligibility, settlement timing, and payout methods will be confirmed before real transactions are enabled.</p>
        </Card>
      )}
      <Dialog isOpen={withdrawOpen && !isPublicProfile} onClose={() => setWithdrawOpen(false)} title="Withdrawal preview">
        <div className="space-y-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-success-soft text-success"><Check size={24} /></div>
          <p className="text-base leading-relaxed text-soft">This is a preview of your reward wallet. No withdrawal request or money transfer has been made.</p>
          <Button className="w-full" onClick={() => setWithdrawOpen(false)}>Got it</Button>
        </div>
      </Dialog>
    </div>
  )
}
