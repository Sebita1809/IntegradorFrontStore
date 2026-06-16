import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { authApi, type User } from '../api'

type AuthState = {
  user: User | null
  isLoading: boolean
  init: () => Promise<void>
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

// Store de sesion. El JWT vive en una cookie HttpOnly, asi que el front no lo
// ve: solo guardamos el usuario para pintar la UI al instante y revalidamos con
// el server en init().
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isLoading: true,

      init: async () => {
        // Al arrancar preguntamos al server con la cookie. Si no hay sesion
        // valida, /auth/me responde 401 y quedamos sin usuario.
        try {
          const user = await authApi.me()
          set({ user })
        } catch {
          set({ user: null })
        } finally {
          set({ isLoading: false })
        }
      },

      login: async (email, password) => {
        // login setea la cookie HttpOnly en el server; el front no ve el token.
        await authApi.login(email, password)
        const user = await authApi.me()
        set({ user })
      },

      logout: () => {
        // logout borra la cookie en el server.
        authApi.logout().catch(() => {})
        set({ user: null })
      },
    }),
    {
      name: 'food-store-auth',
      // Solo persistimos el usuario; init() siempre revalida contra el server.
      partialize: (state) => ({ user: state.user }),
    }
  )
)
