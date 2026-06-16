import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((s) => s.user)
  const isLoading = useAuthStore((s) => s.isLoading)

  if (isLoading) {
    return <p className="p-8 text-orange-600">Verificando sesión...</p>
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}
