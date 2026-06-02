import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return <p className="p-8 text-orange-600">Verificando sesión...</p>
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}
