import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { MoreHorizontal, EyeOff, ThumbsDown, UserX, AlertTriangle, MapPin, Sparkles } from 'lucide-react'
import { Avatar } from '@/shared/ui/Avatar'
import { Badge } from '@/shared/ui/Badge'
import { formatRelativeTime } from '@/shared/lib/formatDate'

export function FeedCardShell({
  item,
  children,
  onOpenFeedback,
  className = '',
}) {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false)
      }
    }
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [menuOpen])

  const actor = item.actor
  const reason = item.reason
  const publishedAt = item.published_at

  // Determine badge styling based on reason
  const getBadgeVariant = () => {
    if (item.type === 'drop') return 'fire'
    if (item.type === 'discussion') return 'info'
    if (reason?.includes('Friend')) return 'unlocked'
    if (reason?.includes('Curator')) return 'brand'
    return 'default'
  }

  return (
    <article
      className={`group relative overflow-hidden rounded-3xl border border-line bg-surface p-5 sm:p-6 transition-all duration-200 hover:border-line-hover hover:shadow-lg hover:shadow-black/10 ${className}`}
      data-feed-item-id={item.feed_item_id}
      data-content-type={item.type}
    >
      {/* ─── Top Bar: Reason Banner & Overflow Menu ─── */}
      <div className="mb-4 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {reason && (
            <Badge variant={getBadgeVariant()} size="sm" className="font-medium tracking-tight">
              {reason}
            </Badge>
          )}
          {item.social_context?.is_featured && (
            <Badge variant="fire" size="sm" className="gap-1">
              <Sparkles size={11} /> Featured
            </Badge>
          )}
        </div>

        {/* Overflow Menu */}
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="More actions"
            className="flex size-8 items-center justify-center rounded-full text-muted transition hover:bg-field-bg hover:text-ink cursor-pointer"
          >
            <MoreHorizontal size={17} />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-9 z-30 w-48 overflow-hidden rounded-2xl border border-line bg-surface py-1.5 shadow-xl backdrop-blur-md animate-in fade-in zoom-in-95">
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false)
                  onOpenFeedback?.(item, 'hide')
                }}
                className="flex w-full items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-ink transition hover:bg-field-bg cursor-pointer"
              >
                <EyeOff size={14} className="text-muted" />
                <span>Hide this card</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false)
                  onOpenFeedback?.(item, 'less_like_this')
                }}
                className="flex w-full items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-ink transition hover:bg-field-bg cursor-pointer"
              >
                <ThumbsDown size={14} className="text-muted" />
                <span>Less like this</span>
              </button>
              {actor?.id && (
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false)
                    onOpenFeedback?.(item, 'mute_author')
                  }}
                  className="flex w-full items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-ink transition hover:bg-field-bg cursor-pointer"
                >
                  <UserX size={14} className="text-muted" />
                  <span>Mute {actor.name || 'author'}</span>
                </button>
              )}
              <div className="my-1 border-t border-line" />
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false)
                  onOpenFeedback?.(item, 'report')
                }}
                className="flex w-full items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-danger transition hover:bg-danger-soft cursor-pointer"
              >
                <AlertTriangle size={14} />
                <span>Report</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ─── Author Strip ─── */}
      {actor && actor.name && (
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <Link
              to={actor.username ? `/profile/${encodeURIComponent(actor.username)}` : '#'}
              className="shrink-0 transition-opacity hover:opacity-85"
            >
              <Avatar
                src={actor.avatar_url}
                name={actor.name}
                size="md"
              />
            </Link>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <Link
                  to={actor.username ? `/profile/${encodeURIComponent(actor.username)}` : '#'}
                  className="truncate text-sm font-semibold text-ink hover:underline"
                >
                  {actor.name}
                </Link>
                {actor.is_friend && (
                  <span className="rounded-full bg-success/15 px-1.5 py-0.2 text-[10px] font-semibold text-success">
                    Friend
                  </span>
                )}
                {actor.is_verified && (
                  <span className="rounded-full bg-brand/15 px-1.5 py-0.2 text-[10px] font-semibold text-brand">
                    Verified
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-xs text-muted">
                {actor.locality && (
                  <span className="flex items-center gap-0.5 truncate">
                    <MapPin size={11} className="shrink-0" />
                    {actor.locality}
                  </span>
                )}
                {actor.locality && publishedAt && <span>&bull;</span>}
                {publishedAt && <span>{formatRelativeTime(publishedAt)}</span>}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── Card Body Slot ─── */}
      <div className="relative">
        {children}
      </div>
    </article>
  )
}
