import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import authService from '../api/services/authService'

const STORAGE_TOKEN_KEY = 'nak_member_token'
const STORAGE_USER_KEY = 'nak_member_user'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => {
    return localStorage.getItem(STORAGE_TOKEN_KEY) || null
  })

  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_USER_KEY)
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })

  const [loading, setLoading] = useState(true)

  // Initialize auth state
  useEffect(() => {
    const savedToken = localStorage.getItem(STORAGE_TOKEN_KEY)
    let savedUser = null
    try {
      const userStr = localStorage.getItem(STORAGE_USER_KEY)
      savedUser = userStr ? JSON.parse(userStr) : null
    } catch {
      savedUser = null
    }

    if (savedToken && savedUser) {
      setToken(savedToken)
      setUser(savedUser)
    } else {
      localStorage.removeItem(STORAGE_TOKEN_KEY)
      localStorage.removeItem(STORAGE_USER_KEY)
      setToken(null)
      setUser(null)
    }
    setLoading(false)
  }, [])

  const login = useCallback((newToken, newUser) => {
    if (!newToken || !newUser) return

    localStorage.setItem(STORAGE_TOKEN_KEY, newToken)
    localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(newUser))

    setToken(newToken)
    setUser(newUser)
  }, [])

  const logout = useCallback(async () => {
    try {
      if (token) {
        await authService.logoutMember().catch(() => {})
      }
    } finally {
      localStorage.removeItem(STORAGE_TOKEN_KEY)
      localStorage.removeItem(STORAGE_USER_KEY)
      setToken(null)
      setUser(null)
    }
  }, [token])

  const updateUser = useCallback((userData) => {
    setUser((prev) => {
      const updated = typeof userData === 'function' ? userData(prev) : { ...prev, ...userData }
      localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(updated))
      return updated
    })
  }, [])

  // Listen to 401 token expiration events dispatched by axiosClient
  useEffect(() => {
    const handleAuthExpired = () => {
      logout()
    }

    window.addEventListener('nak:auth-expired', handleAuthExpired)
    return () => {
      window.removeEventListener('nak:auth-expired', handleAuthExpired)
    }
  }, [logout])

  const value = {
    token,
    user,
    isAuthenticated: Boolean(token && user),
    loading,
    login,
    logout,
    updateUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export default AuthContext

