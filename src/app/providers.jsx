import React from 'react'
import { AuthProvider } from '@/features/auth/model/authContext'

export function AppProviders({ children }) {
  return (
    <AuthProvider>
      {/* TanStack QueryClientProvider will be added here during API integration */}
      {children}
    </AuthProvider>
  )
}
