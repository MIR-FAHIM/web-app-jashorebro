import { Link } from 'react-router-dom'
import { MapPin, Users } from 'lucide-react'
import { Avatar } from '@/shared/ui/Avatar'
import { Card } from '@/shared/ui/Card'
import { FriendActionButton } from './FriendActionButton'
import { resolveImageUrl } from '@/shared/lib/mediaUrl'

export function UserCard({ user, onActionComplete }) {
  if (!user) return null

  const targetUser = user.user || user
  const rawAvatar =
    targetUser.avatar_url ||
    targetUser.avatar ||
    targetUser.avatar_path ||
    targetUser.profile?.avatar_url ||
    targetUser.profile?.avatar_path ||
    targetUser.profile?.avatar ||
    targetUser.profile_photo_url ||
    targetUser.profile_photo_path ||
    targetUser.image

  const avatarSrc = resolveImageUrl(rawAvatar)

  return (
    <Card className="p-4 flex items-center justify-between gap-3 hover:border-brand/40 transition-colors">
      <Link
        to={`/profile/${targetUser.username}`}
        className="flex items-center gap-3 min-w-0 flex-1 group"
      >
        <Avatar
          name={targetUser.name}
          src={avatarSrc}
          size="lg"
          className="shrink-0 group-hover:ring-2 group-hover:ring-brand/30 transition-all"
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <h4 className="text-sm font-semibold text-white truncate group-hover:text-brand transition-colors">
              {targetUser.name}
            </h4>
          </div>
          <p className="text-xs text-slate-400 truncate">@{targetUser.username}</p>
          <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-400">
            <span className="flex items-center gap-1 truncate">
              <MapPin size={11} className="shrink-0 text-slate-400" />
              <span>{targetUser.locality || targetUser.profile?.locality || 'Jashore'}</span>
            </span>
            {targetUser.mutual_friends_count > 0 && (
              <span className="flex items-center gap-1 text-brand font-medium">
                <Users size={11} className="shrink-0" />
                <span>{targetUser.mutual_friends_count} mutual</span>
              </span>
            )}
          </div>
        </div>
      </Link>

      <div className="shrink-0">
        <FriendActionButton
          userId={targetUser.id}
          username={targetUser.username}
          initialStatus={targetUser.relationship_status || 'none'}
          friendshipId={targetUser.friendship_id || user.friendship_id}
          onStatusChange={onActionComplete}
        />
      </div>
    </Card>
  )
}

