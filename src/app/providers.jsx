import { AuthProvider } from '@/features/auth/model/authContext'
import { CartProvider } from '@/features/cart/model/cartContext'

export function AppProviders({ children }) {
  return (
    <AuthProvider>
      {/* TanStack QueryClientProvider will be added here during API integration */}
      <CartProvider>{children}</CartProvider>
    </AuthProvider>
  )
}
