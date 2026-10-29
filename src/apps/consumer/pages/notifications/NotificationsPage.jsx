import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Bell,
  Package,
  Flame,
  CheckCircle2,
  Check,
  Clock,
  ArrowRight,
  Inbox,
  RefreshCw,
  Sparkles,
  UserCheck,
  Layers,
  AlertCircle,
} from 'lucide-react'
import { Card } from '@/shared/ui/Card'
import { Badge } from '@/shared/ui/Badge'
import { Button } from '@/shared/ui/Button'
import { notificationsApi } from '@/shared/api/notificationsApi'
import { useAuth } from '@/features/auth/model/authContext'
import { cn } from '@/shared/lib/cn'

function formatNotificationTime(utcString) {
  if (!utcString) return ''
  try {
    const d = new Date(utcString)
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(d)
  } catch {
    return utcString
  }
}

export default function NotificationsPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [filter, setFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0, per_page: 15 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [markingAll, setMarkingAll] = useState(false)

  const fetchNotifications = useCallback(async () => {
    if (!user) return
    setLoading(true)
    setError(null)
    try {
      const res = await notificationsApi.getNotifications({
        context: 'customer',
        filter,
        page,
        per_page: 15,
      })
      if (res?.success) {
        setNotifications(res.data || [])
        if (res.meta) {
          setMeta(res.meta)
          if (res.meta.unread_count !== undefined) {
            setUnreadCount(res.meta.unread_count)
          }
        }
      }
    } catch (err) {
      setError(err?.message || 'Failed to load notifications.')
    } finally {
      setLoading(false)
    }
  }, [user, filter, page])

  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  const handleItemClick = async (notif) => {
    if (!notif.read_at) {
      // Optimistic update
      setUnreadCount((c) => Math.max(0, c - 1))
      setNotifications((prev) =>
        prev.map((item) => (item.id === notif.id ? { ...item, read_at: new Date().toISOString() } : item))
      )

      try {
        await notificationsApi.markAsRead(notif.id)
      } catch {
        // Non-fatal
      }
    }

    const targetUrl = notif.action_url || notif.data?.action_url
    if (targetUrl) {
      navigate(targetUrl)
    }
  }

  const handleMarkAllRead = async () => {
    setMarkingAll(true)
    setUnreadCount(0)
    setNotifications((prev) =>
      prev.map((item) => ({ ...item, read_at: item.read_at || new Date().toISOString() }))
    )

    try {
      await notificationsApi.markAllAsRead({ context: 'customer' })
    } catch {
      fetchNotifications()
    } finally {
      setMarkingAll(false)
    }
  }

  const getEventIcon = (event = '') => {
    if (event.startsWith('order.')) {
      return <Package size={18} className="text-amber-500" />
    }
    if (event.startsWith('group_buy.')) {
      return <Flame size={18} className="text-orange-500" />
    }
    if (event.startsWith('product.')) {
      return <Layers size={18} className="text-emerald-500" />
    }
    if (event.startsWith('auth.')) {
      return <UserCheck size={18} className="text-blue-500" />
    }
    return <Sparkles size={18} className="text-brand" />
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-line">
        <div className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-2xl bg-brand/10 text-brand">
            <Bell size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-ink">Notifications</h1>
              {unreadCount > 0 && (
                <Badge variant="unlocked" size="sm" className="bg-brand/15 text-brand border-brand/20">
                  {unreadCount} unread
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted">Stay up to date with your orders, group drops, and account alerts.</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleMarkAllRead}
              disabled={markingAll}
              className="text-xs"
            >
              <Check size={13} className="mr-1" />
              Mark all as read
            </Button>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={fetchNotifications}
            disabled={loading}
            title="Refresh notifications"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </Button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 my-5">
        <button
          type="button"
          onClick={() => {
            setFilter('all')
            setPage(1)
          }}
          className={cn(
            'rounded-xl px-4 py-1.5 text-xs font-semibold transition-all cursor-pointer',
            filter === 'all'
              ? 'bg-brand text-on-brand shadow-sm'
              : 'bg-elevated text-muted hover:text-ink'
          )}
        >
          All Activity
        </button>
        <button
          type="button"
          onClick={() => {
            setFilter('unread')
            setPage(1)
          }}
          className={cn(
            'rounded-xl px-4 py-1.5 text-xs font-semibold transition-all cursor-pointer',
            filter === 'unread'
              ? 'bg-brand text-on-brand shadow-sm'
              : 'bg-elevated text-muted hover:text-ink'
          )}
        >
          Unread Only {unreadCount > 0 && `(${unreadCount})`}
        </button>
      </div>

      {/* Error Alert */}
      {error && (
        <Card className="border-red-500/20 bg-red-500/10 p-4 mb-5">
          <div className="flex items-center gap-3 text-red-500 text-xs">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
            <Button variant="ghost" size="xs" onClick={fetchNotifications} className="ml-auto">
              Retry
            </Button>
          </div>
        </Card>
      )}

      {/* Notifications List */}
      <div className="space-y-3">
        {loading && notifications.length === 0 ? (
          <div className="py-20 text-center text-muted">
            <RefreshCw size={24} className="animate-spin text-brand mx-auto mb-3" />
            <p className="text-sm font-semibold text-ink">Loading notifications...</p>
          </div>
        ) : notifications.length === 0 ? (
          <Card className="p-12 text-center border-dashed">
            <Inbox size={36} className="stroke-1 text-muted mx-auto mb-3" />
            <h3 className="text-sm font-bold text-ink">No notifications yet</h3>
            <p className="text-xs text-muted mt-1 max-w-sm mx-auto">
              {filter === 'unread'
                ? "You've read all your notifications! Check back later for updates."
                : 'When you place orders or participate in drops, your activity alerts will show up here.'}
            </p>
          </Card>
        ) : (
          notifications.map((item) => {
            const isUnread = !item.read_at
            return (
              <Card
                key={item.id}
                onClick={() => handleItemClick(item)}
                className={cn(
                  'group flex items-start gap-4 p-4 transition-all cursor-pointer hover:shadow-md',
                  isUnread
                    ? 'border-brand/40 bg-brand/5 ring-1 ring-brand/10'
                    : 'bg-surface hover:bg-elevated/80'
                )}
              >
                {/* Icon */}
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-canvas border border-line shadow-xs">
                  {getEventIcon(item.event)}
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className={cn('text-sm', isUnread ? 'font-bold text-ink' : 'font-semibold text-ink/80')}>
                      {item.title}
                    </h4>
                    {isUnread && (
                      <span className="flex items-center gap-1 rounded-full bg-brand/15 px-2 py-0.5 text-[10px] font-bold text-brand">
                        <span className="size-1.5 rounded-full bg-brand animate-ping" />
                        New
                      </span>
                    )}
                  </div>

                  <p className="mt-1 text-xs text-muted leading-relaxed">
                    {item.message}
                  </p>

                  <div className="mt-2.5 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1 text-[11px] text-soft">
                      <Clock size={11} />
                      <span>{formatNotificationTime(item.created_at)}</span>
                    </div>

                    {(item.action_url || item.data?.action_url) && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand group-hover:underline">
                        <span>View Details</span>
                        <ArrowRight size={11} className="transition-transform group-hover:translate-x-0.5" />
                      </span>
                    )}
                  </div>
                </div>
              </Card>
            )
          })
        )}
      </div>

      {/* Pagination Bar */}
      {meta.total > meta.per_page && (
        <div className="flex items-center justify-between border-t border-line mt-6 pt-4 text-xs text-muted">
          <div>
            Showing {(meta.current_page - 1) * meta.per_page + 1} to{' '}
            {Math.min(meta.current_page * meta.per_page, meta.total)} of {meta.total} notifications
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="xs"
              disabled={meta.current_page <= 1 || loading}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </Button>
            <span className="font-mono text-[11px]">
              Page {meta.current_page} of {meta.last_page}
            </span>
            <Button
              variant="outline"
              size="xs"
              disabled={meta.current_page >= meta.last_page || loading}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
