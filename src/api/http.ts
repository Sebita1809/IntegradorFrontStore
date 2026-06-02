import axios, { AxiosError } from 'axios'

const rawUrl = import.meta.env.VITE_API_BASE_URL as string | undefined

if (!rawUrl) {
  throw new Error('Falta configurar VITE_API_BASE_URL en el .env')
}

const baseURL = import.meta.env.DEV ? '/api/v1' : `${rawUrl.replace(/\/+$/, '')}/api/v1`

export const http = axios.create({
  baseURL,
  withCredentials: true,
  headers: { Accept: 'application/json' },
})

// Adjunta el access_token a cada request
http.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Si recibimos 401, limpiamos el token
http.interceptors.response.use(
  (res) => res,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token')
      localStorage.removeItem('user_id')
    }
    return Promise.reject(error)
  },
)

export function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    return JSON.parse(atob(parts[1]))
  } catch {
    return null
  }
}
