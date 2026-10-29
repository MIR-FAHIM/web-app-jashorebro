import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  CheckCircle2,
  CornerDownRight,
  Edit2,
  Trash2,
  Flag,
  Pin,
  Sparkles,
  HelpCircle,
  Tag,
  Repeat,
  MessageSquare,
  ExternalLink,
  MoreVertical,
  X,
} from 'lucide-react'
import { Avatar } from '@/shared/ui/Avatar'
import { Badge } from '@/shared/ui/Badge'
import { Button } from '@/shared/ui/Button'
import { formatCurrency } from '@/shared/lib/formatCurrency'
import { resolveImageUrl } from '@/shared/lib/mediaUrl'
import { useAuth } from '@/features/auth/model/authContext'
import { ReactionButtonsBar } from './ReactionButtonsBar'
import { CommentComposer } from './CommentComposer'
import { ReportCommentModal } from './ReportCommentModal'
import { commentApi } from '../../api/commentApi'

const TYPE_CONFIG = {
  experience: { label: 'Real Experience', icon: Sparkles, badgeClass: 'bg-amber-500/15 text-amber-400 border-amber-500/30' },
  question: { label: 'Question', icon: HelpCircle, badgeClass: 'bg-blue-500/15 text-blue-400 border-blue-500/30' },
  deal: { label: 'Deal Suggestion', icon: Tag, badgeClass: 'bg-orange-500/15 text-orange-400 border-orange-500/30' },
  alternative: { label: 'Alternative Pick', icon: Repeat, badgeClass: 'bg-purple-500/15 text-purple-400 border-purple-500/30' },
  general: { label: 'Discussion', icon: MessageSquare, badgeClass: 'bg-slate-800 text-slate-400 border-slate-700' },
}

/**
 * Helper to render text with highlighted @username mentions.
 */
function FormattedContent({ text }) {
  if (!text) return null
  const parts = text.split(/(@[A-Za-z0-9_]+)/g)

  return (
    <span className="whitespace-pre-line leading-relaxed">
      {parts.map((part, idx) => {
        if (part.startsWith('@')) {
          const username = part.slice(1)
          return (
            <Link
              key={idx}
              to={`/users/${username}`}
              className="font-bold text-orange-400 hover:underline hover:text-orange-300"
            >
              {part}
            </Link>
          )
        }
        return part
      })}
    </span>
  )
}

export function CommentCard({
  comment,
  productId,
  onCommentUpdated,
  onCommentDeleted,
  onReplyAdded,
}) {
  const { user } = useAuth()

  const [isReplying, setIsReplying] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState(comment.content || '')
  const [isSavingEdit, setIsSavingEdit] = useState(false)
  const [isReportModalOpen, setIsReportModalOpen] = useState(false)
  const [targetReportComment, setTargetReportComment] = useState(null)
  const [activeReaction, setActiveReaction] = useState(comment.user_reaction)
  const [reactionCounts, setReactionCounts] = useState(comment.reaction_counts || {})
  const [selectedPhotoPreview, setSelectedPhotoPreview] = useState(null)

  const isAuthor = user && comment.user?.id === user.id
  const canModerate = isAuthor || (user && user.roles?.some((r) => ['admin', 'super_admin'].includes(r.name)))

  const typeMeta = TYPE_CONFIG[comment.comment_type] || TYPE_CONFIG.general
  const TypeIcon = typeMeta.icon

  // Format timestamp
  const formatTime = (isoString) => {
    if (!isoString) return ''
    try {
      const date = new Date(isoString)
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      })
    } catch {
      return ''
    }
  }

  const handleSaveEdit = async () => {
    if (!editContent.trim()) return
    setIsSavingEdit(true)
    try {
      const updated = await commentApi.updateComment(comment.id, editContent.trim())
      setIsEditing(false)
      onCommentUpdated?.(updated)
    } catch (err) {
      alert(err.message || 'Failed to update comment.')
    } finally {
      setIsSavingEdit(false)
    }
  }

  const handleDelete = async (targetId = comment.id) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return
    try {
      await commentApi.deleteComment(targetId)
      onCommentDeleted?.(targetId)
    } catch (err) {
      alert(err.message || 'Failed to delete comment.')
    }
  }

  const handleOpenReport = (targetComment) => {
    setTargetReportComment(targetComment)
    setIsReportModalOpen(true)
  }

  return (
    <div className="rounded-2xl bg-slate-900 border border-slate-800/80 p-3.5 space-y-3 transition-colors min-w-0 max-w-full overflow-hidden">
      {/* Author and Metadata Header */}
      <div className="flex items-start justify-between gap-2 min-w-0">
        <div className="flex items-start gap-2.5 min-w-0 flex-1">
          <Link to={`/users/${comment.user?.username}`} className="shrink-0 group mt-0.5">
            <Avatar
              src={resolveImageUrl(comment.user?.avatar_url)}
              name={comment.user?.name}
              size="sm"
              className="border border-slate-700/80 group-hover:border-orange-500 transition-colors"
            />
          </Link>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <Link
                to={`/users/${comment.user?.username}`}
                className="font-bold text-xs text-white hover:text-orange-400 transition-colors truncate max-w-[130px]"
              >
                {comment.user?.name}
              </Link>
              <span className="text-[10px] text-slate-500 font-mono">
                @{comment.user?.username}
              </span>

              {/* Verified Purchase Badge */}
              {comment.is_verified_purchase && (
                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  <CheckCircle2 size={10} />
                  <span>Verified</span>
                </span>
              )}

              {/* Intent Badge */}
              {comment.comment_type && comment.comment_type !== 'general' && (
                <span
                  className={`inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-full text-[9px] font-bold border ${typeMeta.badgeClass}`}
                >
                  <TypeIcon size={10} />
                  <span>{typeMeta.label}</span>
                </span>
              )}

              {comment.is_pinned && (
                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-orange-500/15 text-orange-400 border border-orange-500/30">
                  <Pin size={10} />
                  <span>Pinned</span>
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5 mt-0.5 text-[10px] text-slate-500">
              <span>{formatTime(comment.created_at)}</span>
              {comment.edited_at && <span className="italic">(edited)</span>}
              {comment.user?.locality && (
                <>
                  <span>•</span>
                  <span className="truncate max-w-[90px]">{comment.user.locality}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-0.5 shrink-0">
          {canModerate && !isEditing && (
            <>
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                title="Edit Comment"
                className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <Edit2 size={13} />
              </button>
              <button
                type="button"
                onClick={() => handleDelete(comment.id)}
                title="Delete Comment"
                className="p-1 rounded-md text-slate-400 hover:text-red-400 hover:bg-red-950/40 transition-colors"
              >
                <Trash2 size={13} />
              </button>
            </>
          )}

          <button
            type="button"
            onClick={() => handleOpenReport(comment)}
            title="Report Comment"
            className="p-1 rounded-md text-slate-500 hover:text-amber-400 hover:bg-slate-800 transition-colors"
          >
            <Flag size={13} />
          </button>
        </div>
      </div>

      {/* Comment Body */}
      {isEditing ? (
        <div className="space-y-2 pt-1 min-w-0">
          <textarea
            rows={3}
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-orange-500 resize-none"
          />
          <div className="flex items-center justify-end gap-1.5">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsEditing(false)}
              className="text-xs text-slate-400 h-7 px-2"
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={isSavingEdit}
              onClick={handleSaveEdit}
              className="bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold px-3 h-7"
            >
              Save
            </Button>
          </div>
        </div>
      ) : (
        <div className="text-xs text-slate-200 break-words leading-relaxed overflow-hidden">
          <FormattedContent text={comment.content} />
        </div>
      )}

      {/* Suggested Price Pill for Deal comments */}
      {comment.price_suggestion && (
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-orange-500/10 border border-orange-500/30 text-[11px] font-bold text-orange-400 min-w-0">
          <Tag size={12} />
          <span>Suggested Price: {formatCurrency(comment.price_suggestion)}</span>
        </div>
      )}

      {/* Attached Image Thumbnail */}
      {comment.attachment_url && (
        <div className="pt-0.5">
          <img
            src={resolveImageUrl(comment.attachment_url)}
            alt="Comment Attachment"
            onClick={() => setSelectedPhotoPreview(resolveImageUrl(comment.attachment_url))}
            className="max-h-48 max-w-full object-cover rounded-xl border border-slate-800 cursor-zoom-in hover:opacity-95 transition-opacity bg-slate-950"
          />
        </div>
      )}

      {/* Alternative Product Recommendation Card */}
      {comment.alternative_product && (
        <Link
          to={`/products/${comment.alternative_product.slug || comment.alternative_product.id}`}
          className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-950 border border-purple-500/30 hover:border-purple-500/60 transition-colors group min-w-0"
        >
          {comment.alternative_product.image_url ? (
            <img
              src={resolveImageUrl(comment.alternative_product.image_url)}
              alt={comment.alternative_product.title}
              className="size-11 rounded-lg object-cover bg-slate-900 border border-slate-800 shrink-0"
            />
          ) : (
            <div className="size-11 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center shrink-0">
              <Repeat size={16} />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold text-purple-400 flex items-center gap-1">
              <span>Alternative Choice</span>
              <ExternalLink size={10} />
            </p>
            <p className="font-bold text-xs text-white truncate group-hover:text-purple-300">
              {comment.alternative_product.title}
            </p>
            <p className="text-[11px] font-bold text-emerald-400 mt-0.5">
              {formatCurrency(comment.alternative_product.base_price)}
            </p>
          </div>
        </Link>
      )}

      {/* Reactions and Reply Toolbar */}
      <div className="flex items-center justify-between gap-1.5 pt-2 border-t border-slate-800/60 min-w-0">
        <div className="min-w-0 flex-1 overflow-x-auto scrollbar-none py-0.5">
          <ReactionButtonsBar
            commentId={comment.id}
            userReaction={activeReaction}
            reactionCounts={reactionCounts}
            onReactionChange={(newReaction, newCounts) => {
              setActiveReaction(newReaction)
              setReactionCounts(newCounts)
            }}
          />
        </div>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setIsReplying((prev) => !prev)}
          className="h-7 px-2 text-[11px] font-bold text-slate-400 hover:text-orange-400 hover:bg-slate-800 shrink-0"
        >
          <CornerDownRight size={12} className="mr-1" />
          <span>Reply</span>
        </Button>
      </div>

      {/* Inline Reply Composer */}
      {isReplying && (
        <CommentComposer
          productId={productId}
          parentId={comment.id}
          replyToUsername={comment.user?.username}
          autoFocus
          onCommentCreated={(newReply) => {
            setIsReplying(false)
            onReplyAdded?.(comment.id, newReply)
          }}
          onCancelReply={() => setIsReplying(false)}
        />
      )}

      {/* Nested Direct Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="border-l-2 border-slate-800/90 pl-2.5 pt-1 mt-2.5 space-y-2 min-w-0">
          {comment.replies.map((reply) => {
            const isReplyAuthor = user && reply.user?.id === user.id
            const canModerateReply =
              isReplyAuthor || (user && user.roles?.some((r) => ['admin', 'super_admin'].includes(r.name)))

            return (
              <div
                key={reply.id}
                className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/60 space-y-1.5 min-w-0"
              >
                {/* Reply Author */}
                <div className="flex items-center justify-between gap-2 min-w-0">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <Avatar
                      src={resolveImageUrl(reply.user?.avatar_url)}
                      name={reply.user?.name}
                      size="xs"
                      className="border border-slate-700 shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-bold text-xs text-white truncate max-w-[110px]">{reply.user?.name}</span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          @{reply.user?.username}
                        </span>
                        {reply.is_verified_purchase && (
                          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                            <CheckCircle2 size={9} />
                            <span>Verified</span>
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-500">
                        {formatTime(reply.created_at)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-0.5 shrink-0">
                    {canModerateReply && (
                      <button
                        type="button"
                        onClick={() => handleDelete(reply.id)}
                        className="p-1 rounded text-slate-500 hover:text-red-400"
                      >
                        <Trash2 size={12} />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleOpenReport(reply)}
                      className="p-1 rounded text-slate-500 hover:text-amber-400"
                    >
                      <Flag size={12} />
                    </button>
                  </div>
                </div>

                {/* Reply Content */}
                <div className="text-[11px] text-slate-300 break-words leading-relaxed overflow-hidden">
                  <FormattedContent text={reply.content} />
                </div>

                {/* Reply Reactions */}
                <div className="pt-0.5 min-w-0">
                  <ReactionButtonsBar
                    commentId={reply.id}
                    userReaction={reply.user_reaction}
                    reactionCounts={reply.reaction_counts}
                  />
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Image Lightbox Modal */}
      {selectedPhotoPreview && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => setSelectedPhotoPreview(null)}
        >
          <div className="relative max-w-3xl max-h-[90vh]">
            <img
              src={selectedPhotoPreview}
              alt="Enlarged attachment"
              className="max-h-[85vh] max-w-full rounded-2xl shadow-2xl object-contain border border-slate-700"
            />
            <button
              type="button"
              onClick={() => setSelectedPhotoPreview(null)}
              className="absolute -top-3 -right-3 size-8 rounded-full bg-slate-900 border border-slate-700 text-white flex items-center justify-center shadow-lg"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Report Modal */}
      <ReportCommentModal
        isOpen={isReportModalOpen}
        onClose={() => {
          setIsReportModalOpen(false)
          setTargetReportComment(null)
        }}
        comment={targetReportComment}
      />
    </div>
  )
}
