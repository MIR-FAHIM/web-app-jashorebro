import { ShoppingBag, HeartHandshake, Users, User } from 'lucide-react'

export const CONSUMER_NAV_ITEMS = [
  { section: 'shop', to: '/', labelKey: 'nav.shop', icon: ShoppingBag },
  { section: 'community', to: '/community', labelKey: 'nav.community', icon: HeartHandshake },
  { section: 'friends', to: '/friends', labelKey: 'nav.friends', icon: Users },
  { section: 'profile', to: '/profile', labelKey: 'nav.profile', icon: User },
]

const matchesPath = (pathname, base) => pathname === base || pathname.startsWith(`${base}/`)

export function getConsumerSection(pathname) {
  pathname = pathname.toLowerCase().replace(/\/+$/, '') || '/'
  if (['/community', '/feed'].some((path) => matchesPath(pathname, path))) {
    return 'community'
  }

  if (
    pathname.startsWith('/profile/') ||
    pathname.startsWith('/@') ||
    ['/friends', '/friend-picks', '/users', '/u'].some((path) => matchesPath(pathname, path))
  ) {
    return 'friends'
  }

  if (
    pathname === '/profile' ||
    [
      '/my-picks', '/orders', '/activity', '/earnings',
      '/leaderboards', '/settings', '/addresses', '/notifications', '/my-shop',
    ].some((path) => matchesPath(pathname, path))
  ) {
    return 'profile'
  }

  return 'shop'
}
