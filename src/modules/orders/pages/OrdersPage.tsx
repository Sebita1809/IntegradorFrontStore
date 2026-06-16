import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ordersApi } from '../api'
import { ordersQueryKeys } from '../queryKeys'
import { useOrdersRealtime } from '../hooks/useOrdersRealtime'
import { useAuthStore } from '../../auth/store/authStore'

function formatDate(iso: string) {
  return new Intl.DateTimeFormat('es-AR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(iso))
}

export function OrdersPage() {
  const user = useAuthStore((s) => s.user)

  const pedidosQuery = useQuery({
    queryKey: ordersQueryKeys.list(user!.id),
    queryFn: () => ordersApi.listarPorUsuario(user!.id),
    enabled: user !== null,
  })

  const pedidos = pedidosQuery.data ?? []

  // Conecta el WebSocket: cuando un pedido cambia de estado, la lista se
  // actualiza sola. Nos suscribimos a cada pedido para recibir sus avisos.
  const { conectado, subscribeToOrder } = useOrdersRealtime(user !== null)

  useEffect(() => {
    if (!conectado) return
    pedidos.forEach((p) => subscribeToOrder(p.id))
  }, [conectado, pedidos, subscribeToOrder])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-800">Mis Pedidos</h1>
        <span className="flex items-center gap-1.5 text-xs text-gray-400">
          <span
            className={`h-2 w-2 rounded-full ${conectado ? 'bg-green-500' : 'bg-gray-300'}`}
          />
          {conectado ? 'En vivo' : 'Sin conexión en tiempo real'}
        </span>
      </div>

      {pedidosQuery.isLoading ? (
        <p className="text-gray-500">Cargando pedidos...</p>
      ) : pedidosQuery.isError ? (
        <p className="text-red-500">No se pudieron cargar los pedidos.</p>
      ) : pedidos.length === 0 ? (
        <div>
          <p className="text-gray-500">No hay pedidos todavía.</p>
          <Link to="/" className="mt-2 inline-block text-sm text-orange-600 hover:text-orange-800">
            Ir a la tienda
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {pedidos.map((p) => (
            <Link
              key={p.id}
              to={`/pedidos/${p.id}`}
              className="block rounded-2xl border border-gray-100 bg-white p-5 hover:border-orange-200"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-semibold text-gray-800">Pedido #{p.id}</p>
                  <p className="text-sm text-gray-500">{formatDate(p.created_at)}</p>
                </div>
                <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-medium text-orange-700">
                  {p.estado_codigo.replace(/_/g, ' ')}
                </span>
              </div>
              <p className="mt-2 text-lg font-bold text-gray-800">${p.total}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
