import { Menu, ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Avatar } from '@/shared/ui/Avatar'

export function AdminHeader({ onOpenSidebar }) {
  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between gap-3 border-b border-line bg-canvas/95 px-4 backdrop-blur-xl md:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <button onClick={onOpenSidebar} className="flex size-11 shrink-0 items-center justify-center rounded-xl text-soft hover:bg-elevated md:hidden" aria-label="Open navigation"><Menu size={22} /></button>
        <span className="text-sm font-semibold text-ink">Workspace</span>
        <span className="hidden rounded-full border border-brand/25 bg-brand-soft px-2.5 py-1 text-xs font-medium text-brand sm:inline-flex">Demo data</span>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        <Link to="/" className="flex min-h-11 items-center gap-1.5 rounded-xl px-3 text-sm text-muted hover:bg-elevated hover:text-ink"><span className="hidden sm:inline">Storefront</span><ArrowUpRight size={19} /><span className="sr-only sm:hidden">Open storefront</span></Link>
        <div className="flex items-center gap-2.5 border-l border-line pl-3"><Avatar name="Admin Jashore" size="sm" /><span className="hidden text-sm font-medium text-soft lg:block">Admin Jashore</span></div>
      </div>
    </header>
  )
}
