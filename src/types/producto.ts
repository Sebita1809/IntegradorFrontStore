export type UnidadMedida = {
  nombre: string
  simbolo: string
  tipo: string
}

export type CategoriaBasicRead = {
  id: number
  nombre: string
  es_principal: boolean
}

export type IngredienteBasicRead = {
  id: number
  nombre: string
  es_alergeno: boolean
  cantidad: number
  unidad_medida: UnidadMedida
  es_removible: boolean
}

export type Producto = {
  id: number
  nombre: string
  descripcion: string
  precio_base: number
  imagenes_url: string[]
  stock_cantidad: number
  disponible: boolean
  unidad_medida: UnidadMedida
  categorias: CategoriaBasicRead[]
  ingredientes: IngredienteBasicRead[]
  created_at: string
  updated_at: string
}

export type ProductoPaginado = {
  total: number
  data: Producto[]
}
