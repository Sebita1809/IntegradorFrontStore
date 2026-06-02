import { useState, useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useQuery, useQueries, useQueryClient } from '@tanstack/react-query'
import { ordersApi } from '../api/orders.api'
import { productsApi } from '../api/products.api'
import { queryKeys } from '../api/queryKeys'

function formatDate(iso: string) {
  return new Intl.DateTimeFormat('es-AR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(iso))
}

export function OrderDetailPage() {
  const params = useParams()
  const pedidoId = Number(params.id)
  const queryClient = useQueryClient()
  const [confirmando, setConfirmando] = useState(false)

  const pedidoQuery = useQuery({
    queryKey: queryKeys.orders.detail(pedidoId),
    queryFn: () => ordersApi.obtenerPorId(pedidoId),
    enabled: Number.isFinite(pedidoId),
  })

  const pedido = pedidoQuery.data

  // ─── Resolver nombres de ingredientes removidos ─────────────
  const productIdsConPersonalizacion = useMemo(() => {
    if (!pedido) return []
    return [...new Set(
      pedido.detalle_pedidos
        .filter((d) => d.personalizacion.length > 0)
        .map((d) => d.producto_id)
    )]
  }, [pedido])

  const productQueries = useQueries({
    queries: productIdsConPersonalizacion.map((id) => ({
      queryKey: ['producto', id],
      queryFn: () => productsApi.obtenerPorId(id),
      enabled: productIdsConPersonalizacion.length > 0,
    })),
  })

  const productoMap = useMemo(() => {
    const map = new Map<number, { ingredientes: { id: number; nombre: string }[] }>()
    productQueries.forEach((q, i) => {
      if (q.data) map.set(productIdsConPersonalizacion[i], q.data)
    })
    return map
  }, [productQueries, productIdsConPersonalizacion])

  const puedeCancelar = pedido?.estado_codigo === 'PENDIENTE' || pedido?.estado_codigo === 'CONFIRMADO'

  async function handleCancelar() {
    try {
      await ordersApi.cancelar(pedidoId, 'Cancelado por el usuario')
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.detail(pedidoId) })
    } catch {
      // Si falla, el interceptor de axios se encarga
    } finally {
      setConfirmando(false)
    }
  }

  return (
    <div className="space-y-4">
      <Link
        to="/pedidos"
        className="inline-flex items-center gap-1 text-sm text-orange-600 hover:text-orange-800"
      >
        ← Volver a pedidos
      </Link>

      {pedidoQuery.isLoading ? (
        <p className="text-gray-500">Cargando pedido...</p>
      ) : pedidoQuery.isError ? (
        <p className="text-red-500">No se pudo cargar el pedido.</p>
      ) : !pedido ? (
        <p className="text-gray-500">Pedido no encontrado.</p>
      ) : (
        <>
          {/* ─── Header ──────────────────────────────────────── */}
          <div className="rounded-2xl bg-white p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-xl font-bold text-gray-800">Pedido #{pedido.id}</h1>
                <p className="text-sm text-gray-500">{formatDate(pedido.created_at)}</p>
              </div>
              <span className="rounded-full bg-orange-100 px-3 py-1 text-sm font-medium text-orange-700">
                {pedido.estado_codigo.replace(/_/g, ' ')}
              </span>
            </div>
            <p className="mt-3 text-2xl font-bold text-orange-600">${pedido.total}</p>
          </div>

          {/* ─── Items ────────────────────────────────────────── */}
          <div className="rounded-2xl bg-white p-6">
            <h2 className="mb-3 text-sm font-semibold text-gray-700">Items</h2>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-600">
                  <th className="pb-2 pr-4 font-medium">Producto</th>
                  <th className="pb-2 pr-4 font-medium">Cant.</th>
                  <th className="pb-2 pr-4 font-medium">Precio</th>
                  <th className="pb-2 text-right font-medium">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {pedido.detalle_pedidos.map((item, idx) => {
                  const producto = productoMap.get(item.producto_id)
                  const ingredientesRemovidos = producto
                    ? producto.ingredientes
                        .filter((ing) => item.personalizacion.includes(ing.id))
                        .map((ing) => ing.nombre)
                    : []
                  return (
                    <tr key={idx} className="border-t border-gray-100 text-gray-700">
                      <td className="py-2 pr-4">
                        <p>{item.nombre_snapshot}</p>
                        {ingredientesRemovidos.length > 0 && (
                          <p className="text-[11px] text-gray-400 mt-0.5">
                            Sin: {ingredientesRemovidos.join(', ')}
                          </p>
                        )}
                      </td>
                      <td className="py-2 pr-4">{item.cantidad}</td>
                      <td className="py-2 pr-4">${item.precio_snapshot}</td>
                      <td className="py-2 text-right font-medium">${item.subtotal_snap}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* ─── Notas ────────────────────────────────────────── */}
          {pedido.notas && (
            <div className="rounded-2xl bg-white p-6">
              <h2 className="mb-2 text-sm font-semibold text-gray-700">Notas</h2>
              <p className="whitespace-pre-wrap text-sm text-gray-600">{pedido.notas}</p>
            </div>
          )}

          {/* ─── Historial ────────────────────────────────────── */}
          <div className="rounded-2xl bg-white p-6">
            <h2 className="mb-3 text-sm font-semibold text-gray-700">Historial de estados</h2>
            {pedido.historial_estado.length === 0 ? (
              <p className="text-sm text-gray-500">Sin historial disponible.</p>
            ) : (
              <div className="space-y-3">
                {pedido.historial_estado.map((h) => (
                  <div key={h.id} className="flex items-center gap-2 text-sm text-gray-700">
                    <span className="font-medium">{h.estado_desde ?? '-'}</span>
                    <span className="text-gray-300">→</span>
                    <span className="font-medium">{h.estado_hasta}</span>
                    <span className="ml-auto text-gray-400">{formatDate(h.created_at)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ─── Botón de cancelar ───────────────────────────── */}
          {puedeCancelar ? (
            confirmando ? (
              <div className="flex items-center gap-3 rounded-2xl bg-white p-4">
                <p className="text-sm text-gray-600">¿Estás seguro de cancelar este pedido?</p>
                <button onClick={handleCancelar}
                  className="rounded-lg bg-red-500 px-4 py-2 text-sm text-white hover:bg-red-600">
                  Sí, cancelar
                </button>
                <button onClick={() => setConfirmando(false)}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">
                  No, volver
                </button>
              </div>
            ) : (
              <button onClick={() => setConfirmando(true)}
                className="rounded-lg border border-red-300 px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                Cancelar pedido
              </button>
            )
          ) : pedido && (
            <button disabled
              className="cursor-not-allowed rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-400">
              No se puede cancelar
            </button>
          )}
        </>
      )}
    </div>
  )
}
