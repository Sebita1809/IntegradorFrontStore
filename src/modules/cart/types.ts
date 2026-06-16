export type CarritoItem = {
  producto_id: number
  nombre: string
  precio_base: number
  stock_cantidad: number
  cantidad: number
  personalizacion: number[] // IDs de ingredientes a REMOVER del producto
}
