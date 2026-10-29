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
  ExternalLink,
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

export default function AdminNotificationsPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [filter, setFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0, per_page: 20 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [markingAll, setMarkingAll] = useState(false)

  const fetchNotifications = useCallback(async () => {
    if (!user) return
    setLoading(true)
    setError(null)
    try {
      const res = await notificationsApi.getNotifications({
        context: 'admin',
        filter,
        page,
        per_page: 20,
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
      setError(err?.message || 'Failed to load administrative notifications.')
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
      await notificationsApi.markAllAsRead({ context: 'admin' })
    } catch {
      fetchNotifications()
    } finally {
      setMarkingAll(false)
    }
  }

  const getEventIcon = (event = '') => {
    if (event.startsWith('order.')) {
      return <Package size={18} className="text-amber-400" />
    }
    if (event.startsWith('group_buy.')) {
      return <Flame size={18} className="text-orange-400" />
    }
    if (event.startsWith('product.')) {
      return <Layers size={18} className="text-emerald-400" />
    }
    if (event.startsWith('auth.')) {
      return <UserCheck size={18} className="text-blue-400" />
    }
    return <Bell size={18} className="text-orange-400" />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-black tracking-tight text-white">System Notifications</h1>
            {unreadCount > 0 && (
              <Badge variant="unlocked" size="sm" className="bg-orange-500/20 text-orange-400 border-orange-500/30">
                {unreadCount} unread
              </Badge>
            )}
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Real-time administrative alerts for new checkouts, user signups, product approvals, and volume drop targets.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleMarkAllRead}
              disabled={markingAll}
              className="border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700 text-xs"
            >
              <Check size={13} className="mr-1" />
              Mark all as read
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={fetchNotifications}
            disabled={loading}
            className="border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </Button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => {
            setFilter('all')
            setPage(1)
          }}
          className={cn(
            'rounded-xl px-4 py-1.5 text-xs font-semibold transition-all cursor-pointer',
            filter === 'all'
              ? 'bg-orange-500 text-white shadow-sm'
              : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
          )}
        >
          All Alerts
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
              ? 'bg-orange-500 text-white shadow-sm'
              : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
          )}
        >
          Unread Alerts {unreadCount > 0 && `(${unreadCount})`}
        </button>
      </div>

      {/* Error Alert */}
      {error && (
        <Card className="border-red-500/30 bg-red-500/10 p-4">
          <div className="flex items-center gap-3 text-red-400 text-xs">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
            <Button variant="ghost" size="xs" onClick={fetchNotifications} className="ml-auto text-red-300">
              Retry
            </Button>
          </div>
        </Card>
      )}

      {/* Notifications List */}
      <div className="space-y-3">
        {loading && notifications.length === 0 ? (
          <div className="py-20 text-center text-slate-500">
            <RefreshCw size={24} className="animate-spin text-orange-500 mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-300">Loading alerts...</p>
          </div>
        ) : notifications.length === 0 ? (
          <Card className="border-slate-800 bg-slate-900/90 p-12 text-center">
            <Inbox size={36} className="stroke-1 text-slate-600 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-300">No notifications</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              {filter === 'unread'
                ? 'All alerts have been reviewed! No pending unread items.'
                : 'No administrative alerts recorded for this context.'}
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
                  'group flex items-start gap-4 p-4 transition-all cursor-pointer hover:border-slate-700',
                  isUnread
                    ? 'border-orange-500/40 bg-slate-800/70 ring-1 ring-orange-500/20'
                    : 'border-slate-800 bg-slate-900/90 hover:bg-slate-800/50'
                )}
              >
                {/* Icon */}
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-slate-800 border border-slate-700 shadow-xs">
                  {getEventIcon(item.event)}
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className={cn('text-sm', isUnread ? 'font-bold text-white' : 'font-semibold text-slate-300')}>
                      {item.title}
                    </h4>
                    {isUnread && (
                      <span className="flex items-center gap-1 rounded-full bg-orange-500/20 px-2 py-0.5 text-[10px] font-bold text-orange-400 border border-orange-500/30">
                        <span className="size-1.5 rounded-full bg-orange-400 animate-ping" />
                        Unread
                      </span>
                    )}
                  </div>

                  <p className="mt-1 text-xs text-slate-400 leading-relaxed">
                    {item.message}
                  </p>

                  <div className="mt-2.5 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                      <Clock size={11} />
                      <span>{formatNotificationTime(item.created_at)}</span>
                    </div>

                    {(item.action_url || item.data?.action_url) && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-orange-400 group-hover:underline">
                        <span>Open Resource</span>
                        <ExternalLink size={11} className="transition-transform group-hover:translate-x-0.5" />
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
        <div className="flex items-center justify-between border-t border-slate-800 pt-4 text-xs text-slate-400">
          <div>
            Showing {(meta.current_page - 1) * meta.per_page + 1} to{' '}
            {Math.min(meta.current_page * meta.per_page, meta.total)} of {meta.total} alerts
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="xs"
              disabled={meta.current_page <= 1 || loading}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="border-slate-700 bg-slate-800 text-slate-300"
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
              className="border-slate-700 bg-slate-800 text-slate-300"
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
