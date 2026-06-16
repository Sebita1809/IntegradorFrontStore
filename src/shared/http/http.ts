import axios, { AxiosError } from 'axios'

const baseURL = import.meta.env.DEV
  ? '/api/v1'
  : (() => {
      const rawUrl = import.meta.env.VITE_API_BASE_URL as string | undefined
      if (!rawUrl) throw new Error('Falta configurar VITE_API_BASE_URL en el .env')
      return `${rawUrl.replace(/\/+$/, '')}/api/v1`
    })()

// El access token (de vida corta) vive SOLO en memoria, no en localStorage:
// asi no queda expuesto a XSS de forma persistente. Si se pierde (al recargar
// la pagina) lo recuperamos con /auth/refresh, que usa la cookie HttpOnly del
// refresh token. El back lo espera en el header Authorization: Bearer.
let accessToken: string | null = null
export const setAccessToken = (token: string | null): void => {
  accessToken = token
}
export const getAccessToken = (): string | null => accessToken

// `withCredentials: true` hace que el browser adjunte la cookie HttpOnly del
// refresh token en cada request (y en el handshake del WebSocket).
export const http = axios.create({
  baseURL,
  withCredentials: true,
  headers: { Accept: 'application/json' },
})

// Adjunta el access token como Bearer en cada request (cuando lo tenemos).
http.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`
  }
  return config
})

// Endpoints donde NO tiene sentido intentar refrescar (evita bucles).
const SIN_REFRESH = ['/auth/login', '/auth/register', '/auth/refresh']

// Si una request vuelve 401, probamos refrescar el token UNA vez (el refresh
// token viaja en la cookie HttpOnly) y reintentamos la request original.
http.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config as
      | (typeof error.config & { _retry?: boolean })
      | undefined

    const esRefrescable =
      error.response?.status === 401 &&
      original &&
      !original._retry &&
      !SIN_REFRESH.some((url) => original.url?.includes(url))

    if (esRefrescable && original) {
      original._retry = true
      try {
        // /auth/refresh usa la cookie del refresh token y devuelve un access
        // token nuevo en el body: lo guardamos y reintentamos la request, que
        // ya saldra con el header Authorization actualizado.
        const { data } = await http.patch<{ access_token: string }>(
          '/auth/refresh',
        )
        setAccessToken(data.access_token)
        return http(original)
      } catch {
        // El refresh tambien fallo: la sesion expiro de verdad.
        setAccessToken(null)
      }
    }

    return Promise.reject(error)
  },
)
