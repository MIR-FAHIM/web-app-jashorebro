import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  Bell,
  Package,
  Flame,
  CheckCircle2,
  AlertCircle,
  Layers,
  Sparkles,
  UserCheck,
  Check,
  ChevronRight,
  Clock,
  Inbox,
  RefreshCw,
} from 'lucide-react'
import { notificationsApi } from '@/shared/api/notificationsApi'
import { useAuth } from '@/features/auth/model/authContext'
import { cn } from '@/shared/lib/cn'

function formatNotificationTime(utcString) {
  if (!utcString) return ''
  try {
    const d = new Date(utcString)
    const now = new Date()
    const diffMs = now - d
    const diffMins = Math.floor(diffMs / 60000)
    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `${diffHours}h ago`
    return new Intl.DateTimeFormat(undefined, {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    }).format(d)
  } catch {
    return utcString
  }
}

export function NotificationBell({
  context = 'customer',
  viewAllUrl = '/notifications',
  theme = 'light',
  className,
  getAccessibleLabel,
}) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState('all')

  const containerRef = useRef(null)
  const isFetchingCount = useRef(false)
  const isFetchingList = useRef(false)

  const isDark = theme === 'dark'

  // Fetch unread count without overlapping requests
  const fetchUnreadCount = useCallback(async () => {
    if (!user || isFetchingCount.current) return
    isFetchingCount.current = true
    try {
      const res = await notificationsApi.getUnreadCount({ context })
      if (res?.success && res.data) {
        setUnreadCount(res.data.unread_count || 0)
      }
    } catch {
      // Non-fatal
    } finally {
      isFetchingCount.current = false
    }
  }, [user, context])

  // Fetch notification list
  const fetchNotifications = useCallback(async () => {
    if (!user || isFetchingList.current) return
    isFetchingList.current = true
    setLoading(true)
    try {
      const res = await notificationsApi.getNotifications({
        context,
        filter,
        per_page: 8,
      })
      if (res?.success) {
        setNotifications(res.data || [])
        if (res.meta?.unread_count !== undefined) {
          setUnreadCount(res.meta.unread_count)
        }
      }
    } catch {
      // Non-fatal
    } finally {
      setLoading(false)
      isFetchingList.current = false
    }
  }, [user, context, filter])

  // Initial and periodic polling for unread count (every 30 seconds)
  useEffect(() => {
    if (!user) return
    fetchUnreadCount()

    const interval = setInterval(() => {
      fetchUnreadCount()
    }, 30000)

    return () => clearInterval(interval)
  }, [user, fetchUnreadCount])

  // When panel is toggled open, refresh data immediately
  useEffect(() => {
    if (isOpen) {
      fetchNotifications()
      fetchUnreadCount()
    }
  }, [isOpen, fetchNotifications, fetchUnreadCount])

  // Close dropdown on click outside or escape key
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleKeyDown)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  // Handle single notification click
  const handleItemClick = async (notif) => {
    setIsOpen(false)

    // Mark as read immediately
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

    // Navigate to destination
    const targetUrl = notif.action_url || notif.data?.action_url
    if (targetUrl) {
      navigate(targetUrl)
    }
  }

  // Mark all as read
  const handleMarkAllRead = async () => {
    // Optimistic update
    setUnreadCount(0)
    setNotifications((prev) =>
      prev.map((item) => ({ ...item, read_at: item.read_at || new Date().toISOString() }))
    )

    try {
      await notificationsApi.markAllAsRead({ context })
    } catch {
      // Revert if error
      fetchNotifications()
      fetchUnreadCount()
    }
  }

  const getEventIcon = (event = '') => {
    if (event.startsWith('order.')) {
      return <Package size={15} className="text-amber-500" />
    }
    if (event.startsWith('group_buy.')) {
      return <Flame size={15} className="text-orange-500" />
    }
    if (event.startsWith('product.')) {
      return <Layers size={15} className="text-emerald-500" />
    }
    if (event.startsWith('auth.')) {
      return <UserCheck size={15} className="text-blue-500" />
    }
    return <Sparkles size={15} className="text-brand" />
  }

  if (!user) return null

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      {/* Bell Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={getAccessibleLabel?.(unreadCount) || `Notifications, ${unreadCount} unread`}
        title={getAccessibleLabel?.(unreadCount) || `Notifications (${unreadCount} unread)`}
        className={cn(
          'relative flex size-11 items-center justify-center rounded-xl transition-colors cursor-pointer',
          isDark
            ? 'text-slate-400 hover:bg-slate-800 hover:text-white'
            : 'text-muted hover:bg-elevated hover:text-ink',
          isOpen && (isDark ? 'bg-slate-800 text-white' : 'bg-elevated text-ink')
        )}
      >
        <Bell size={20} />

        {unreadCount > 0 && (
          <span className="absolute right-1 top-1 flex min-w-4.5 h-4.5 items-center justify-center rounded-full bg-brand px-1 text-[10px] font-bold text-on-brand shadow-sm animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Flyout Panel */}
      {isOpen && (
        <div
          role="region"
          aria-label="Notifications Panel"
          className={cn(
            'absolute right-0 top-full mt-2 z-50 w-80 sm:w-96 rounded-2xl border shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150',
            isDark
              ? 'border-slate-800 bg-slate-900/95 text-slate-100 shadow-slate-950/80'
              : 'border-line bg-canvas/95 text-ink shadow-2xl'
          )}
        >
          {/* Header */}
          <div
            className={cn(
              'flex items-center justify-between border-b px-4 py-3',
              isDark ? 'border-slate-800' : 'border-line'
            )}
          >
            <div className="flex items-center gap-2">
              <h2 className="text-xs font-bold uppercase tracking-wider">
                Notifications
              </h2>
              {unreadCount > 0 && (
                <span className="rounded-full bg-brand/15 px-2 py-0.5 text-[10px] font-bold text-brand">
                  {unreadCount} new
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAllRead}
                  className={cn(
                    'flex items-center gap-1 text-[11px] font-semibold transition-colors cursor-pointer',
                    isDark
                      ? 'text-orange-400 hover:text-orange-300'
                      : 'text-brand hover:text-brand-dark'
                  )}
                  title="Mark all as read"
                >
                  <Check size={12} />
                  <span>Mark all read</span>
                </button>
              )}
            </div>
          </div>

          {/* Filter Pills */}
          <div
            className={cn(
              'flex items-center gap-1 border-b px-3 py-1.5 text-xs',
              isDark ? 'border-slate-800 bg-slate-950/40' : 'border-line bg-surface/50'
            )}
          >
            <button
              type="button"
              onClick={() => setFilter('all')}
              className={cn(
                'rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-colors cursor-pointer',
                filter === 'all'
                  ? isDark
                    ? 'bg-slate-800 text-white'
                    : 'bg-elevated text-ink shadow-xs'
                  : isDark
                    ? 'text-slate-400 hover:text-slate-200'
                    : 'text-muted hover:text-ink'
              )}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setFilter('unread')}
              className={cn(
                'rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-colors cursor-pointer',
                filter === 'unread'
                  ? isDark
                    ? 'bg-slate-800 text-white'
                    : 'bg-elevated text-ink shadow-xs'
                  : isDark
                    ? 'text-slate-400 hover:text-slate-200'
                    : 'text-muted hover:text-ink'
              )}
            >
              Unread
            </button>
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/40">
            {loading && notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-muted">
                <RefreshCw size={18} className="animate-spin text-brand mb-2" />
                <span className="text-xs">Loading notifications...</span>
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-muted px-4 text-center">
                <Inbox size={28} className="stroke-1 text-slate-500 mb-2" />
                <p className="text-xs font-semibold text-slate-300">No notifications</p>
                <p className="text-[11px] text-muted mt-0.5">
                  {filter === 'unread'
                    ? "You're all caught up! No unread alerts."
                    : 'No business activity recorded yet.'}
                </p>
              </div>
            ) : (
              notifications.map((item) => {
                const isUnread = !item.read_at
                return (
                  <div
                    key={item.id}
                    onClick={() => handleItemClick(item)}
                    className={cn(
                      'group flex items-start gap-3 p-3 transition-colors cursor-pointer text-left',
                      isUnread
                        ? isDark
                          ? 'bg-slate-800/50 hover:bg-slate-800/80'
                          : 'bg-brand/5 hover:bg-brand/10'
                        : isDark
                          ? 'hover:bg-slate-800/30'
                          : 'hover:bg-elevated/60'
                    )}
                  >
                    {/* Icon capsule */}
                    <div
                      className={cn(
                        'mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-xl',
                        isDark ? 'bg-slate-800 border border-slate-700' : 'bg-surface border border-line'
                      )}
                    >
                      {getEventIcon(item.event)}
                    </div>

                    {/* Content */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <p
                          className={cn(
                            'text-xs truncate',
                            isUnread ? 'font-bold text-white' : 'font-medium text-slate-300'
                          )}
                        >
                          {item.title}
                        </p>
                        {isUnread && (
                          <span className="size-2 rounded-full bg-brand shrink-0" />
                        )}
                      </div>

                      <p
                        className={cn(
                          'mt-0.5 text-[11px] line-clamp-2',
                          isDark ? 'text-slate-400' : 'text-muted'
                        )}
                      >
                        {item.message}
                      </p>

                      <div className="mt-1 flex items-center gap-1.5 text-[10px] text-slate-500">
                        <Clock size={10} />
                        <span>{formatNotificationTime(item.created_at)}</span>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>

          {/* Footer: View All */}
          <div
            className={cn(
              'border-t p-2 text-center',
              isDark ? 'border-slate-800 bg-slate-950/60' : 'border-line bg-surface/50'
            )}
          >
            <Link
              to={viewAllUrl}
              onClick={() => setIsOpen(false)}
              className={cn(
                'flex items-center justify-center gap-1 rounded-xl py-2 text-xs font-semibold transition-colors',
                isDark
                  ? 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  : 'text-ink hover:bg-elevated'
              )}
            >
              <span>View All Notifications</span>
              <ChevronRight size={13} />
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
