import React from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { ArrowLeft, ShieldCheck, Flame } from 'lucide-react'

export function FocusedLayout() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Focused Header */}
      <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200/80">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-950 p-1.5 -ml-1 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Back"
          >
            <ArrowLeft size={18} />
            <span className="hidden sm:inline">Back</span>
          </button>

          <div className="flex items-center gap-1.5">
            <Flame size={16} className="text-[var(--color-brand)] fill-[var(--color-brand)]" />
            <span className="font-black text-sm tracking-tight text-slate-900">
              Jashore<span className="text-[var(--color-brand)]">Bro</span>
            </span>
          </div>

          <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
            <ShieldCheck size={14} />
            <span>Secure Flow</span>
          </div>
        </div>
      </header>

      {/* Main Focused Content */}
      <main className="flex-1 w-full max-w-3xl mx-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  )
}
