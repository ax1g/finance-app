/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react"
import { isAuthenticated, clearTokens } from "../api/client"
import type { LoginRequest } from "../types"
import * as authApi from "../api/auth"

interface AuthContextValue {
  isAuth: boolean
  login: (data: LoginRequest) => Promise<void>
  signup: (data: { username: string; email: string; password: string }) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuth, setIsAuth] = useState(isAuthenticated)

  useEffect(() => {
    const handleUnauthorized = () => {
      clearTokens()
      setIsAuth(false)
    }
    window.addEventListener("auth:unauthorized", handleUnauthorized)
    return () => window.removeEventListener("auth:unauthorized", handleUnauthorized)
  }, [])

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
  }, [])

  return (
    <AuthContext.Provider value={{ isAuth, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
