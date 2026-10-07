import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { MapPin, Users, Share2, Flame, ArrowUpRight, Bookmark, ShieldCheck, AlertCircle } from 'lucide-react'
import { Card } from '@/shared/ui/Card'
import { Badge } from '@/shared/ui/Badge'
import { Button } from '@/shared/ui/Button'
import { Avatar } from '@/shared/ui/Avatar'
import { FriendActionButton } from '@/features/friends/components/FriendActionButton'
import { friendsApi } from '@/features/friends/api/friendsApi'
import { useAuth } from '@/features/auth/model/authContext'
import { MOCK_DROPS } from '../mockCatalog'
import { formatCurrency } from '@/shared/lib/formatCurrency'

export default function UserProfilePage() {
  const { username } = useParams()
  const cleanUsername = (username || '').replace(/^@/, '')
  const navigate = useNavigate()
  const { user: authUser } = useAuth()

  const [profileData, setProfileData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('shelf')
  const [copiedMsg, setCopiedMsg] = useState('')

  useEffect(() => {
    let isMounted = true
    setIsLoading(true)
    setError('')

    friendsApi.getUserProfile(cleanUsername)
      .then((data) => {
        if (isMounted) setProfileData(data)
      })
      .catch((err) => {
        if (isMounted) setError(err.message || 'User not found')
      })
      .finally(() => {
        if (isMounted) setIsLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [cleanUsername])

  const isSelf = authUser && authUser.username === cleanUsername

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopiedMsg('Profile link copied!')
      setTimeout(() => setCopiedMsg(''), 2500)
    } catch {
      setCopiedMsg('Copy the URL to share')
    }
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl py-16 text-center text-sm text-slate-400">
        Loading user profile...
      </div>
    )
  }

  if (error || !profileData) {
    return (
      <Card className="mx-auto max-w-md p-8 text-center space-y-4">
        <div className="size-12 mx-auto rounded-2xl bg-red-100 flex items-center justify-center text-red-600">
          <AlertCircle size={24} />
        </div>
        <h2 className="text-lg font-bold text-slate-900">Profile Unavailable</h2>
        <p className="text-xs text-slate-500">
          @{cleanUsername} could not be found or has not set up their public profile yet.
        </p>
        <Button variant="outline" onClick={() => navigate('/friends?tab=discover')}>
          Find Friends
        </Button>
      </Card>
    )
  }

  // Filter sample drops attributed to this user or sample shelf
  const sampleShelf = MOCK_DROPS.slice(0, 3)

  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-12">
      {/* ─── Profile Header Card (Instagram / Threads style) ─── */}
      <Card className="overflow-hidden border-slate-200 shadow-xs">
        {/* Banner Cover */}
        <div className="relative h-28 sm:h-36 bg-gradient-to-r from-orange-500 via-amber-500 to-red-500">
          <div className="absolute inset-0 bg-black/10" />
          <div className="absolute top-3 right-3 flex items-center gap-2">
            {profileData.phone_verified && (
              <Badge variant="unlocked" size="sm" className="bg-white/90 text-slate-800 backdrop-blur-xs font-semibold">
                <ShieldCheck size={13} className="text-emerald-600" />
                <span>Verified Resident</span>
              </Badge>
            )}
          </div>
        </div>

        {/* Profile Content */}
        <div className="px-5 pb-6 sm:px-7">
          {/* Avatar & Action Button Row */}
          <div className="-mt-12 sm:-mt-14 flex items-end justify-between gap-3">
            <Avatar
              name={profileData.name}
              size="2xl"
              className="ring-4 ring-white bg-slate-100 shadow-md"
            />

            <div className="flex items-center gap-2 pb-1">
              <button
                type="button"
                onClick={handleShare}
                className="size-10 rounded-xl border border-line bg-surface text-slate-500 hover:text-slate-900 hover:bg-elevated flex items-center justify-center cursor-pointer transition-colors"
                title="Share Profile"
              >
                <Share2 size={16} />
              </button>

              {isSelf ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/profile')}
                  className="font-semibold text-xs"
                >
                  Edit Profile
                </Button>
              ) : (
                <FriendActionButton
                  userId={profileData.id}
                  username={profileData.username}
                  initialStatus={profileData.relationship_status}
                  friendshipId={profileData.friendship_id}
                  onStatusChange={(newStatus) => {
                    setProfileData((prev) => ({
                      ...prev,
                      relationship_status: newStatus,
                    }))
                  }}
                  size="md"
                />
              )}
            </div>
          </div>

          {/* User Name & Bio */}
          <div className="mt-4 space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                {profileData.name}
              </h1>
            </div>
            <p className="text-xs sm:text-sm font-medium text-slate-500">
              @{profileData.username}
            </p>

            <p className="pt-2 text-xs sm:text-sm text-slate-700 leading-relaxed max-w-xl">
              {profileData.profile?.bio || 'Passionate community curator and group-buyer in Jashore.'}
            </p>

            <div className="flex items-center gap-4 pt-2 text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <MapPin size={13} />
                <span>{profileData.profile?.locality || 'Jashore'}, Bangladesh</span>
              </span>
              {profileData.joined_at && (
                <span>Member since {profileData.joined_at}</span>
              )}
            </div>
          </div>

          {copiedMsg && (
            <p className="mt-2 text-xs text-brand font-medium animate-fadeIn">{copiedMsg}</p>
          )}

          {/* Stats Bar */}
          <div className="mt-6 grid grid-cols-3 gap-2 border-t border-line pt-4 text-center">
            <div className="p-2 rounded-xl bg-slate-50">
              <p className="text-lg font-bold text-slate-900">{profileData.stats?.friends_count || 0}</p>
              <p className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold">Friends</p>
            </div>
            <div className="p-2 rounded-xl bg-slate-50">
              <p className="text-lg font-bold text-slate-900">{profileData.stats?.mutual_friends_count || 0}</p>
              <p className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold">Mutual</p>
            </div>
            <div className="p-2 rounded-xl bg-slate-50">
              <p className="text-lg font-bold text-brand">{sampleShelf.length}</p>
              <p className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold">Curated Picks</p>
            </div>
          </div>
        </div>
      </Card>

      {/* ─── Content Navigation Tabs ─── */}
      <div className="flex gap-2 border-b border-line pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('shelf')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold cursor-pointer transition-all ${
            activeTab === 'shelf'
              ? 'bg-slate-900 text-white'
              : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Bookmark size={15} />
          <span>Curated Picks & Shelf</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('drops')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold cursor-pointer transition-all ${
            activeTab === 'drops'
              ? 'bg-slate-900 text-white'
              : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Flame size={15} />
          <span>Backed Drops</span>
        </button>
      </div>

      {/* ─── TAB 1: Shelf & Picks ─── */}
      {activeTab === 'shelf' && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">
              {profileData.name}&rsquo;s Recommended Finds
            </h2>
            <span className="text-xs text-slate-400">Authentic community picks</span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {sampleShelf.map((drop) => (
              <Card key={drop.id} className="overflow-hidden group hover:border-slate-300 transition-all">
                <Link to={`/drops/${drop.id}`} className="block aspect-[16/10] overflow-hidden bg-slate-100 relative">
                  <img
                    src={drop.image}
                    alt={drop.title}
                    className="size-full object-cover group-hover:scale-102 transition-transform duration-300"
                  />
                  <span className="absolute top-2.5 left-2.5">
                    <Badge variant="unlocked" size="sm">Active Drop</Badge>
                  </span>
                </Link>

                <div className="p-4 space-y-2">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">{drop.category}</p>
                  <Link to={`/drops/${drop.id}`} className="block text-sm font-bold text-slate-900 hover:text-brand line-clamp-1">
                    {drop.title}
                  </Link>
                  <p className="text-xs text-slate-500 line-clamp-2">
                    &ldquo;{drop.recommendation || 'Must have quality item tested in Jashore.'}&rdquo;
                  </p>

                  <div className="pt-2 border-t border-line flex items-center justify-between">
                    <span className="text-sm font-extrabold text-slate-900">
                      {formatCurrency(drop.tiers[0].price)}
                    </span>
                    <Link
                      to={`/drops/${drop.id}`}
                      className="text-xs font-semibold text-brand flex items-center gap-1 hover:underline"
                    >
                      Join Drop <ArrowUpRight size={13} />
                    </Link>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* ─── TAB 2: Active Backed Drops ─── */}
      {activeTab === 'drops' && (
        <Card className="p-8 text-center space-y-3">
          <div className="size-12 mx-auto rounded-2xl bg-orange-100 flex items-center justify-center text-brand">
            <Flame size={24} />
          </div>
          <h3 className="text-base font-semibold text-slate-900">Group Drops Backed</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {profileData.name} is participating in ongoing community volume drops to unlock discount tiers for Jashore.
          </p>
          <Button variant="drop-fire" size="sm" onClick={() => navigate('/explore')}>
            Explore Active Drops
          </Button>
        </Card>
      )}
    </div>
  )
}
