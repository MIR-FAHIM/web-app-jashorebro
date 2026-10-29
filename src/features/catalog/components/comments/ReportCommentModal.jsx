import { useState } from 'react'
import { AlertCircle, Flag, Check, ShieldAlert } from 'lucide-react'
import { Dialog } from '@/shared/ui/Dialog'
import { Button } from '@/shared/ui/Button'
import { commentApi } from '../../api/commentApi'

const REASONS = [
  { id: 'spam', label: 'Spam or Commercial Promotion', desc: 'Repetitive advertising, links, or bot content' },
  { id: 'abuse', label: 'Abuse or Harassment', desc: 'Disrespectful language, threats, or hate speech' },
  { id: 'misleading', label: 'Misleading Information', desc: 'False claims about ingredients, origins, or prices' },
  { id: 'off_topic', label: 'Off-Topic Content', desc: 'Unrelated to this product or artisan offering' },
  { id: 'other', label: 'Other Guideline Violation', desc: 'Other concerns needing moderation review' },
]

export function ReportCommentModal({ isOpen, onClose, comment, onReported }) {
  const [selectedReason, setSelectedReason] = useState('spam')
  const [description, setDescription] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)

  if (!comment) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    try {
      await commentApi.reportComment(comment.id, {
        reason: selectedReason,
        description: description.trim(),
      })
      setIsSuccess(true)
      onReported?.()
      setTimeout(() => {
        setIsSuccess(false)
        setDescription('')
        onClose()
      }, 1500)
    } catch (err) {
      setError(err.message || 'Failed to submit report. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setError('')
    setIsSuccess(false)
    setDescription('')
    onClose()
  }

  return (
    <Dialog
      isOpen={isOpen}
      onClose={handleClose}
      title="Report Comment"
      description="Help maintain a helpful and authentic discussion space for the Jashore community."
      className="max-w-md"
    >
      {isSuccess ? (
        <div className="py-8 text-center space-y-3">
          <div className="size-12 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto">
            <Check size={24} />
          </div>
          <h4 className="font-bold text-white text-sm">Thank You for Your Report</h4>
          <p className="text-xs text-slate-400">
            Our moderation team will review this comment against community standards.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 pt-2 text-xs">
          {error && (
            <div className="p-3 rounded-xl bg-red-950/80 border border-red-500/40 text-red-200 flex items-center gap-2">
              <AlertCircle size={15} className="shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Comment Preview Quote */}
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-300">
            <p className="text-[11px] font-bold text-slate-400 mb-1">Reported Comment by @{comment.user?.username}:</p>
            <p className="italic text-slate-300 line-clamp-2">"{comment.content}"</p>
          </div>

          {/* Reason Selection */}
          <div className="space-y-2">
            <label className="block font-bold text-slate-200">Select Reason</label>
            <div className="space-y-1.5">
              {REASONS.map((r) => (
                <label
                  key={r.id}
                  className={`flex items-start gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-colors ${
                    selectedReason === r.id
                      ? 'bg-orange-500/10 border-orange-500/40 text-white'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:bg-slate-900'
                  }`}
                >
                  <input
                    type="radio"
                    name="reportReason"
                    value={r.id}
                    checked={selectedReason === r.id}
                    onChange={(e) => setSelectedReason(e.target.value)}
                    className="mt-0.5 text-orange-500 focus:ring-0"
                  />
                  <div>
                    <p className="font-semibold text-xs text-slate-200">{r.label}</p>
                    <p className="text-[11px] text-slate-500">{r.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Optional Details */}
          <div>
            <label className="block font-bold text-slate-300 mb-1">Additional Context (Optional)</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide more details if helpful for our moderators..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white placeholder:text-slate-600 focus:outline-none focus:border-orange-500 resize-none text-xs"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-800">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClose}
              disabled={isSubmitting}
              className="text-slate-400 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting}
              className="bg-red-600 hover:bg-red-500 text-white font-bold flex items-center gap-1.5"
            >
              <Flag size={14} />
              <span>{isSubmitting ? 'Submitting...' : 'Submit Report'}</span>
            </Button>
          </div>
        </form>
      )}
    </Dialog>
  )
}
