import { http } from './http'
import type { CategoriaPaginada, CategoriaTree } from '../types/categoria'

type ListarParams = {
  offset?: number
  limit?: number
  nombre?: string
}

export const categoriesApi = {
  async listar(params?: ListarParams): Promise<CategoriaPaginada> {
    const { data } = await http.get<CategoriaPaginada>('/categorias/', { params })
    return data
  },

  async tree(): Promise<CategoriaTree[]> {
    const { data } = await http.get<CategoriaTree[]>('/categorias/tree')
    return data
  },
}
