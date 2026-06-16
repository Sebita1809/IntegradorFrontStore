import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type PaymentStatus = 'idle' | 'processing' | 'approved' | 'rejected'

type PaymentState = {
  status: PaymentStatus
  cardToken: string | null
  transactionId: string | null
  paymentMethodId: string | null
  setProcessing: (cardToken: string, paymentMethodId: string) => void
  setApproved: (transactionId: string) => void
  setRejected: () => void
  reset: () => void
}

// Store del proceso de pago (MercadoPago). Guarda el token de la tarjeta y el
// resultado del cobro. persist para no perder el estado si se recarga.
export const usePaymentStore = create<PaymentState>()(
  persist(
    (set) => ({
      status: 'idle',
      cardToken: null,
      transactionId: null,
      paymentMethodId: null,

      setProcessing: (cardToken, paymentMethodId) =>
        set({ status: 'processing', cardToken, paymentMethodId }),

      setApproved: (transactionId) => set({ status: 'approved', transactionId }),

      setRejected: () => set({ status: 'rejected' }),

      reset: () =>
        set({
          status: 'idle',
          cardToken: null,
          transactionId: null,
          paymentMethodId: null,
        }),
    }),
    { name: 'food-store-payment' }
  )
)
