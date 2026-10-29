import { useState } from 'react'
import { Dialog } from '@/shared/ui/Dialog'
import { Button } from '@/shared/ui/Button'
import { EyeOff, ThumbsDown, UserX, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { communityApi } from '@/features/community/api/communityApi'

const FEEDBACK_OPTIONS = [
  {
    action: 'hide',
    icon: EyeOff,
    label: 'Hide this post',
    description: 'Stop seeing this particular recommendation or post.',
    reasons: ['Not interested', 'Already bought this', 'Irrelevant to me', 'Seen too many times'],
  },
  {
    action: 'less_like_this',
    icon: ThumbsDown,
    label: 'Show less like this',
    description: 'Tune your recommendations to see fewer similar items.',
    reasons: ['Too frequent', 'Not my style', 'Pricing too high', 'Other'],
  },
  {
    action: 'mute_author',
    icon: UserX,
    label: 'Mute this author',
    description: 'Do not show posts from this author in your public feed.',
    reasons: ['Spammy recommendations', 'Not interested in their content', 'Other'],
  },
  {
    action: 'mute_topic',
    icon: AlertTriangle,
    label: 'Report inappropriate content',
    description: 'Report content violating community discovery guidelines.',
    reasons: ['Spam or misleading', 'Inappropriate images or text', 'Commercial violation', 'Harassment'],
  },
]

export function FeedFeedbackModal({ isOpen, onClose, item, onFeedbackApplied }) {
  const [selectedAction, setSelectedAction] = useState(null)
  const [selectedReason, setSelectedReason] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState(null)

  if (!item) return null

  const handleActionSelect = (option) => {
    setSelectedAction(option)
    setSelectedReason(option.reasons[0])
  }

  const handleSubmit = async () => {
    if (!selectedAction) return
    setIsSubmitting(true)
    setError(null)

    try {
      await communityApi.feed.addFeedback({
        feed_item_id: item.feed_item_id,
        content_type: item.type,
        source_id: item.source_id,
        action: selectedAction.action,
        target_author_id: item.actor?.id || null,
        reason: selectedReason,
      })

      setSubmitted(true)
      setTimeout(() => {
        onFeedbackApplied?.(item.feed_item_id, selectedAction.action)
        handleClose()
      }, 900)
    } catch (err) {
      setError(err?.message || 'Failed to submit feedback.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setSelectedAction(null)
    setSelectedReason('')
    setSubmitted(false)
    setError(null)
    onClose()
  }

  return (
    <Dialog
      isOpen={isOpen}
      onClose={handleClose}
      title={submitted ? 'Preferences Updated' : 'Feed Preferences'}
      description={
        submitted
          ? 'Your feed will be customized based on your preference.'
          : 'Control what you discover in your JashoreBro public feed.'
      }
    >
      {submitted ? (
        <div className="flex flex-col items-center justify-center py-6 text-center space-y-2">
          <CheckCircle2 size={40} className="text-success animate-in zoom-in" />
          <p className="text-sm font-semibold text-ink">Thanks for tuning your feed!</p>
          <p className="text-xs text-muted">We will adjust what you see accordingly.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {error && (
            <div className="rounded-xl border border-danger/30 bg-danger-soft p-3 text-xs text-danger">
              {error}
            </div>
          )}

          {!selectedAction ? (
            <div className="space-y-2">
              {FEEDBACK_OPTIONS.map((opt) => {
                const Icon = opt.icon
                // Skip mute author if there is no author
                if (opt.action === 'mute_author' && !item.actor?.id) {
                  return null
                }
                return (
                  <button
                    key={opt.action}
                    type="button"
                    onClick={() => handleActionSelect(opt)}
                    className="flex w-full items-start gap-3 rounded-2xl border border-line bg-surface p-3 text-left transition hover:border-brand/40 hover:bg-brand/5 cursor-pointer"
                  >
                    <div className="mt-0.5 rounded-xl bg-field-bg p-2 text-soft">
                      <Icon size={18} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-ink">
                        {opt.action === 'mute_author' && item.actor?.name
                          ? `Mute ${item.actor.name}`
                          : opt.label}
                      </p>
                      <p className="text-xs text-muted">{opt.description}</p>
                    </div>
                  </button>
                )
              })}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="rounded-2xl border border-line bg-surface p-3">
                <p className="text-xs font-semibold text-ink mb-1">
                  Why are you choosing &ldquo;{selectedAction.label}&rdquo;?
                </p>
                <div className="mt-2 space-y-1.5">
                  {selectedAction.reasons.map((r) => (
                    <label
                      key={r}
                      className="flex items-center gap-2 rounded-xl p-2 text-xs text-soft hover:bg-field-bg cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="reason"
                        value={r}
                        checked={selectedReason === r}
                        onChange={(e) => setSelectedReason(e.target.value)}
                        className="text-brand focus:ring-0"
                      />
                      <span>{r}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setSelectedAction(null)}
                >
                  Back
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  isLoading={isSubmitting}
                  onClick={handleSubmit}
                >
                  Confirm
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </Dialog>
  )
}
