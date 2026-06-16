import { create } from 'zustand'

export type Toast = {
  id: number
  mensaje: string
  tipo: 'success' | 'error' | 'info'
}

type UiState = {
  toasts: Toast[]
  addToast: (mensaje: string, tipo?: Toast['tipo']) => void
  removeToast: (id: number) => void
}

let nextId = 1

export const useUiStore = create<UiState>((set) => ({
  toasts: [],

  addToast: (mensaje, tipo = 'info') => {
    const id = nextId++
    set((state) => ({ toasts: [...state.toasts, { id, mensaje, tipo }] }))
    // Se borra solo a los 3 segundos.
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }))
    }, 3000)
  },

  removeToast: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}))
