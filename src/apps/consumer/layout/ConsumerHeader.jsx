import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Flame, Bell, Search, ShieldCheck } from 'lucide-react'
import { useAuth } from '@/features/auth/model/authContext'
import { Avatar } from '@/shared/ui/Avatar'

export function ConsumerHeader() {
  const { user } = useAuth()
  const navigate = useNavigate()

  return (
    <header className="sticky top-0 z-40 w-full bg-white/90 backdrop-blur-md border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
        {/* Brand / Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-orange-600 to-red-500 flex items-center justify-center text-white shadow-sm shadow-orange-500/30 group-hover:scale-105 transition-transform">
            <Flame size={18} className="fill-white" />
          </div>
          <span className="font-extrabold text-base tracking-tight text-slate-900">
            Jashore<span className="text-[var(--color-brand)]">Bro</span>
          </span>
        </Link>

        {/* Search bar on desktop */}
        <div className="hidden md:flex flex-1 max-w-md mx-4">
          <div className="w-full relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search drops, products, tastemakers..."
              className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-100/80 border border-transparent rounded-full focus:bg-white focus:border-slate-300 focus:outline-none transition-all"
            />
          </div>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-2.5">
          {/* Quick link to admin (for development / staff convenience) */}
          <Link
            to="/admin"
            className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-slate-900 px-2.5 py-1 rounded-lg hover:bg-slate-100 transition-colors"
            title="Switch to Admin Portal"
          >
            <ShieldCheck size={14} className="text-slate-400" />
            <span>Admin</span>
          </Link>

          <button
            onClick={() => navigate('/explore')}
            className="md:hidden p-2 text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100"
            aria-label="Search"
          >
            <Search size={18} />
          </button>

          <button
            onClick={() => navigate('/activity')}
            className="p-2 text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 relative"
            aria-label="Notifications"
          >
            <Bell size={18} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          </button>

          <Link to="/profile">
            <Avatar
              name={user?.name || 'Guest'}
              size="sm"
              className="ring-2 ring-transparent hover:ring-[var(--color-brand)] transition-all"
            />
          </Link>
        </div>
      </div>
    </header>
  )
}
