export type DetallePedido = {
  pedido_id: number
  producto_id: number
  cantidad: number
  nombre_snapshot: string
  precio_snapshot: number
  subtotal_snap: number
  personalizacion: number[]
  created_at: string
}
