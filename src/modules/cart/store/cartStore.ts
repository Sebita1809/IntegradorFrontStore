import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CarritoItem } from '../types'

type ProductoParaCarrito = {
  id: number
  nombre: string
  precio_base: number
  stock_cantidad: number
}

type CartState = {
  items: CarritoItem[]
  addItem: (producto: ProductoParaCarrito, personalizacion?: number[]) => void
  removeItem: (producto_id: number) => void
  updateCantidad: (producto_id: number, cantidad: number) => void
  togglePersonalizacion: (producto_id: number, ingrediente_id: number) => void
  limpiar: () => void
  cantidadTotal: () => number
  total: () => number
}

// Store del carrito. persist lo guarda en localStorage, asi sobrevive a recargas.
export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (producto, personalizacion) =>
        set((state) => {
          const i = state.items.findIndex((x) => x.producto_id === producto.id)
          if (i >= 0) {
            // Ya estaba: le sumamos uno, sin pasarnos del stock disponible.
            const items = [...state.items]
            const nuevaCantidad = Math.min(items[i].cantidad + 1, items[i].stock_cantidad)
            items[i] = { ...items[i], cantidad: nuevaCantidad }
            return { items }
          }
          return {
            items: [
              ...state.items,
              {
                producto_id: producto.id,
                nombre: producto.nombre,
                precio_base: producto.precio_base,
                stock_cantidad: producto.stock_cantidad,
                cantidad: 1,
                personalizacion: personalizacion ?? [],
              },
            ],
          }
        }),

      removeItem: (producto_id) =>
        set((state) => ({
          items: state.items.filter((x) => x.producto_id !== producto_id),
        })),

      updateCantidad: (producto_id, cantidad) => {
        if (cantidad < 1) return
        set((state) => ({
          items: state.items.map((x) =>
            x.producto_id === producto_id
              ? { ...x, cantidad: Math.min(cantidad, x.stock_cantidad) }
              : x
          ),
        }))
      },

      togglePersonalizacion: (producto_id, ingrediente_id) =>
        set((state) => ({
          items: state.items.map((x) => {
            if (x.producto_id !== producto_id) return x
            const has = x.personalizacion.includes(ingrediente_id)
            return {
              ...x,
              personalizacion: has
                ? x.personalizacion.filter((id) => id !== ingrediente_id)
                : [...x.personalizacion, ingrediente_id],
            }
          }),
        })),

      limpiar: () => set({ items: [] }),

      cantidadTotal: () => get().items.reduce((sum, x) => sum + x.cantidad, 0),

      total: () => get().items.reduce((sum, x) => sum + x.precio_base * x.cantidad, 0),
    }),
    { name: 'food-store-carrito' }
  )
)
