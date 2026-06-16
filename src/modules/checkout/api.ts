import { http } from '../../shared/http/http'

export type PreferenciaResponse = {
  pago_id: number
  preference_id: string
  init_point?: string
  public_key?: string
}

export type ConfirmacionResponse = {
  estado: string | null
  pedido_id: number
}

export const paymentsApi = {
  /**
   * POST /pagos/create-preference — Crea la preferencia de Checkout Pro
   * y devuelve el init_point al que hay que redirigir al usuario.
   */
  async crearPreferencia(pedido_id: number): Promise<PreferenciaResponse> {
    const { data } = await http.post<PreferenciaResponse>('/pagos/create-preference', {
      pedido_id,
    })
    return data
  },

  /**
   * POST /pagos/confirm — Consulta el estado del pago en MercadoPago y
   * finaliza el pedido (aprobado -> CONFIRMADO, rechazado -> CANCELADO).
   * Lo llamamos al volver de MercadoPago para no depender solo del webhook.
   */
  async confirmar(pedido_id: number, mp_payment_id?: number): Promise<ConfirmacionResponse> {
    const { data } = await http.post<ConfirmacionResponse>('/pagos/confirm', {
      pedido_id,
      mp_payment_id: mp_payment_id ?? null,
    })
    return data
  },
}
