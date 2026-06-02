import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { authApi, type User } from '../api/auth.api'

type AuthContextType = {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Al montar, ver si ya hay un token guardado y cargar el usuario
  useEffect(() => {
    init()
  }, [])

  async function init() {
    const token = localStorage.getItem('access_token')
    if (!token) {
      setIsLoading(false)
      return
    }

    try {
      const u = await authApi.me()
      setUser(u)
    } catch {
      localStorage.removeItem('access_token')
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }

  const login = useCallback(async (email: string, password: string) => {
    const token = await authApi.login(email, password)
    localStorage.setItem('access_token', token.access_token)

    const u = await authApi.me()
    setUser(u)
  }, [])

  const logout = useCallback(() => {
    authApi.logout().catch(() => {})
    localStorage.removeItem('access_token')
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth necesita un AuthProvider')
  return ctx
}
