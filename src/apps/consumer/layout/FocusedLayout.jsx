import { Link, Outlet, useLocation } from 'react-router-dom'
import { ArrowLeft, Flame } from 'lucide-react'

export function FocusedLayout() {
  const { pathname } = useLocation()
  return (
    <div className="flex min-h-dvh flex-col bg-canvas text-ink">
      <header className="sticky top-0 z-40 border-b border-line bg-canvas/95 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
          <Link to={pathname === '/checkout' ? '/cart' : '/'} className="flex min-h-11 items-center gap-2 rounded-xl px-2 text-sm text-muted hover:bg-elevated hover:text-ink"><ArrowLeft size={20} /><span>Back</span></Link>
          <Link to="/" className="flex items-center gap-2 text-sm font-bold"><Flame size={18} className="text-brand" />Jashore<span className="-ml-2 text-brand">Bro</span></Link>
          <span className="rounded-full border border-line px-3 py-1 text-xs text-muted">Preview</span>
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 pb-safe"><Outlet /></main>
    </div>
  )
}
