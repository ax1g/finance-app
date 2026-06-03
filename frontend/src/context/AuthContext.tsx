/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react"
import { isAuthenticated, clearTokens } from "../api/client"
import type { LoginRequest, UserRead } from "../types"
import * as authApi from "../api/auth"

interface AuthContextValue {
  isAuth: boolean
  user: UserRead | null
  login: (data: LoginRequest) => Promise<void>
  signup: (data: { username: string; email: string; password: string }) => Promise<void>
  logout: () => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

function syncCurrency(user: UserRead | null) {
  if (user?.currency) {
    localStorage.setItem("currency", user.currency)
  }
  if (user?.currency_custom_symbol) {
    localStorage.setItem("currency_custom_symbol", user.currency_custom_symbol)
  } else {
    localStorage.removeItem("currency_custom_symbol")
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuth, setIsAuth] = useState(isAuthenticated)
  const [user, setUser] = useState<UserRead | null>(null)

  const refreshUser = useCallback(async () => {
    try {
      const u = await authApi.fetchCurrentUser()
      setUser(u)
      syncCurrency(u)
    } catch {
      // ignore
    }
  }, [])

  useEffect(() => {
    const handleUnauthorized = () => {
      clearTokens()
      setIsAuth(false)
      setUser(null)
    }
    window.addEventListener("auth:unauthorized", handleUnauthorized)
    return () => window.removeEventListener("auth:unauthorized", handleUnauthorized)
  }, [])

  useEffect(() => {
    if (isAuth) {
      refreshUser()
    }
  }, [isAuth, refreshUser])

  const login = useCallback(async (data: LoginRequest) => {
    await authApi.login(data)
    setIsAuth(true)
  }, [])

  const signup = useCallback(
    async (data: { username: string; email: string; password: string }) => {
      await authApi.signup(data)
    },
    [],
  )

  const logout = useCallback(() => {
    clearTokens()
    setIsAuth(false)
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ isAuth, user, login, signup, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
