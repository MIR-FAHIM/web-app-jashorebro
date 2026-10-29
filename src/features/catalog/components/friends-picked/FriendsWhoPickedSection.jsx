import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  Users,
  Sparkles,
  Store,
  ArrowRight,
  MessageSquareQuote,
  BookmarkPlus,
} from 'lucide-react'
import { Card } from '@/shared/ui/Card'
import { Badge } from '@/shared/ui/Badge'
import { Button } from '@/shared/ui/Button'
import { Avatar } from '@/shared/ui/Avatar'
import { useAuth } from '@/features/auth/model/authContext'
import { catalogApi } from '@/features/catalog/api/catalogApi'
import { getRecommendationPath } from '@/features/referrals/model/referralAttribution'
import { UI_FEATURES } from '@/shared/config/features'

export function FriendsWhoPickedSection({ product, onOpenPicksModal }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated } = useAuth()

  const pickedData = product?.picked_by_friends || { count: 0, users: [] }
  const friendCount = pickedData.count || 0
  const initialFriends = pickedData.users || []

  const [allFriends, setAllFriends] = useState(null)
  const [isLoadingAll, setIsLoadingAll] = useState(false)

  const displayFriends = allFriends || initialFriends

  const handleLoadAll = async () => {
    if (allFriends) return
    setIsLoadingAll(true)
    try {
      const res = await catalogApi.getFriendsWhoPicked(product.id)
      setAllFriends(Array.isArray(res) ? res : res.friends || res.data || [])
    } catch {
      // Fallback to initial
      setAllFriends(initialFriends)
    } finally {
      setIsLoadingAll(false)
    }
  }

  return (
    <Card className="p-5 bg-slate-900 border-slate-800 text-white space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="size-8 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
            <Users size={16} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Friends Who Picked This
              </h3>
              {friendCount > 0 && (
                <Badge
                  variant="unlocked"
                  className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[10px] px-1.5 py-0.5"
                >
                  {friendCount} {friendCount === 1 ? 'friend' : 'friends'}
                </Badge>
              )}
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Curated by your trusted community circle in Jashore.
            </p>
          </div>
        </div>
      </div>

      {/* When Confirmed Friends Picked */}
      {friendCount > 0 ? (
        <div className="space-y-3">
          {displayFriends.map((friend) => {
            return (
              <div
                key={friend.id}
                className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700/80 transition-all space-y-3"
              >
                {/* Profile Identity Bar */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Link to={`/profile/${friend.username}`} className="shrink-0 group">
                      <Avatar
                        src={friend.avatar_url}
                        name={friend.name}
                        size="md"
                        className="border-slate-700 ring-2 ring-emerald-500/20 group-hover:scale-105 transition-transform"
                      />
                    </Link>
                    <div className="min-w-0">
                      <Link
                        to={`/profile/${friend.username}`}
                        className="text-sm font-bold text-white hover:text-emerald-400 transition-colors truncate block"
                      >
                        {friend.name}
                      </Link>
                      <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-400">
                        <span className="text-slate-500">@{friend.username}</span>
                        {friend.locality && <span>• {friend.locality}</span>}
                        {friend.mutual_friends_count > 0 && (
                          <span className="text-emerald-400/90">• {friend.mutual_friends_count} mutual</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Direct Profile Link */}
                  <Link
                    to={`/profile/${friend.username}`}
                    className="shrink-0 flex items-center gap-1 text-xs font-semibold text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 px-2.5 py-1.5 rounded-lg transition-colors"
                  >
                    <span>View Profile</span>
                    <ArrowRight size={13} />
                  </Link>
                </div>

                {/* Friend's Personal Caption / Recommendation Note */}
                {friend.caption && (
                  <div className="rounded-lg bg-slate-900/90 border border-slate-800 p-2.5 text-xs text-slate-300 flex items-start gap-2">
                    <MessageSquareQuote size={15} className="text-emerald-400 shrink-0 mt-0.5" />
                    <p className="leading-relaxed whitespace-pre-line italic">
                      "{friend.caption}"
                    </p>
                  </div>
                )}

                {/* Commercial & Storefront Shortcuts */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-800/80 pt-2.5 text-xs">
                  {UI_FEATURES.personalStores && friend.has_shop && friend.shop_slug ? (
                    <Link
                      to={`/shop/${friend.shop_slug}`}
                      className="inline-flex items-center gap-1 text-xs font-medium text-indigo-300 hover:text-indigo-200 transition-colors"
                    >
                      <Store size={13} className="text-indigo-400" />
                      <span>{friend.name.split(' ')[0]}'s Storefront</span>
                    </Link>
                  ) : (
                    <span className="text-[11px] text-slate-500 flex items-center gap-1">
                      <Sparkles size={11} className="text-slate-400" />
                      <span>Curated Pick</span>
                    </span>
                  )}

                  {friend.recommendation_code && (
                    <Link
                      to={getRecommendationPath(product, friend.recommendation_code)}
                      className="min-h-11 text-[11px] font-semibold transition-colors flex items-center gap-1 text-slate-400 hover:text-emerald-400"
                    >
                      <span>View {friend.name.split(' ')[0]}'s pick</span>
                      <span aria-hidden="true">&rarr;</span>
                    </Link>
                  )}
                </div>
              </div>
            )
          })}

          {/* Load all friends if count > 5 */}
          {friendCount > displayFriends.length && (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={isLoadingAll}
              onClick={handleLoadAll}
              className="w-full text-xs font-semibold border-slate-800 bg-slate-950 hover:bg-slate-800"
            >
              {isLoadingAll ? 'Loading Friends...' : `View All ${friendCount} Friends`}
            </Button>
          )}
        </div>
      ) : isAuthenticated ? (
        /* Authenticated but no friends have picked this yet */
        <div className="rounded-xl border border-dashed border-slate-800 bg-slate-950/60 p-4 text-center space-y-2.5">
          <p className="text-xs text-slate-400">
            None of your friends have picked this item yet.
          </p>
          {product.is_recommendation_enabled !== false && onOpenPicksModal && (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={onOpenPicksModal}
              className="text-xs font-semibold gap-1.5 border-slate-700 bg-slate-800/80 hover:bg-slate-700 mx-auto"
            >
              <BookmarkPlus size={14} className="text-emerald-400" />
              <span>Be the First to Pick</span>
            </Button>
          )}
        </div>
      ) : (
        /* Guest view */
        <div className="rounded-xl border border-dashed border-slate-800 bg-slate-950/60 p-4 text-center space-y-2.5">
          <p className="text-xs text-slate-400">
            Sign in to discover which of your friends have picked or recommended this product.
          </p>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() =>
              navigate('/auth', {
                state: { from: location },
              })
            }
            className="text-xs font-semibold border-slate-700 bg-slate-800 hover:bg-slate-700 mx-auto"
          >
            Sign in with JashoreBro
          </Button>
        </div>
      )}
    </Card>
  )
}
