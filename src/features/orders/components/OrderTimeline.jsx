import {
  Clock,
  Package,
  Truck,
  CheckCircle2,
  XCircle,
  Users,
  Lock,
  ArrowRight,
  Shield,
  User,
  Bot,
} from 'lucide-react'
import { Badge } from '@/shared/ui/Badge'

export function OrderTimeline({ histories = [], isAdmin = false, className = '' }) {
  if (!histories || histories.length === 0) {
    return (
      <div className={`p-4 rounded-xl bg-slate-950/40 border border-slate-800 text-center text-xs text-slate-400 ${className}`}>
        No status history recorded yet.
      </div>
    )
  }

  const getStatusConfig = (status) => {
    switch (status) {
      case 'awaiting_group':
        return {
          label: 'Awaiting Group Drop',
          icon: Users,
          color: 'text-amber-400',
          bg: 'bg-amber-500/15',
          border: 'border-amber-500/30',
        }
      case 'pending':
        return {
          label: 'Order Placed (Pending)',
          icon: Clock,
          color: 'text-orange-400',
          bg: 'bg-orange-500/15',
          border: 'border-orange-500/30',
        }
      case 'processing':
        return {
          label: 'Processing in Hub',
          icon: Package,
          color: 'text-purple-400',
          bg: 'bg-purple-500/15',
          border: 'border-purple-500/30',
        }
      case 'shipped':
        return {
          label: 'Shipped & In Transit',
          icon: Truck,
          color: 'text-blue-400',
          bg: 'bg-blue-500/15',
          border: 'border-blue-500/30',
        }
      case 'delivered':
        return {
          label: 'Delivered',
          icon: CheckCircle2,
          color: 'text-emerald-400',
          bg: 'bg-emerald-500/15',
          border: 'border-emerald-500/30',
        }
      case 'cancelled':
        return {
          label: 'Cancelled',
          icon: XCircle,
          color: 'text-red-400',
          bg: 'bg-red-500/15',
          border: 'border-red-500/30',
        }
      default:
        return {
          label: status,
          icon: Clock,
          color: 'text-slate-400',
          bg: 'bg-slate-800',
          border: 'border-slate-700',
        }
    }
  }

  const formatDateTime = (timestamp) => {
    if (!timestamp) return ''
    try {
      const d = new Date(timestamp)
      return d.toLocaleString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch {
      return timestamp
    }
  }

  const getActorBadge = (event) => {
    switch (event.actor_type) {
      case 'admin':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-md bg-purple-500/15 text-purple-300 border border-purple-500/30 font-medium">
            <Shield size={11} />
            <span>Admin: {event.changed_by_user?.name || 'Staff'}</span>
          </span>
        )
      case 'customer':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-md bg-blue-500/15 text-blue-300 border border-blue-500/30 font-medium">
            <User size={11} />
            <span>Customer</span>
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 border border-slate-700 font-medium">
            <Bot size={11} />
            <span>System</span>
          </span>
        )
    }
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="relative pl-6 space-y-5 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-800">
        {histories.map((event, idx) => {
          const cfg = getStatusConfig(event.to_status)
          const Icon = cfg.icon
          const isLatest = idx === histories.length - 1

          return (
            <div key={event.id || idx} className="relative group">
              {/* Timeline marker node */}
              <div
                className={`absolute -left-6 top-1 size-5 rounded-full border flex items-center justify-center transition-all ${
                  isLatest
                    ? `${cfg.bg} ${cfg.border} ring-4 ring-orange-500/10`
                    : 'bg-slate-900 border-slate-700 text-slate-500'
                }`}
              >
                <Icon size={12} className={isLatest ? cfg.color : 'text-slate-400'} />
              </div>

              {/* Event content card */}
              <div
                className={`p-3 rounded-xl border transition-all text-xs ${
                  isLatest
                    ? 'bg-slate-900/90 border-slate-700/80 shadow-md'
                    : 'bg-slate-950/40 border-slate-800/80 text-slate-300'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {event.from_status ? (
                      <div className="flex items-center gap-1 font-semibold text-white">
                        <span className="capitalize text-slate-400">
                          {event.from_status.replace('_', ' ')}
                        </span>
                        <ArrowRight size={11} className="text-slate-500 shrink-0" />
                        <span className={cfg.color}>
                          {cfg.label}
                        </span>
                      </div>
                    ) : (
                      <span className={`font-bold ${cfg.color}`}>
                        {cfg.label}
                      </span>
                    )}

                    <Badge size="sm" className={`${cfg.bg} ${cfg.color} ${cfg.border} text-[10px]`}>
                      {event.to_status}
                    </Badge>
                  </div>

                  <span className="text-[11px] font-mono text-slate-400">
                    {formatDateTime(event.occurred_at || event.created_at)}
                  </span>
                </div>

                {/* Customer-visible explanation */}
                {event.reason && (
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    {event.reason}
                  </p>
                )}

                {/* Admin-only metadata and internal notes */}
                {isAdmin && (
                  <div className="mt-2.5 pt-2 border-t border-slate-800/80 space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-slate-500">Actor:</span>
                        {getActorBadge(event)}
                      </div>

                      {event.event_key && (
                        <span className="text-[9px] font-mono text-slate-500 truncate max-w-[150px]">
                          Key: {event.event_key}
                        </span>
                      )}
                    </div>

                    {event.internal_note && (
                      <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/25 text-amber-300 text-[11px] flex items-start gap-1.5 mt-1.5">
                        <Lock size={12} className="shrink-0 text-amber-400 mt-0.5" />
                        <div>
                          <span className="font-semibold text-amber-200">Staff Note: </span>
                          <span>{event.internal_note}</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
