import React from 'react'
import { Menu, Bell, Shield, ExternalLink } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Avatar } from '@/shared/ui/Avatar'

export function AdminHeader({ onOpenSidebar }) {
  return (
    <header className="sticky top-0 z-30 h-16 w-full bg-white border-b border-slate-200/80 px-4 md:px-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        {/* Mobile menu drawer toggle button */}
        <button
          onClick={onOpenSidebar}
          className="md:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          aria-label="Open sidebar"
        >
          <Menu size={20} />
        </button>

        <div className="hidden sm:flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">Operation Mode:</span>
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md flex items-center gap-1">
            <Shield size={12} /> Live Production
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Link
          to="/"
          target="_blank"
          className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
        >
          <span>Open Storefront</span>
          <ExternalLink size={12} />
        </Link>

        <button className="p-2 text-slate-500 hover:text-slate-800 rounded-xl hover:bg-slate-100">
          <Bell size={18} />
        </button>

        <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
          <Avatar name="Admin Jashore" size="sm" />
          <div className="hidden md:block text-left">
            <span className="text-xs font-bold text-slate-900 block leading-tight">Admin Jashore</span>
            <span className="text-[10px] text-slate-400 block">Super Admin</span>
          </div>
        </div>
      </div>
    </header>
  )
}
