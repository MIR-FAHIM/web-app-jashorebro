import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Flame, Search, ShoppingBag } from 'lucide-react'
import { useAuth } from '@/features/auth/model/authContext'
import { useCart } from '@/features/cart/model/cartContext'
import { Avatar } from '@/shared/ui/Avatar'

export function ConsumerHeader() {
  const { user } = useAuth()
  const { itemCount } = useCart()
  const [query, setQuery] = useState('')
  const navigate = useNavigate()

  const search = (event) => {
    event.preventDefault()
    navigate(`/explore?q=${encodeURIComponent(query.trim())}`)
  }

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-canvas/90 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-2 px-4 sm:gap-4 sm:px-6">
        <Link to="/" className="flex shrink-0 items-center gap-2" aria-label="JashoreBro home">
          <span className="flex size-9 items-center justify-center rounded-xl bg-brand text-on-brand"><Flame size={21} strokeWidth={2.5} /></span>
          <span className="text-base font-bold tracking-tight text-ink">Jashore<span className="text-brand">Bro</span></span>
        </Link>
        <form onSubmit={search} role="search" className="relative mx-4 hidden w-full max-w-md md:block">
          <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
          <input aria-label="Search products and drops" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Find your next favorite" className="min-h-11 w-full rounded-xl border border-line bg-surface py-2.5 pl-11 pr-14 text-sm text-ink placeholder:text-muted focus:border-brand focus:outline-none" />
          <button type="submit" aria-label="Submit search" className="absolute right-1 top-0.5 flex size-10 items-center justify-center rounded-lg text-muted hover:bg-elevated"><Search size={16} /></button>
        </form>
        <div className="flex shrink-0 items-center gap-0.5 sm:gap-2">
          <Link to="/explore" aria-label="Search products" className="flex size-11 items-center justify-center rounded-xl text-muted hover:bg-elevated hover:text-ink md:hidden"><Search size={20} /></Link>
          <Link to="/cart" aria-label={`Cart, ${itemCount} items`} className="relative flex size-11 items-center justify-center rounded-xl text-soft hover:bg-elevated">
            <ShoppingBag size={21} />
            {itemCount > 0 && <span className="absolute right-0.5 top-0.5 flex min-w-4.5 items-center justify-center rounded-full bg-brand px-1 text-[10px] font-bold text-on-brand">{itemCount > 99 ? '99+' : itemCount}</span>}
          </Link>
          <Link to={user ? '/profile' : '/auth'} aria-label={user ? 'Your profile' : 'Sign in'} className="flex size-11 items-center justify-center rounded-xl hover:bg-elevated"><Avatar name={user?.name || 'Guest'} size="sm" /></Link>
        </div>
      </div>
    </header>
  )
}
