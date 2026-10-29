import { Bookmark, Check, ChevronRight } from 'lucide-react'
import { Avatar } from '@/shared/ui/Avatar'
import { cn } from '@/shared/lib/cn'
import { resolveImageUrl } from '@/shared/lib/mediaUrl'

export function FriendPickCard({ friend, isSelected = false, onSelect }) {
  const name = friend.name || friend.username || 'Your friend'
  const count = friend.picks_count
  const hasCount = count !== null && count !== undefined && count !== '' && Number.isFinite(Number(count))
  const picksLabel = hasCount
    ? `${Number(count).toLocaleString('en-BD')} ${Number(count) === 1 ? 'pick' : 'picks'}`
    : 'View picks'

  return (
    <button
      type="button"
      onClick={() => onSelect?.(friend)}
      aria-pressed={isSelected}
      className={cn(
        'group relative flex min-h-28 w-full flex-col items-center gap-3 rounded-2xl border p-3 text-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-canvas lg:flex-row lg:p-4 lg:text-left',
        isSelected
          ? 'border-brand bg-brand-soft'
          : 'border-line bg-surface hover:border-field-border hover:bg-elevated'
      )}
    >
      <div className="relative shrink-0">
        <Avatar src={resolveImageUrl(friend.avatar_url)} name={name} size="lg" />
        {isSelected && (
          <span className="absolute -bottom-1 -right-1 flex size-5 items-center justify-center rounded-full border-2 border-surface bg-brand text-on-brand">
            <Check size={11} strokeWidth={3} aria-hidden="true" />
          </span>
        )}
      </div>

      <div className="w-full min-w-0 flex-1 lg:w-auto">
        <p className="truncate text-sm font-semibold text-ink">{name}</p>
        {friend.username && (
          <p className="mt-0.5 truncate text-xs text-muted">@{friend.username.replace(/^@/, '')}</p>
        )}
        <p className={cn('mt-2 flex items-center justify-center gap-1.5 text-xs font-medium lg:justify-start', isSelected ? 'text-brand' : 'text-soft')}>
          <Bookmark size={13} aria-hidden="true" />
          <span>{picksLabel}</span>
        </p>
        {friend.locality && <p className="mt-1 truncate text-xs text-muted">{friend.locality}</p>}
      </div>

      <ChevronRight size={17} className={cn('absolute right-3 top-3 shrink-0 lg:static', isSelected ? 'text-brand' : 'text-muted group-hover:text-ink')} aria-hidden="true" />
    </button>
  )
}
