import { http, decodeJwtPayload } from './http'
import type { Direccion } from '../types/direccion'

export type TokenRead = {
  access_token: string
  token_type: string
  expires_in: string
}

export type RolRead = {
  codigo: string
  nombre: string
  descripcion: string
}

export type User = {
  id: number
  nombre: string
  apellido: string
  email: string
  celular: string
  direcciones: Direccion[]
  activo: boolean
  roles: RolRead[]
}

export const authApi = {
  async login(email: string, password: string): Promise<TokenRead> {
    const { data } = await http.post<TokenRead>('/auth/login', { email, password })
    return data
  },

  async me(): Promise<User> {
    const { data } = await http.get<User>('/auth/me')
    return data
  },

  async logout(): Promise<void> {
    await http.post('/auth/logout')
  },

  /** Extrae el user_id del JWT sin verificarlo */
  getUserIdFromToken(): number | null {
    const token = localStorage.getItem('access_token')
    if (!token) return null
    const payload = decodeJwtPayload(token)
    if (!payload || payload.sub == null) return null
    // El backend manda sub como string ("2") o número (2)
    return typeof payload.sub === 'number' ? payload.sub : Number(payload.sub)
  },

  async registrar(payload: { email: string; password: string; nombre: string; apellido: string; celular: string }): Promise<User> {
    const { data } = await http.post<User>('/auth/register', payload)
    return data
  },
}
