import { AuthProvider } from '@/features/auth/model/authContext'
import { CartProvider } from '@/features/cart/model/cartContext'
import { FriendsProvider } from '@/features/friends/model/friendsContext'

export function AppProviders({ children }) {
  return (
    <AuthProvider>
      <FriendsProvider>
        <CartProvider>{children}</CartProvider>
      </FriendsProvider>
    </AuthProvider>
  )
}

