import React from 'react'
import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Flame,
  ShoppingBag,
  Package,
  Users,
  Store,
  Award,
  ShieldAlert,
  ArrowLeft,
  X,
} from 'lucide-react'
import { cn } from '@/shared/lib/cn'

const adminNavItems = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/drops', label: 'Drop Management', icon: Flame },
  { to: '/admin/catalog', label: 'Product Catalog', icon: ShoppingBag },
  { to: '/admin/orders', label: 'Batch Orders', icon: Package },
  { to: '/admin/users', label: 'Curators & Users', icon: Users },
  { to: '/admin/sellers', label: 'Merchants & Sellers', icon: Store },
  { to: '/admin/rewards', label: 'Curator Rewards', icon: Award },
  { to: '/admin/moderation', label: 'Taste Moderation', icon: ShieldAlert },
]

export function AdminSidebar({ isOpen, onClose }) {
  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={cn(
          'fixed md:sticky top-0 left-0 z-50 h-screen w-64 bg-slate-950 text-slate-300 flex flex-col border-r border-slate-800 transition-transform duration-200',
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        )}
      >
        {/* Brand Header */}
        <div className="h-16 px-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-orange-600 text-white flex items-center justify-center font-black">
              JB
            </div>
            <div>
              <span className="font-extrabold text-white text-sm">JashoreBro</span>
              <span className="block text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                Admin Console
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation items */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {adminNavItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/admin'}
              onClick={onClose}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all',
                  isActive
                    ? 'bg-orange-600 text-white font-bold shadow-sm shadow-orange-600/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                )
              }
            >
              <Icon size={17} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Switch back to Consumer Web App */}
        <div className="p-4 border-t border-slate-800">
          <NavLink
            to="/"
            className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white px-3 py-2 rounded-xl hover:bg-slate-900 transition-colors"
          >
            <ArrowLeft size={16} />
            <span>Back to Consumer App</span>
          </NavLink>
        </div>
      </aside>
    </>
  )
}
