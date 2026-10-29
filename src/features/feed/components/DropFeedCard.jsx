import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight, Share2, Check, Clock, Users } from 'lucide-react'
import { FeedCardShell } from './FeedCardShell'
import { Button } from '@/shared/ui/Button'
import { ImInButton } from '@/features/drops/components/ImInButton'
import { DropProgress } from '@/features/drops/components/DropProgress'
import { useDropInterest } from '@/features/drops/model/useDropInterest'
import { formatDropDeadline } from '@/features/drops/model/dropLifecycle'
import { resolveImageUrl } from '@/shared/lib/mediaUrl'

export function DropFeedCard({ item, onOpenFeedback }) {
  const initialDrop = useMemo(() => ({
    ...(item.drop_details || item),
    id: item.drop_details?.id || item.source_id || item.id,
    viewer_state: item.drop_details?.viewer_state || item.viewer_state,
  }), [item])
  const { drop, facts, busy, error, toggleInterest } = useDropInterest(initialDrop)
  const [shareMessage, setShareMessage] = useState('')
  const product = drop.product || item.product || {}
  const detailsPath = `/drops/${drop.id}`
  const deadline = formatDropDeadline(drop.end_at)
  const share = async () => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}${detailsPath}`)
      setShareMessage('Copied')
    } catch { setShareMessage('Open the Drop and copy its page address.') }
  }
  return (
    <FeedCardShell item={item} onOpenFeedback={onOpenFeedback}>
      <Link to={detailsPath} className="group/drop flex min-w-0 flex-col items-start gap-4 rounded-2xl border border-line bg-field-bg p-4 transition hover:border-brand/40 sm:flex-row">
        <div className="relative size-24 shrink-0 overflow-hidden rounded-xl border border-line bg-surface sm:size-28">{(drop.image || product.image || item.image) ? <img src={resolveImageUrl(drop.image || product.image || item.image)} alt="" className="size-full object-cover" /> : <div className="flex size-full items-center justify-center p-2 text-center text-xs text-muted">No photo</div>}</div>
        <div className="min-w-0 flex-1 space-y-3 [overflow-wrap:anywhere]">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-brand">Price Drop · {facts.statusLabel}</p>
          <h3 className="text-base font-semibold text-ink group-hover/drop:text-brand">{drop.title || product.title}</h3>
          <DropProgress currentParticipants={facts.qualifying} targetParticipants={facts.target} retailPrice={drop.retail_price ?? drop.retailPrice ?? product.base_price} groupPrice={drop.group_price ?? drop.groupPrice} status={drop.status} />
          {deadline && <p className="flex items-start gap-1.5 text-xs text-muted"><Clock size={13} className="mt-0.5 shrink-0" /><span>Deadline: {deadline} · Bangladesh time</span></p>}
        </div>
      </Link>
      <div className="mt-4 min-w-0 space-y-3 border-t border-line/60 pt-3">
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted"><Users size={14} className="text-brand" /><span>{facts.interestCount} interested · interest does not count toward the target</span></div>
        {facts.reserved && <p className="text-xs text-soft">You have a conditional order reservation.</p>}
        {facts.confirmed && <p className="text-xs text-success">Your participation is confirmed. New orders are closed.</p>}
        {error && <p role="alert" className="text-xs text-danger">{error}</p>}
        {shareMessage && <p role="status" className="text-xs text-muted">{shareMessage}</p>}
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <Button type="button" variant="outline" size="sm" onClick={share} className="text-xs">{shareMessage === 'Copied' ? <Check size={14} /> : <Share2 size={14} />}<span>Share</span></Button>
          <ImInButton isJoined={facts.interested} onToggleJoin={toggleInterest} isLoading={busy} disabled={!facts.canExpressInterest} size="sm" className="w-auto min-w-28 text-xs" />
          <Link to={detailsPath} className="inline-flex min-h-11 items-center justify-center gap-1 rounded-xl bg-brand px-3 text-xs font-semibold text-on-brand">View Drop <ArrowUpRight size={14} /></Link>
        </div>
        {!facts.canOrder && <p className="text-xs text-muted">{facts.unavailableReason}</p>}
      </div>
    </FeedCardShell>
  )
}
