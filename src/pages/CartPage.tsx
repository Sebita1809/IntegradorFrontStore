import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useCarrito } from '../hooks/useCarrito'
import { productsApi } from '../api/products.api'

// ─── CartItemPersonalizacion ────────────────────────────────────────────
// Muestra los ingredientes de cada producto en el carrito y permite
// tildar/destildar los removibles. Si solo queda 1 ingrediente y no
// hay fijos, no deja destildarlo.
// ────────────────────────────────────────────────────────────────────────

function CartItemPersonalizacion({ producto_id }: { producto_id: number }) {
  const { togglePersonalizacion, items } = useCarrito()
  const item = items.find((x) => x.producto_id === producto_id)
  const [mensaje, setMensaje] = useState('')

  const { data: producto } = useQuery({
    queryKey: ['producto', producto_id],
    queryFn: () => productsApi.obtenerPorId(producto_id),
    enabled: true,
  })

  if (!producto || producto.ingredientes.length === 0) return null

  const removibles = producto.ingredientes.filter((i) => i.es_removible)
  const fijos = producto.ingredientes.filter((i) => !i.es_removible)
  const removidos = item?.personalizacion ?? []
  const activosRemovibles = removibles.filter((i) => !removidos.includes(i.id))

  function handleToggle(ingId: number) {
    const estaIncluido = !removidos.includes(ingId)

    if (estaIncluido && activosRemovibles.length <= 1 && fijos.length === 0) {
      setMensaje('El producto debe tener al menos 1 ingrediente')
      setTimeout(() => setMensaje(''), 2500)
      return
    }

    setMensaje('')
    togglePersonalizacion(producto_id, ingId)
  }

  return (
    <div className="mt-3 border-t border-gray-100 pt-3">
      <div className="mb-2 flex items-center gap-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-gray-700">Ingredientes</span>
        {fijos.length > 0 && (
          <span className="text-[10px] text-gray-400">({fijos.length} fijo{fijos.length !== 1 ? 's' : ''})</span>
        )}
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-1.5">
        {producto.ingredientes.map((ing) => {
          const incluido = !removidos.includes(ing.id)
          return (
            <label
              key={ing.id}
              className={`flex cursor-pointer items-center gap-1.5 text-sm select-none ${
                ing.es_removible ? 'text-gray-700' : 'text-gray-400'
              }`}
            >
              {ing.es_removible ? (
                <input
                  type="checkbox"
                  checked={incluido}
                  onChange={() => handleToggle(ing.id)}
                  className="h-4 w-4 rounded accent-orange-500"
                />
              ) : (
                <svg className="h-4 w-4 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" />
                </svg>
              )}
              <span>{ing.nombre}</span>
              {ing.es_alergeno && (
                <span className="text-[10px] font-medium text-red-500">(Alérgeno)</span>
              )}
              {!ing.es_removible && (
                <span className="text-[10px] text-gray-400">fijo</span>
              )}
            </label>
          )
        })}
      </div>

      {mensaje && (
        <p className="mt-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600">
          {mensaje}
        </p>
      )}

      {activosRemovibles.length === 0 && fijos.length > 0 && (
        <p className="mt-2 text-xs text-gray-400">Todos los ingredientes removibles fueron quitados</p>
      )}
    </div>
  )
}

// ─── CartPage ───────────────────────────────────────────────────────────
// Vista del carrito con items, controles de cantidad (+/−), botón de
// eliminar (basurito SVG) y personalización de ingredientes.
// ────────────────────────────────────────────────────────────────────────

export function CartPage() {
  const { items, removeItem, updateCantidad, limpiar, total } = useCarrito()

  if (items.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="text-gray-500">El carrito está vacío</p>
        <Link to="/" className="mt-4 inline-block text-sm font-medium text-orange-600 hover:text-orange-800">
          Volver a la tienda
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* ─── Header ──────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-800">Carrito</h1>
        <button onClick={limpiar}
          className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-600 hover:bg-orange-50">
          Vaciar carrito
        </button>
      </div>

      {/* ─── Items ───────────────────────────────────────────── */}
      <div className="space-y-2">
        {items.map((item) => (
          <article key={item.producto_id} className="rounded-2xl border border-gray-100 bg-white p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="font-semibold text-gray-800">{item.nombre}</h3>
                <p className="text-sm text-gray-500">${item.precio_base.toFixed(2)} c/u</p>
                <p className="text-sm font-medium text-orange-600">
                  Subtotal: ${(item.precio_base * item.cantidad).toFixed(2)}
                </p>
              </div>

              {/* ─── Controles de cantidad ─────────────────────── */}
              <div className="flex items-center gap-2">
                <button onClick={() => updateCantidad(item.producto_id, item.cantidad - 1)}
                  disabled={item.cantidad <= 1}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-orange-50 disabled:opacity-50">
                  −
                </button>
                <span className="w-8 text-center text-sm font-medium text-gray-800">
                  {item.cantidad}
                </span>
                <button onClick={() => updateCantidad(item.producto_id, item.cantidad + 1)}
                  disabled={item.cantidad >= item.stock_cantidad}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-orange-50 disabled:opacity-50">
                  +
                </button>
              </div>

              {/* ─── Botón eliminar (basurito SVG) ──────────────── */}
              <button onClick={() => removeItem(item.producto_id)} title="Quitar"
                className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </button>
            </div>

            {/* ─── Personalización de ingredientes ──────────────── */}
            <CartItemPersonalizacion producto_id={item.producto_id} />
          </article>
        ))}
      </div>

      {/* ─── Total + Finalizar ───────────────────────────────── */}
      <div className="flex items-center justify-between rounded-2xl bg-white p-5">
        <span className="text-lg font-bold text-gray-800">Total: ${total.toFixed(2)}</span>
        <Link to="/checkout"
          className="rounded-xl bg-orange-500 px-6 py-3 text-sm font-semibold text-white hover:bg-orange-600">
          Finalizar pedido
        </Link>
      </div>
    </div>
  )
}
