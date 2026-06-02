import { useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { queryKeys } from '../api/queryKeys'
import { productsApi } from '../api/products.api'
import { categoriesApi } from '../api/categories.api'
import { useCarrito } from '../hooks/useCarrito'

export function HomePage() {
  const LIMITE = 20

  const [nombre, setNombre] = useState('')
  const [categoriaId, setCategoriaId] = useState<number | null>(null)
  const [offset, setOffset] = useState(0)

  useEffect(() => {
    setOffset(0)
  }, [nombre, categoriaId])

  const paramsProductos = useMemo(
    () => ({
      offset,
      limit: LIMITE,
      ...(nombre.trim() ? { nombre: nombre.trim() } : {}),
      ...(categoriaId != null ? { categoria_id: categoriaId } : {}),
    }),
    [nombre, offset, categoriaId]
  )

  const productosQuery = useQuery({
    queryKey: queryKeys.products.list(paramsProductos),
    queryFn: () => productsApi.listar(paramsProductos),
  })

  const categoriasQuery = useQuery({
    queryKey: queryKeys.categories.list({ limit: 50 }),
    queryFn: () => categoriesApi.listar({ limit: 50 }),
  })

  const productosData = productosQuery.data
  const productos = productosData?.data ?? []
  const total = productosData?.total ?? 0

  const categorias = categoriasQuery.data?.data ?? []

  const hayMas = offset + LIMITE < total
  const paginaActual = Math.floor(offset / LIMITE) + 1
  const totalPaginas = Math.ceil(total / LIMITE)

  const { addItem } = useCarrito()

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 px-8 py-10">
        <h1 className="text-3xl font-extrabold text-white">
          ¡Comida deliciosa al mejor precio!
        </h1>
        <p className="mt-2 text-orange-100">
          Explorá nuestro catálogo y pedí lo que más te guste.
        </p>
      </div>

      <div className="relative">
        <svg
          className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Buscar productos..."
          className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-10 pr-4 text-sm outline-none focus:border-orange-400"
        />
      </div>

      {categorias.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setCategoriaId(null)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              categoriaId === null
                ? 'bg-orange-500 text-white'
                : 'bg-white text-gray-600 hover:bg-orange-100'
            }`}
          >
            Todas
          </button>
          {categorias.slice(0, 8).map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setCategoriaId(cat.id)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                categoriaId === cat.id
                  ? 'bg-orange-500 text-white'
                  : 'bg-white text-gray-600 hover:bg-orange-100'
              }`}
            >
              {cat.nombre}
            </button>
          ))}
        </div>
      )}

      {productosQuery.isLoading ? (
        <p className="text-center text-gray-500 py-10">Cargando...</p>
      ) : productosQuery.isError ? (
        <p className="text-center text-red-500 py-10">Error al cargar productos</p>
      ) : productos.length === 0 ? (
        <p className="text-center text-gray-500 py-10">No hay productos para mostrar</p>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {productos.map((p) => (
              <article
                key={p.id}
                className="flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm hover:shadow-lg transition-shadow"
              >
                <Link to={`/productos/${p.id}`} className="block">
                  {p.imagenes_url && p.imagenes_url.length > 0 ? (
                    <img
                      src={p.imagenes_url[0]}
                      alt={p.nombre}
                      className="h-48 w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-48 w-full items-center justify-center bg-orange-100">
                      <span className="text-sm text-orange-600">Sin imagen</span>
                    </div>
                  )}
                </Link>

                <div className="flex flex-1 flex-col justify-between p-4">
                  <div>
                    <Link to={`/productos/${p.id}`}>
                      <h3 className="font-semibold text-gray-800">{p.nombre}</h3>
                    </Link>
                    {p.descripcion ? (
                      <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                        {p.descripcion}
                      </p>
                    ) : null}
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-lg font-bold text-orange-600">
                      ${p.precio_base.toFixed(2)}
                    </span>
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
                      className="rounded-lg bg-orange-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-orange-600 disabled:opacity-50"
                    >
                      {!p.disponible || p.stock_cantidad <= 0 ? 'Agotado' : 'Agregar'}
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {totalPaginas > 1 && (
            <div className="flex items-center justify-center gap-3 pt-4">
              <button
                type="button"
                onClick={() => setOffset((v) => Math.max(0, v - LIMITE))}
                disabled={offset === 0}
                className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm text-gray-600 hover:bg-orange-50 disabled:opacity-50"
              >
                ← Anterior
              </button>
              <span className="text-sm text-gray-500">
                {paginaActual} / {totalPaginas}
              </span>
              <button
                type="button"
                onClick={() => setOffset((v) => v + LIMITE)}
                disabled={!hayMas}
                className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm text-gray-600 hover:bg-orange-50 disabled:opacity-50"
              >
                Siguiente →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
