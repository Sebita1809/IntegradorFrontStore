import { http } from './http'
import type { Direccion, DireccionCreate } from '../types/direccion'

export const addressesApi = {
  async listar(): Promise<Direccion[]> {
    const { data } = await http.get<Direccion[]>('/direcciones/')
    // El backend hace soft delete, filtra las borradas
    return data.filter((d) => d.deleted_at === null)
  },

  async crear(payload: DireccionCreate): Promise<Direccion> {
    const { data } = await http.post<Direccion>('/direcciones/', payload)
    return data
  },

  async actualizar(id: number, payload: Partial<DireccionCreate>): Promise<Direccion> {
    const { data } = await http.patch<Direccion>(`/direcciones/${id}`, payload)
    return data
  },

  async eliminar(id: number): Promise<void> {
    await http.delete(`/direcciones/${id}`)
  },

  async marcarPrincipal(id: number): Promise<Direccion> {
    const { data } = await http.patch<Direccion>(`/direcciones/${id}/principal`)
    return data
  },
}
