import { useState, useRef, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  Send,
  Image as ImageIcon,
  X,
  AlertCircle,
  HelpCircle,
  Sparkles,
  Tag,
  Repeat,
  MessageSquare,
  Lock,
} from 'lucide-react'
import { Button } from '@/shared/ui/Button'
import { useAuth } from '@/features/auth/model/authContext'
import { commentApi } from '../../api/commentApi'

const COMMENT_TYPES = [
  { id: 'general', label: 'Discussion', icon: MessageSquare, placeholder: 'Share your thoughts, tips, or experiences with this product...' },
  { id: 'experience', label: 'Real Experience', icon: Sparkles, placeholder: 'How did this product perform for you? Describe taste, quality, freshness, or durability...' },
  { id: 'question', label: 'Ask Question', icon: HelpCircle, placeholder: 'Ask the community or seller about ingredients, batch date, shelf life, or usage...' },
  { id: 'deal', label: 'Price / Deal', icon: Tag, placeholder: 'Suggest a fair price point or group-deal target for this item...' },
  { id: 'alternative', label: 'Alternative', icon: Repeat, placeholder: 'Know an alternative artisan choice? Share what makes it a good substitute...' },
]

export function CommentComposer({
  productId,
  parentId = null,
  replyToUsername = null,
  onCommentCreated,
  onCancelReply,
  autoFocus = false,
}) {
  const { user, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [content, setContent] = useState(replyToUsername ? `@${replyToUsername} ` : '')
  const [commentType, setCommentType] = useState('general')
  const [priceSuggestion, setPriceSuggestion] = useState('')
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const fileInputRef = useRef(null)
  const textareaRef = useRef(null)

  const isReply = Boolean(parentId)

  useEffect(() => {
    if (autoFocus && textareaRef.current) {
      textareaRef.current.focus()
      const len = textareaRef.current.value.length
      textareaRef.current.setSelectionRange(len, len)
    }
  }, [autoFocus])

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setError('Please choose a valid image file (JPEG, PNG, WebP).')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Attached image must be 5MB or less.')
      return
    }

    setError('')
    setImageFile(file)
    const reader = new FileReader()
    reader.onload = (event) => {
      setImagePreview(event.target.result)
    }
    reader.readAsDataURL(file)
  }

  const handleRemoveImage = () => {
    setImageFile(null)
    setImagePreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!isAuthenticated) {
      navigate('/auth', { state: { from: location } })
      return
    }

    const trimmed = content.trim()
    if (!trimmed) {
      setError('Please write something before posting.')
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      const payload = {
        content: trimmed,
        comment_type: isReply ? 'general' : commentType,
        parent_id: parentId,
        price_suggestion: commentType === 'deal' && priceSuggestion ? Number(priceSuggestion) : null,
      }

      const created = await commentApi.addComment(productId, payload, imageFile)
      setContent('')
      setImageFile(null)
      setImagePreview(null)
      setPriceSuggestion('')
      if (fileInputRef.current) fileInputRef.current.value = ''
      onCommentCreated?.(created)
    } catch (err) {
      setError(err.message || 'Failed to submit comment. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 text-center space-y-2 min-w-0 max-w-full">
        <div className="size-8 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20 flex items-center justify-center mx-auto">
          <Lock size={16} />
        </div>
        <div>
          <p className="text-xs font-bold text-white">Join the Community Discussion</p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Log in to share real feedback, ask questions, or negotiate deals with Jashore neighbors.
          </p>
        </div>
        <Button
          type="button"
          size="sm"
          onClick={() => navigate('/auth', { state: { from: location } })}
          className="bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold px-3.5 h-7.5 rounded-xl"
        >
          Sign In to Comment
        </Button>
      </div>
    )
  }

  const activePlaceholder =
    COMMENT_TYPES.find((t) => t.id === commentType)?.placeholder || 'Write your comment...'

  return (
    <form
      onSubmit={handleSubmit}
      className={`rounded-2xl border transition-all min-w-0 max-w-full ${
        isReply
          ? 'bg-slate-950/80 border-slate-800 p-2.5 mt-2'
          : 'bg-slate-900 border-slate-800/90 p-3 sm:p-3.5 shadow-xs'
      }`}
    >
      {error && (
        <div className="p-2 mb-2.5 rounded-xl bg-red-950/80 border border-red-500/40 text-red-200 text-xs flex items-center gap-2">
          <AlertCircle size={14} className="shrink-0 text-red-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Reply Banner */}
      {isReply && (
        <div className="flex items-center justify-between mb-2 text-xs text-slate-400">
          <span>Replying to <span className="font-bold text-orange-400">@{replyToUsername}</span></span>
          <button
            type="button"
            onClick={onCancelReply}
            className="text-[11px] text-slate-500 hover:text-white"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Comment Intent Type Selector (Root Comments Only) */}
      {!isReply && (
        <div className="flex items-center gap-1 overflow-x-auto pb-2 mb-2 border-b border-slate-800/80 scrollbar-none min-w-0">
          {COMMENT_TYPES.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setCommentType(id)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold shrink-0 transition-colors ${
                commentType === id
                  ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                  : 'bg-slate-950/60 text-slate-400 border border-slate-800/80 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Icon size={12} />
              <span>{label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Price Suggestion Input for Deal comments */}
      {!isReply && commentType === 'deal' && (
        <div className="mb-2 p-2 rounded-xl bg-slate-950 border border-orange-500/30 flex items-center gap-2 min-w-0">
          <Tag size={14} className="text-orange-400 shrink-0" />
          <span className="text-xs font-bold text-slate-300 shrink-0">Suggested Price: ৳</span>
          <input
            type="number"
            min="0"
            step="1"
            placeholder="e.g. 600"
            value={priceSuggestion}
            onChange={(e) => setPriceSuggestion(e.target.value)}
            className="bg-transparent text-white font-mono text-xs w-24 focus:outline-none placeholder:text-slate-600"
          />
        </div>
      )}

      {/* Textarea Input */}
      <div className="relative min-w-0">
        <textarea
          ref={textareaRef}
          rows={isReply ? 2 : 3}
          maxLength={2000}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={isReply ? `Write a reply to @${replyToUsername}...` : activePlaceholder}
          className="w-full bg-slate-950 border border-slate-800/80 rounded-xl p-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-orange-500/60 transition-colors resize-none leading-relaxed"
        />

        {/* Image Attachment Preview */}
        {imagePreview && (
          <div className="relative inline-block mt-1.5 mb-1">
            <img
              src={imagePreview}
              alt="Preview"
              className="h-16 w-20 object-cover rounded-xl border border-slate-700 bg-slate-950 shadow-md"
            />
            <button
              type="button"
              onClick={handleRemoveImage}
              className="absolute -top-1.5 -right-1.5 size-5 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg hover:bg-red-500"
            >
              <X size={12} />
            </button>
          </div>
        )}
      </div>

      {/* Composer Bottom Toolbar */}
      <div className="flex items-center justify-between pt-2 mt-1 border-t border-slate-800/60 gap-2 min-w-0">
        <div className="flex items-center gap-1.5 min-w-0">
          {/* Photo Attachment Trigger */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            title="Attach a photo"
            className="flex items-center gap-1 px-2 py-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 text-[11px] transition-colors shrink-0"
          >
            <ImageIcon size={14} />
            <span>Add Photo</span>
          </button>

          <span className="text-[10px] text-slate-500 font-mono">
            {content.length}/2000
          </span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {isReply && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onCancelReply}
              className="h-7 px-2 text-[11px] text-slate-400 hover:text-white"
            >
              Cancel
            </Button>
          )}

          <Button
            type="submit"
            size="sm"
            disabled={isSubmitting || !content.trim()}
            className="bg-orange-600 hover:bg-orange-500 text-white text-[11px] font-bold h-7 px-3 rounded-lg flex items-center gap-1 shadow-xs"
          >
            <Send size={12} className={isSubmitting ? 'animate-pulse' : ''} />
            <span>{isSubmitting ? 'Posting...' : isReply ? 'Reply' : 'Post'}</span>
          </Button>
        </div>
      </div>
    </form>
  )
}
