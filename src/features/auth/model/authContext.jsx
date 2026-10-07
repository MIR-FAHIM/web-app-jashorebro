import React, { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check saved session/token
    const token = localStorage.getItem('jb_auth_token')
    const savedUser = localStorage.getItem('jb_auth_user')

    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser))
      } catch {
        localStorage.removeItem('jb_auth_user')
      }
    }
    setIsLoading(false)
  }, [])

  const login = (userData, token) => {
    setUser(userData)
    if (token) localStorage.setItem('jb_auth_token', token)
    localStorage.setItem('jb_auth_user', JSON.stringify(userData))
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('jb_auth_token')
    localStorage.removeItem('jb_auth_user')
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: Boolean(user), login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
