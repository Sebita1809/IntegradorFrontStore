import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useCarrito } from '../hooks/useCarrito'
import { useAuth } from '../hooks/useAuth'
import { addressesApi } from '../api/addresses.api'
import { ordersApi } from '../api/orders.api'
import { queryKeys } from '../api/queryKeys'

const FORMAS_PAGO = [
  { codigo: 'EFECTIVO', nombre: 'Efectivo' },
  { codigo: 'MERCADOPAGO', nombre: 'MercadoPago' },
  { codigo: 'TRANSFERENCIA', nombre: 'Transferencia bancaria' },
] as const

export function CheckoutPage() {
  const { items, limpiar, total } = useCarrito()
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (items.length === 0) {
      navigate('/carrito', { replace: true })
    }
  }, [items, navigate])

  const [direccionId, setDireccionId] = useState<number | null>(null)
  const [formaPagoCodigo, setFormaPagoCodigo] = useState('EFECTIVO')
  const [notas, setNotas] = useState('')

  const direccionesQuery = useQuery({
    queryKey: queryKeys.addresses.list(),
    queryFn: () => addressesApi.listar(),
    enabled: user !== null,
  })

  useEffect(() => {
    if (direccionesQuery.data?.length && direccionId === null) {
      setDireccionId(direccionesQuery.data[0].id)
    }
  }, [direccionesQuery.data, direccionId])

  const crearMutation = useMutation({
    mutationFn: () =>
      ordersApi.crear({
        forma_pago_codigo: formaPagoCodigo,
        descuento: 0,
        costo_envio: 50,
        notas,
        detalle_pedidos: items.map((i) => ({
          producto_id: i.producto_id,
          cantidad: i.cantidad,
          personalizacion: i.personalizacion ?? [],
        })),
      }),
    onSuccess: (pedido) => {
      limpiar()
      navigate(`/pedidos/${pedido.id}`)
    },
  })

  if (items.length === 0) return null

  const puedeConfirmar =
    direccionId !== null && formaPagoCodigo !== '' && !crearMutation.isPending

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-xl font-bold text-gray-800">Confirmar pedido</h1>

      <section className="rounded-2xl bg-white p-6">
        <h2 className="mb-3 text-sm font-semibold text-gray-700">Productos</h2>
        <div className="space-y-2">
          {items.map((item) => (
            <div
              key={item.producto_id}
              className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-2"
            >
              <span className="text-sm text-gray-800">
                {item.nombre} <span className="text-gray-400">x{item.cantidad}</span>
              </span>
              <span className="text-sm font-medium text-gray-800">
                ${(item.precio_base * item.cantidad).toFixed(2)}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-4 space-y-1 border-t border-gray-100 pt-3 text-sm">
          <div className="flex justify-between text-gray-500">
            <span>Subtotal</span>
            <span>${total.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-gray-500">
            <span>Envío</span>
            <span>$50.00</span>
          </div>
          <div className="flex justify-between font-bold text-gray-800">
            <span>Total</span>
            <span className="text-orange-600">${(total + 50).toFixed(2)}</span>
          </div>
        </div>
      </section>

      <section className="rounded-2xl bg-white p-6">
        <h2 className="mb-3 text-sm font-semibold text-gray-700">Dirección de entrega</h2>
        {direccionesQuery.isLoading ? (
          <p className="text-sm text-gray-500">Cargando direcciones...</p>
        ) : direccionesQuery.isError ? (
          <p className="text-sm text-red-500">Error al cargar direcciones.</p>
        ) : !direccionesQuery.data?.length ? (
          <p className="text-sm text-gray-500">No tenés direcciones registradas.</p>
        ) : (
          <div className="space-y-2">
            {direccionesQuery.data.map((d) => (
              <label
                key={d.id}
                className={`flex cursor-pointer items-start gap-3 rounded-xl border-2 p-4 ${
                  direccionId === d.id
                    ? 'border-orange-500 bg-orange-50'
                    : 'border-gray-200'
                }`}
              >
                <input
                  type="radio"
                  name="direccion"
                  checked={direccionId === d.id}
                  onChange={() => setDireccionId(d.id)}
                  className="mt-0.5 accent-orange-500"
                />
                <div>
                  <p className="font-medium text-gray-800">{d.alias || d.linea1}</p>
                  <p className="text-sm text-gray-500">
                    {d.linea1}{d.linea2 ? `, ${d.linea2}` : ''}
                  </p>
                  <p className="text-sm text-gray-500">
                    {d.ciudad}, {d.provincia} - CP {d.codigo_postal}
                  </p>
                </div>
              </label>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-2xl bg-white p-6">
        <h2 className="mb-3 text-sm font-semibold text-gray-700">Forma de pago</h2>
        <div className="space-y-2">
          {FORMAS_PAGO.map((fp) => (
            <label
              key={fp.codigo}
              className={`flex cursor-pointer items-center gap-3 rounded-xl border-2 p-4 ${
                formaPagoCodigo === fp.codigo
                  ? 'border-orange-500 bg-orange-50'
                  : 'border-gray-200'
              }`}
            >
              <input
                type="radio"
                name="formaPago"
                checked={formaPagoCodigo === fp.codigo}
                onChange={() => setFormaPagoCodigo(fp.codigo)}
                className="accent-orange-500"
              />
              <span className="font-medium text-gray-800">{fp.nombre}</span>
            </label>
          ))}
        </div>
      </section>

      <section className="rounded-2xl bg-white p-6">
        <h2 className="mb-3 text-sm font-semibold text-gray-700">Notas (opcional)</h2>
        <textarea
          value={notas}
          onChange={(e) => setNotas(e.target.value)}
          rows={3}
          className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-orange-400"
          placeholder="Alguna nota para el pedido..."
        />
      </section>

      {crearMutation.isError && (
        <p className="text-sm text-red-600">No se pudo confirmar el pedido. Intentá de nuevo.</p>
      )}
      <button
        type="button"
        onClick={() => crearMutation.mutate()}
        disabled={!puedeConfirmar}
        className="w-full rounded-xl bg-orange-500 px-6 py-3 text-base font-semibold text-white hover:bg-orange-600 disabled:opacity-50"
      >
        {crearMutation.isPending ? 'Confirmando...' : 'Confirmar pedido'}
      </button>
    </div>
  )
}
