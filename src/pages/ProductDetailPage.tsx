import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { productsApi } from '../api/products.api'
import { queryKeys } from '../api/queryKeys'
import { useCarrito } from '../hooks/useCarrito'

export function ProductDetailPage() {
  const params = useParams()
  const productoId = Number(params.id)
  const { addItem } = useCarrito()
  const [selectedImage, setSelectedImage] = useState(0)

  const productoQuery = useQuery({
    queryKey: queryKeys.products.detail(productoId),
    queryFn: () => productsApi.obtenerPorId(productoId),
    enabled: Number.isFinite(productoId),
  })

  const p = productoQuery.data

  return (
    <div className="space-y-4">
      <Link
        to="/"
        className="inline-flex items-center gap-1 text-sm text-orange-600 hover:text-orange-800"
      >
        ← Volver
      </Link>

      {productoQuery.isLoading ? (
        <p className="text-gray-500">Cargando producto...</p>
      ) : productoQuery.isError ? (
        <p className="text-red-500">No se pudo cargar el producto.</p>
      ) : !p ? (
        <p className="text-gray-500">Producto no encontrado.</p>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-3">
            <div className="overflow-hidden rounded-2xl bg-white">
              {p.imagenes_url && p.imagenes_url.length > 0 ? (
                <img
                  src={p.imagenes_url[selectedImage]}
                  alt={p.nombre}
                  className="h-80 w-full object-cover"
                />
              ) : (
                <div className="flex h-80 w-full items-center justify-center bg-orange-100">
                  <span className="text-orange-600">Sin imagen</span>
                </div>
              )}
            </div>
            {p.imagenes_url && p.imagenes_url.length > 1 && (
              <div className="flex gap-2">
                {p.imagenes_url.map((url, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`shrink-0 overflow-hidden rounded-lg border-2 ${
                      i === selectedImage ? 'border-orange-500' : 'border-transparent opacity-60'
                    }`}
                  >
                    <img src={url} alt="" className="h-16 w-16 object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">{p.nombre}</h1>
              {p.descripcion && (
                <p className="mt-2 text-gray-500">{p.descripcion}</p>
              )}
            </div>

            <p className="text-3xl font-bold text-orange-600">
              ${p.precio_base.toFixed(2)}
            </p>

            <div className="flex items-center gap-3">
              <span
                className={`rounded-full px-3 py-1 text-sm font-medium ${
                  p.disponible && p.stock_cantidad > 0
                    ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-700'
                }`}
              >
                {p.disponible && p.stock_cantidad > 0 ? 'Disponible' : 'No disponible'}
              </span>
              <span className="text-sm text-gray-500">Stock: {p.stock_cantidad}</span>
            </div>

            {p.categorias.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-700">Categorías</h3>
                <div className="mt-1 flex flex-wrap gap-2">
                  {p.categorias.map((cat) => (
                    <span
                      key={cat.id}
                      className="rounded-full bg-orange-100 px-3 py-1 text-sm text-orange-700"
                    >
                      {cat.nombre}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {p.ingredientes.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-700">Ingredientes</h3>
                <ul className="mt-1 list-inside list-disc text-sm text-gray-600">
                  {p.ingredientes.map((ing) => (
                    <li key={ing.id}>
                      {ing.nombre}
                      {ing.cantidad != null && (
                        <span className="text-gray-400">
                          {' '}{ing.cantidad} {ing.unidad_medida?.simbolo ?? ''}
                        </span>
                      )}
                      {ing.es_alergeno && (
                        <span className="ml-1 text-xs font-medium text-red-500">(Alérgeno)</span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <button
              type="button"
              onClick={() =>
                addItem({
                  id: p.id,
                  nombre: p.nombre,
                  precio_base: p.precio_base,
                  stock_cantidad: p.stock_cantidad,
                })
              }
              disabled={!p.disponible || p.stock_cantidad <= 0}
              className="w-full rounded-xl bg-orange-500 px-6 py-3 text-base font-semibold text-white hover:bg-orange-600 disabled:opacity-50"
            >
              {!p.disponible || p.stock_cantidad <= 0
                ? 'Producto agotado'
                : 'Agregar al carrito'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
