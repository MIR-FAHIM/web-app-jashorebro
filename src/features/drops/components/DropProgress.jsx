import { Users, ArrowDownRight } from 'lucide-react'
import { formatCurrency } from '@/shared/lib/formatCurrency'
import { calculateDropTier } from '../model/dropStatuses'

export function DropProgress({ tiers = [], currentParticipants = 0, retailPrice = 0 }) {
  const { currentTier, nextTier, neededForNext, progressToNext } = calculateDropTier(tiers, currentParticipants)
  const currentPrice = currentTier ? currentTier.price : retailPrice
  return (
    <div className="flex w-full flex-col gap-3">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div><p className="mb-1 text-xs text-muted">Current price</p><div className="flex items-baseline gap-2"><span className="text-2xl font-bold tracking-tight text-ink">{formatCurrency(currentPrice)}</span>{retailPrice > currentPrice && <span className="text-sm text-muted line-through">{formatCurrency(retailPrice)}</span>}</div></div>
        {nextTier && <span className="flex items-center gap-1 rounded-lg bg-brand-soft px-2.5 py-1.5 text-xs font-medium text-brand"><ArrowDownRight size={14} />Next: {formatCurrency(nextTier.price)}</span>}
      </div>
      <div role="progressbar" aria-label="Progress to next price tier" aria-valuenow={progressToNext} aria-valuemin={0} aria-valuemax={100} className="h-1.5 w-full overflow-hidden rounded-full bg-line"><div className="h-full rounded-full bg-brand transition-all duration-300" style={{ width: `${progressToNext}%` }} /></div>
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-xs text-muted">
        <span className="inline-flex items-center gap-1.5 text-soft"><Users size={14} />{currentParticipants} people are in</span>
        {nextTier ? <span>{neededForNext} more for {formatCurrency(nextTier.price)}</span> : tiers.length > 0 ? <span className="font-medium text-success">Lowest price unlocked</span> : <span>Pricing to be announced</span>}
      </div>
    </div>
  )
}
