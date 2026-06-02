import { http } from './http'
import type { Producto, ProductoPaginado } from '../types/producto'

type ListarParams = {
  offset?: number
  limit?: number
  nombre?: string
  categoria_id?: number
}

export const productsApi = {
  async listar(params?: ListarParams): Promise<ProductoPaginado> {
    const { data } = await http.get<ProductoPaginado>('/productos/', { params })
    return data
  },

  async obtenerPorId(id: number): Promise<Producto> {
    const { data } = await http.get<Producto>(`/productos/${id}`)
    return data
  },
}
