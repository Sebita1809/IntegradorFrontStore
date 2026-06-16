import { Link, useParams, useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { paymentsApi } from '../api'

// Página a la que MercadoPago nos devuelve tras el pago (back_url ->
// /api/v1/pagos/redirect/{id}/{status} -> redirige acá). Acá llamamos a
// /pagos/confirm para finalizar el pedido sin depender del webhook.
export function PaymentResultPage() {
  const { pedidoId } = useParams()
  const [searchParams] = useSearchParams()
  const id = Number(pedidoId)
  const mpPaymentId = searchParams.get('payment_id') ?? searchParams.get('collection_id')

  const confirmQuery = useQuery({
    queryKey: ['pago-confirm', id, mpPaymentId],
    queryFn: () =>
      paymentsApi.confirmar(id, mpPaymentId ? Number(mpPaymentId) : undefined),
    enabled: Number.isFinite(id),
    retry: 1,
  })

  // El back devuelve CONFIRMADO / CANCELADO / pendiente (o el mp_status si ya estaba procesado). Normalizamos a tres resultados.
  const estado = (confirmQuery.data?.estado ?? '').toUpperCase()
  const aprobado = estado === 'CONFIRMADO' || estado === 'APPROVED'
  const rechazado =
    estado === 'CANCELADO' ||
    estado === 'REJECTED' ||
    estado === 'CANCELLED' ||
    estado === 'REFUNDED' ||
    estado === 'CHARGED_BACK'

  return (
    <div className="mx-auto max-w-md py-10 text-center">
      <div className="rounded-2xl bg-white p-8 shadow-sm">
        {confirmQuery.isLoading ? (
          <p className="text-gray-600">Procesando tu pago...</p>
        ) : confirmQuery.isError ? (
          <>
            <h1 className="text-lg font-bold text-gray-800">No pudimos confirmar el pago</h1>
            <p className="mt-2 text-sm text-gray-500">
              Revisá el estado en tus pedidos en unos minutos.
            </p>
          </>
        ) : aprobado ? (
          <>
            <p className="text-4xl">✅</p>
            <h1 className="mt-3 text-lg font-bold text-gray-800">¡Pago aprobado!</h1>
            <p className="mt-2 text-sm text-gray-500">Tu pedido fue confirmado.</p>
          </>
        ) : rechazado ? (
          <>
            <p className="text-4xl">❌</p>
            <h1 className="mt-3 text-lg font-bold text-gray-800">Pago rechazado</h1>
            <p className="mt-2 text-sm text-gray-500">
              Tu pedido fue cancelado y el stock fue restituido.
            </p>
          </>
        ) : (
          <>
            <p className="text-4xl">⏳</p>
            <h1 className="mt-3 text-lg font-bold text-gray-800">Pago pendiente</h1>
            <p className="mt-2 text-sm text-gray-500">
              Te avisaremos cuando se acredite.
            </p>
          </>
        )}

        <div className="mt-6 flex flex-col gap-2">
          {Number.isFinite(id) && (
            <Link
              to={`/pedidos/${id}`}
              className="rounded-xl bg-orange-500 px-6 py-3 text-sm font-semibold text-white hover:bg-orange-600"
            >
              Ver mi pedido
            </Link>
          )}
          <Link
            to="/"
            className="text-sm font-medium text-orange-600 hover:text-orange-800"
          >
            Volver a la tienda
          </Link>
        </div>
      </div>
    </div>
  )
}
