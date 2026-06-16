import { create } from 'zustand'

// Evento que manda el backend cuando cambia un pedido.
export type WsEvent = {
  event?: string
  pedido_id?: number
  estado_nuevo?: string
  estado_anterior?: string | null
  [key: string]: unknown
}

type WsState = {
  conectado: boolean
  ultimoEvento: WsEvent | null
  setConectado: (conectado: boolean) => void
  setUltimoEvento: (evento: WsEvent) => void
}

export const useWsStore = create<WsState>((set) => ({
  conectado: false,
  ultimoEvento: null,
  setConectado: (conectado) => set({ conectado }),
  setUltimoEvento: (ultimoEvento) => set({ ultimoEvento }),
}))
