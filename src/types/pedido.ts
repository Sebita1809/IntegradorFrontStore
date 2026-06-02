import type { DetallePedido } from './detalle-pedido'
import type { HistorialEstado } from './historial-estado'

export type Pedido = {
  id: number
  estado_codigo: string
  forma_pago_codigo: string
  subtotal: number
  descuento: number
  costo_envio: number
  total: number
  notas: string
  detalle_pedidos: DetallePedido[]
  historial_estado: HistorialEstado[]
  created_at: string
  updated_at: string
}

export type PedidoCreate = {
  forma_pago_codigo: string
  descuento: number
  costo_envio: number
  notas: string
  detalle_pedidos: {
    producto_id: number
    cantidad: number
    personalizacion: number[]
  }[]
}
