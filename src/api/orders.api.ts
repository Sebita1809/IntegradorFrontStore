import { http } from './http'
import type { Pedido, PedidoCreate } from '../types/pedido'


export const ordersApi = {
  /** GET /pedidos/usuario/{userId} — Lista pedidos del usuario */
  async listarPorUsuario(userId: number): Promise<Pedido[]> {
    const { data } = await http.get<Pedido[]>(`/pedidos/usuario/${userId}`)
    return data
  },

  /** GET /pedidos/{id} — Detalle de un pedido */
  async obtenerPorId(id: number): Promise<Pedido> {
    const { data } = await http.get<Pedido>(`/pedidos/${id}`)
    return data
  },

  /** POST /pedidos/ — Crea un nuevo pedido */
  async crear(payload: PedidoCreate): Promise<Pedido> {
    const { data } = await http.post<Pedido>('/pedidos/', payload)
    return data
  },

  /** PATCH /pedidos/{id} — Cancela un pedido (estado_bool: false) */
  async cancelar(id: number, motivo?: string): Promise<Pedido> {
    const { data } = await http.patch<Pedido>(`/pedidos/${id}`, { estado_bool: false, motivo: motivo || '' })
    return data
  },
}
