import { AuthProvider } from '@/features/auth/model/authContext'
import { CartProvider } from '@/features/cart/model/cartContext'
import { FriendsProvider } from '@/features/friends/model/friendsContext'
import { LocaleProvider } from '@/shared/i18n/LocaleProvider'

export function AppProviders({ children }) {
  return (
    <LocaleProvider><AuthProvider>
      <FriendsProvider>
        <CartProvider>{children}</CartProvider>
      </FriendsProvider>
    </AuthProvider></LocaleProvider>
  )
}

