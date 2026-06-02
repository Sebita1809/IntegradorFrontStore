export type Direccion = {
  id: number
  alias: string | null
  linea1: string
  linea2: string | null
  ciudad: string
  provincia: string
  codigo_postal: string
  latitud: number
  longitud: number
  es_principal: boolean
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export type DireccionCreate = {
  alias?: string | null
  linea1: string
  linea2?: string | null
  ciudad: string
  provincia: string
  codigo_postal: string
  latitud?: number
  longitud?: number
  es_principal?: boolean
}
