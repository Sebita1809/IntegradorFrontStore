export type ProductoBasicRead = {
  id: number
  nombre: string
  precio_base: number
  stock_cantidad: number
}

export type CategoriaShort = {
  id: number
  nombre: string
}

export type Categoria = {
  id: number
  padre: CategoriaShort | null
  nombre: string
  descripcion: string
  imagen_url: string
  activo: boolean
  created_at: string
  updated_at: string
  deleted_at: string | null
  productos: ProductoBasicRead[]
}

export type CategoriaPaginada = {
  total: number
  data: Categoria[]
}

export type CategoriaTree = {
  id: number
  nombre: string
  descripcion: string | null
  imagen_url: string | null
  parent_id: number | null
  subcategorias: CategoriaTree[]
}
