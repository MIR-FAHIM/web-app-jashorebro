import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/features/auth/model/authContext'
import { commentApi } from '../../api/commentApi'

const REACTION_CONFIG = [
  {
    type: 'like',
    emoji: '👍',
    label: 'Like',
    activeStyles: 'bg-blue-500/20 text-blue-400 border-blue-500/40 shadow-sm shadow-blue-500/10',
    hoverStyles: 'hover:bg-blue-500/10 hover:text-blue-300',
  },
  {
    type: 'helpful',
    emoji: '💡',
    label: 'Helpful',
    activeStyles: 'bg-amber-500/20 text-amber-400 border-amber-500/40 shadow-sm shadow-amber-500/10',
    hoverStyles: 'hover:bg-amber-500/10 hover:text-amber-300',
  },
  {
    type: 'agree',
    emoji: '🤝',
    label: 'Agree',
    activeStyles: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 shadow-sm shadow-emerald-500/10',
    hoverStyles: 'hover:bg-emerald-500/10 hover:text-emerald-300',
  },
  {
    type: 'need_details',
    emoji: '🔍',
    label: 'Need Info',
    activeStyles: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/40 shadow-sm shadow-indigo-500/10',
    hoverStyles: 'hover:bg-indigo-500/10 hover:text-indigo-300',
  },
  {
    type: 'good_deal',
    emoji: '🏷️',
    label: 'Good Deal',
    activeStyles: 'bg-orange-500/20 text-orange-400 border-orange-500/40 shadow-sm shadow-orange-500/10',
    hoverStyles: 'hover:bg-orange-500/10 hover:text-orange-300',
  },
]

export function ReactionButtonsBar({
  commentId,
  userReaction = null,
  reactionCounts = {},
  onReactionChange,
}) {
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleReactionClick = async (reactionType) => {
    if (!isAuthenticated) {
      navigate('/auth', { state: { from: location } })
      return
    }

    if (isSubmitting) return

    // Snapshot previous state for rollback
    const prevReaction = userReaction
    const prevCounts = { ...reactionCounts }

    // Compute optimistic state
    let nextReaction = reactionType
    const nextCounts = { ...reactionCounts }

    if (prevReaction === reactionType) {
      // Toggle off
      nextReaction = null
      nextCounts[reactionType] = Math.max((nextCounts[reactionType] || 0) - 1, 0)
    } else {
      if (prevReaction) {
        nextCounts[prevReaction] = Math.max((nextCounts[prevReaction] || 0) - 1, 0)
      }
      nextCounts[reactionType] = (nextCounts[reactionType] || 0) + 1
    }

    // Apply optimistic update immediately
    onReactionChange?.(nextReaction, nextCounts)
    setIsSubmitting(true)

    try {
      const res = await commentApi.toggleReaction(commentId, reactionType)
      if (res && res.data) {
        onReactionChange?.(res.data.user_reaction, res.data.reaction_counts)
      }
    } catch {
      // Rollback on failure
      onReactionChange?.(prevReaction, prevCounts)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex items-center gap-1 flex-wrap min-w-0">
      {REACTION_CONFIG.map(({ type, emoji, label, activeStyles, hoverStyles }) => {
        const isActive = userReaction === type
        const count = reactionCounts[type] || 0

        return (
          <button
            key={type}
            type="button"
            onClick={() => handleReactionClick(type)}
            title={label}
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border transition-all duration-150 select-none shrink-0 ${
              isActive
                ? `${activeStyles} scale-105`
                : `bg-slate-950/70 border-slate-800 text-slate-400 ${hoverStyles}`
            }`}
          >
            <span className="text-xs leading-none">{emoji}</span>
            {count > 0 && (
              <span
                className={`text-[10px] px-1 rounded-full font-mono font-bold ${
                  isActive ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-300'
                }`}
              >
                {count}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
