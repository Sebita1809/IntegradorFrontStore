import { http } from './http'
import type { FormaPago } from '../types/forma-pago'

export const formasPagoApi = {
  async listar() {
    const { data } = await http.get<FormaPago[]>('/forma-pago')
    return data
  },
}
