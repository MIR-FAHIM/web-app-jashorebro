import { Users } from 'lucide-react'
import { formatCurrency } from '@/shared/lib/formatCurrency'

export function DropProgress({ tiers = [], currentParticipants = 0, retailPrice = 0, groupPrice, targetParticipants, status }) {
  const finalTier = [...tiers].sort((left, right) => Number(right.requiredParticipants) - Number(left.requiredParticipants))[0]
  const target = Math.max(0, Number(targetParticipants ?? finalTier?.requiredParticipants ?? 0) || 0)
  const price = Number(groupPrice ?? finalTier?.price)
  const count = Math.max(0, Number(currentParticipants) || 0)
  const isComplete = status === 'succeeded'
  const progress = isComplete ? 100 : target > 0 ? Math.min(100, Math.round(count / target * 100)) : 0
  const isEnded = ['failed', 'expired', 'cancelled'].includes(status)
  return (
    <div className="flex w-full min-w-0 flex-col gap-3">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0"><p className="mb-1 text-xs text-muted">{isComplete ? 'Drop price' : 'Conditional Drop price'}</p><p className="text-2xl font-bold tracking-tight text-ink">{Number.isFinite(price) && price > 0 ? formatCurrency(price) : 'Unavailable'}</p></div>
        {Number(retailPrice) > 0 && <p className="text-xs text-muted">Regular price <span className="font-medium text-soft">{formatCurrency(retailPrice)}</span></p>}
      </div>
      <div role="progressbar" aria-label="Qualifying buyers toward the Drop target" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100} className="h-2 w-full overflow-hidden rounded-full bg-line"><div className="h-full rounded-full bg-brand transition-all duration-300" style={{ width: `${progress}%` }} /></div>
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-xs text-muted">
        <span className="inline-flex items-center gap-1.5 text-soft"><Users size={14} />{isComplete ? `${count} active ${count === 1 ? 'buyer' : 'buyers'} · target ${target || '—'} reached` : `${count} / ${target || '—'} qualifying buyers`}</span>
        <span>{isComplete ? 'Target reached · orders closed' : isEnded ? 'Orders closed' : target > 0 ? `${Math.max(0, target - count)} more needed` : 'Target unavailable'}</span>
      </div>
    </div>
  )
}
