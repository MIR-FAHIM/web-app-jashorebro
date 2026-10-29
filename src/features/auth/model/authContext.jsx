import React, { createContext, useContext, useState, useEffect } from 'react'
import { authApi } from '../api/authApi'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function initAuth() {
      const token = localStorage.getItem('jb_auth_token')
      const savedUser = localStorage.getItem('jb_auth_user')

      if (token) {
        if (savedUser) {
          try {
            setUser(JSON.parse(savedUser))
          } catch {
            localStorage.removeItem('jb_auth_user')
          }
        }

        // Verify with backend
        try {
          const freshUser = await authApi.getMe()
          setUser(freshUser)
          localStorage.setItem('jb_auth_user', JSON.stringify(freshUser))
        } catch (err) {
          // If token expired, clear
          if (err.status === 401) {
            setUser(null)
            localStorage.removeItem('jb_auth_token')
            localStorage.removeItem('jb_auth_user')
          }
        }
      }
      setIsLoading(false)
    }

    initAuth()
  }, [])

  const login = async (phone, password) => {
    const data = await authApi.login({ phone, password })
    setUser(data.user)
    localStorage.setItem('jb_auth_token', data.token)
    localStorage.setItem('jb_auth_user', JSON.stringify(data.user))
    sessionStorage.setItem('jb_login_welcome_pending', 'true')
    sessionStorage.removeItem('jb_login_welcome_dismissed')
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('jb:login-success', { detail: data.user }))
    }
    return data.user
  }

  const register = async (formData) => {
    const data = await authApi.register(formData)
    setUser(data.user)
    localStorage.setItem('jb_auth_token', data.token)
    localStorage.setItem('jb_auth_user', JSON.stringify(data.user))
    sessionStorage.setItem('jb_login_welcome_pending', 'true')
    sessionStorage.removeItem('jb_login_welcome_dismissed')
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('jb:login-success', { detail: data.user }))
    }
    return data.user
  }

  const logout = async () => {
    try {
      await authApi.logout()
    } catch {
      // Continue client cleanup even if network fails
    }
    setUser(null)
    localStorage.removeItem('jb_auth_token')
    localStorage.removeItem('jb_auth_user')
  }

  const updateUser = (updatedUser) => {
    setUser((prev) => {
      const merged = { ...prev, ...updatedUser }
      localStorage.setItem('jb_auth_user', JSON.stringify(merged))
      return merged
    })
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user),
        isLoading,
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
