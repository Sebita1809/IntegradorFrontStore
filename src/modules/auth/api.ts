import { http, setAccessToken } from '../../shared/http/http'
import type { Direccion } from '../addresses/types'

/** Respuesta de /auth/login y /auth/refresh (el back devuelve un Bearer). */
type TokenRead = {
  access_token: string
  token_type: string
  expires_in: number
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
  /**
   * El backend valida credenciales, setea la cookie del refresh token y
   * devuelve el access token en el body. Lo guardamos para mandarlo como Bearer.
   */
  async login(email: string, password: string): Promise<void> {
    const { data } = await http.post<TokenRead>('/auth/login', { email, password })
    setAccessToken(data.access_token)
  },

  async me(): Promise<User> {
    const { data } = await http.get<User>('/auth/me')
    return data
  },

  /** El backend borra la cookie del refresh token; limpiamos el access local. */
  async logout(): Promise<void> {
    try {
      await http.post('/auth/logout')
    } finally {
      setAccessToken(null)
    }
  },

  async registrar(payload: { email: string; password: string; nombre: string; apellido: string; celular: string }): Promise<User> {
    const { data } = await http.post<User>('/auth/register', payload)
    return data
  },
}
