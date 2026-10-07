import { Link } from 'react-router-dom'
import { MapPin, Users } from 'lucide-react'
import { Avatar } from '@/shared/ui/Avatar'
import { Card } from '@/shared/ui/Card'
import { FriendActionButton } from './FriendActionButton'

export function UserCard({ user, onActionComplete }) {
  if (!user) return null

  return (
    <Card className="p-4 flex items-center justify-between gap-3 hover:border-slate-300 transition-colors">
      <Link
        to={`/profile/${user.username}`}
        className="flex items-center gap-3 min-w-0 flex-1 group"
      >
        <Avatar name={user.name} size="lg" className="shrink-0 group-hover:ring-2 group-hover:ring-brand/30 transition-all" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <h4 className="text-sm font-semibold text-slate-900 truncate group-hover:text-brand transition-colors">
              {user.name}
            </h4>
          </div>
          <p className="text-xs text-slate-500 truncate">@{user.username}</p>
          <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-400">
            <span className="flex items-center gap-1 truncate">
              <MapPin size={11} className="shrink-0" />
              <span>{user.locality || 'Jashore'}</span>
            </span>
            {user.mutual_friends_count > 0 && (
              <span className="flex items-center gap-1 text-brand font-medium">
                <Users size={11} className="shrink-0" />
                <span>{user.mutual_friends_count} mutual</span>
              </span>
            )}
          </div>
        </div>
      </Link>

      <div className="shrink-0">
        <FriendActionButton
          userId={user.id}
          username={user.username}
          initialStatus={user.relationship_status || 'none'}
          friendshipId={user.friendship_id}
          onStatusChange={onActionComplete}
        />
      </div>
    </Card>
  )
}
