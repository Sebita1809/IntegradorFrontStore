import { createContext, useContext, useState, useEffect, useCallback, useMemo, type ReactNode } from 'react'

export type CarritoItem = {
  producto_id: number
  nombre: string
  precio_base: number
  stock_cantidad: number
  cantidad: number
  personalizacion: number[] // IDs de ingredientes a REMOVER del producto
}

type CarritoContextType = {
  items: CarritoItem[]
  addItem: (producto: {
    id: number; nombre: string; precio_base: number; stock_cantidad: number
  }, personalizacion?: number[]) => void
  removeItem: (producto_id: number) => void
  updateCantidad: (producto_id: number, cantidad: number) => void
  togglePersonalizacion: (producto_id: number, ingrediente_id: number) => void
  limpiar: () => void
  cantidadTotal: number
  total: number
}

const STORAGE_KEY = 'food-store-carrito'

function leerStorage(): CarritoItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

const CarritoContext = createContext<CarritoContextType | undefined>(undefined)

function CarritoProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CarritoItem[]>(leerStorage)

  // Persiste a localStorage en cada cambio
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  }, [items])

  // Sincroniza entre pestañas con el evento 'storage'
  useEffect(() => {
    function handleStorageChange(e: StorageEvent) {
      if (e.key === STORAGE_KEY) {
        setItems(leerStorage())
      }
    }
    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  const addItem = useCallback((producto: {
    id: number; nombre: string; precio_base: number; stock_cantidad: number
  }, personalizacion?: number[]) => {
    setItems(prev => {
      const i = prev.findIndex(x => x.producto_id === producto.id)
      if (i >= 0) {
        const next = [...prev]
        next[i] = { ...next[i], cantidad: next[i].cantidad + 1 }
        return next
      }
      return [...prev, {
        producto_id: producto.id,
        nombre: producto.nombre,
        precio_base: producto.precio_base,
        stock_cantidad: producto.stock_cantidad,
        cantidad: 1,
        personalizacion: personalizacion ?? [],
      }]
    })
  }, [])

  const removeItem = useCallback((producto_id: number) => {
    setItems(prev => prev.filter(x => x.producto_id !== producto_id))
  }, [])

  const updateCantidad = useCallback((producto_id: number, cantidad: number) => {
    if (cantidad < 1) return
    setItems(prev =>
      prev.map(x => x.producto_id === producto_id ? { ...x, cantidad } : x)
    )
  }, [])

  const togglePersonalizacion = useCallback((producto_id: number, ingrediente_id: number) => {
    setItems(prev =>
      prev.map(x => {
        if (x.producto_id !== producto_id) return x
        const has = x.personalizacion.includes(ingrediente_id)
        return {
          ...x,
          personalizacion: has
            ? x.personalizacion.filter(id => id !== ingrediente_id)
            : [...x.personalizacion, ingrediente_id],
        }
      })
    )
  }, [])

  const limpiar = useCallback(() => {
    setItems([])
  }, [])

  const cantidadTotal = useMemo(() =>
    items.reduce((sum, x) => sum + x.cantidad, 0), [items]
  )

  const total = useMemo(() =>
    items.reduce((sum, x) => sum + x.precio_base * x.cantidad, 0), [items]
  )

  const value: CarritoContextType = {
    items, addItem, removeItem, updateCantidad, togglePersonalizacion, limpiar, cantidadTotal, total,
  }

  return <CarritoContext.Provider value={value}>{children}</CarritoContext.Provider>
}

function useCarrito(): CarritoContextType {
  const ctx = useContext(CarritoContext)
  if (!ctx) throw new Error('useCarrito debe usarse dentro de <CarritoProvider>')
  return ctx
}

export { CarritoProvider, useCarrito }
