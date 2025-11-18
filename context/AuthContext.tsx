'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { User, getCurrentUser, isAuthenticated, logout as logoutService } from '@/services/auth'
import Cookies from 'js-cookie'

/**
 * Контекст авторизации для управления состоянием пользователя
 */

interface AuthContextType {
  user: User | null
  loading: boolean
  isAuth: boolean
  login: (user: User) => void
  logout: () => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // Загрузка пользователя при монтировании
  useEffect(() => {
    const loadUser = async () => {
      if (isAuthenticated()) {
        try {
          const currentUser = await getCurrentUser()
          setUser(currentUser)
        } catch (error) {
          // Токен невалиден
          Cookies.remove('token')
        }
      }
      setLoading(false)
    }
    loadUser()
  }, [])

  const login = (userData: User) => {
    setUser(userData)
  }

  const logout = () => {
    logoutService()
    setUser(null)
  }

  const refreshUser = async () => {
    if (isAuthenticated()) {
      try {
        const currentUser = await getCurrentUser()
        setUser(currentUser)
      } catch (error) {
        logout()
      }
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuth: !!user,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth должен использоваться внутри AuthProvider')
  }
  return context
}

