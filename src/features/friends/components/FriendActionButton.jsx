import { useState } from 'react'
import { UserCheck, UserPlus, Clock, X, Check, MoreHorizontal } from 'lucide-react'
import { Button } from '@/shared/ui/Button'
import { useFriends } from '../model/friendsContext'
import { useAuth } from '@/features/auth/model/authContext'
import { useNavigate } from 'react-router-dom'

export function FriendActionButton({
  userId,
  username,
  initialStatus = 'none',
  friendshipId: initialFriendshipId = null,
  onStatusChange,
  size = 'sm',
  className = '',
}) {
  const { isAuthenticated } = useAuth()
  const { sendRequest, acceptRequest, declineRequest, cancelRequest, unfriend } = useFriends()
  const navigate = useNavigate()

  const [status, setStatus] = useState(initialStatus)
  const [friendshipId, setFriendshipId] = useState(initialFriendshipId)
  const [isLoading, setIsLoading] = useState(false)
  const [showConfirmUnfriend, setShowConfirmUnfriend] = useState(false)

  if (status === 'self') {
    return null
  }

  const handleAction = async (actionType) => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }

    setIsLoading(true)
    try {
      if (actionType === 'send') {
        const res = await sendRequest({ recipient_id: userId, username })
        setStatus(res.relationship_status || 'pending_sent')
        if (res.friendship_id) setFriendshipId(res.friendship_id)
        onStatusChange?.(res.relationship_status || 'pending_sent')
      } else if (actionType === 'accept') {
        if (friendshipId) {
          const res = await acceptRequest(friendshipId)
          setStatus('friends')
          onStatusChange?.('friends')
        }
      } else if (actionType === 'decline') {
        if (friendshipId) {
          await declineRequest(friendshipId)
          setStatus('none')
          setFriendshipId(null)
          onStatusChange?.('none')
        }
      } else if (actionType === 'cancel') {
        if (friendshipId) {
          await cancelRequest(friendshipId)
          setStatus('none')
          setFriendshipId(null)
          onStatusChange?.('none')
        }
      } else if (actionType === 'unfriend') {
        await unfriend(userId)
        setStatus('none')
        setFriendshipId(null)
        setShowConfirmUnfriend(false)
        onStatusChange?.('none')
      }
    } catch (err) {
      alert(err.message || 'Action failed')
    } finally {
      setIsLoading(false)
    }
  }

  // State: ALREADY CONFIRMED FRIENDS
  if (status === 'friends') {
    if (showConfirmUnfriend) {
      return (
        <div className="flex items-center gap-1.5 animate-fadeIn">
          <Button
            variant="danger"
            size={size}
            isLoading={isLoading}
            onClick={() => handleAction('unfriend')}
            className="text-xs px-2.5 py-1 min-h-9"
          >
            Unfriend
          </Button>
          <button
            type="button"
            onClick={() => setShowConfirmUnfriend(false)}
            className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 cursor-pointer"
            title="Keep Friend"
          >
            <X size={15} />
          </button>
        </div>
      )
    }

    return (
      <div className="relative inline-flex items-center gap-1">
        <Button
          variant="secondary"
          size={size}
          className={`bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 text-xs font-semibold gap-1.5 min-h-9 ${className}`}
          onClick={() => setShowConfirmUnfriend(true)}
        >
          <UserCheck size={14} className="text-emerald-600" />
          <span>Friends</span>
          <MoreHorizontal size={13} className="text-slate-400 ml-0.5" />
        </Button>
      </div>
    )
  }

  // State: SENT REQUEST PENDING
  if (status === 'pending_sent') {
    return (
      <Button
        variant="outline"
        size={size}
        isLoading={isLoading}
        onClick={() => handleAction('cancel')}
        className={`text-slate-600 border-slate-200 hover:border-red-200 hover:bg-red-50 hover:text-red-600 text-xs gap-1.5 min-h-9 group transition-colors ${className}`}
        title="Click to cancel friend request"
      >
        <Clock size={14} className="group-hover:hidden text-amber-500" />
        <X size={14} className="hidden group-hover:inline text-red-500" />
        <span className="group-hover:hidden">Requested</span>
        <span className="hidden group-hover:inline">Cancel</span>
      </Button>
    )
  }

  // State: RECEIVED REQUEST PENDING
  if (status === 'pending_received') {
    return (
      <div className="flex items-center gap-1.5">
        <Button
          variant="drop-fire"
          size={size}
          isLoading={isLoading}
          onClick={() => handleAction('accept')}
          className="text-xs px-3 min-h-9"
        >
          <Check size={14} />
          <span>Accept</span>
        </Button>
        <Button
          variant="outline"
          size={size}
          disabled={isLoading}
          onClick={() => handleAction('decline')}
          className="text-xs px-2.5 min-h-9 text-slate-500 hover:text-red-600"
          title="Decline request"
        >
          <X size={14} />
        </Button>
      </div>
    )
  }

  // State: NO RELATIONSHIP (STRANGER)
  return (
    <Button
      variant="drop-fire"
      size={size}
      isLoading={isLoading}
      onClick={() => handleAction('send')}
      className={`text-xs gap-1.5 font-semibold min-h-9 ${className}`}
    >
      <UserPlus size={14} />
      <span>Add Friend</span>
    </Button>
  )
}
