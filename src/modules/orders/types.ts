/* ─── Pedido ──────────────────────────────────────────────────── */

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

export type HistorialEstado = {
  id: number
  pedido_id: number
  estado_desde: string | null
  estado_hasta: string
  motivo: string | null
  created_at: string
}

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

/* ─── Estado ──────────────────────────────────────────────────── */

export type EstadoPedido = {
  codigo: string
  descripcion: string
  orden: number
  es_terminal: boolean
}

/* ─── Forma de pago ──────────────────────────────────────────── */

export type FormaPago = {
  codigo: string
  descripcion: string
  habilitado: boolean
}
