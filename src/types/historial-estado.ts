export type HistorialEstado = {
  id: number
  pedido_id: number
  estado_desde: string | null
  estado_hasta: string
  motivo: string | null
  created_at: string
}
