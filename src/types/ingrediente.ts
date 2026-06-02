import type { ProductoBasicRead } from './categoria'

export type Ingrediente = {
  id: number
  nombre: string
  descripcion: string
  es_alergeno: boolean
  activo: boolean
  created_at: string
  updated_at: string
  producto_links: ProductoBasicRead[]
}
