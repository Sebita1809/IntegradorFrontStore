import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { addressesApi } from '../api/addresses.api'
import { queryKeys } from '../api/queryKeys'
import type { Direccion } from '../types/direccion'

export function AddressesPage() {
  const queryClient = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [editandoId, setEditandoId] = useState<number | null>(null)
  const [eliminandoId, setEliminandoId] = useState<number | null>(null)

  const addressesQuery = useQuery({
    queryKey: queryKeys.addresses.list(),
    queryFn: () => addressesApi.listar(),
  })

  const direcciones = addressesQuery.data ?? []

  // ─── Form state ─────────────────────────────────────────────
  const [alias, setAlias] = useState('')
  const [linea1, setLinea1] = useState('')
  const [linea2, setLinea2] = useState('')
  const [ciudad, setCiudad] = useState('')
  const [provincia, setProvincia] = useState('')
  const [codigoPostal, setCodigoPostal] = useState('')

  function resetForm() {
    setAlias(''); setLinea1(''); setLinea2(''); setCiudad(''); setProvincia(''); setCodigoPostal('')
    setEditandoId(null); setShowForm(false)
  }

  function abrirEditar(d: Direccion) {
    setEditandoId(d.id)
    setAlias(d.alias || '')
    setLinea1(d.linea1)
    setLinea2(d.linea2 || '')
    setCiudad(d.ciudad)
    setProvincia(d.provincia)
    setCodigoPostal(d.codigo_postal || '')
    setShowForm(true)
  }

  function abrirNueva() {
    resetForm()
    setShowForm(true)
  }

  // ─── Mutations ──────────────────────────────────────────────
  const crearMutation = useMutation({
    mutationFn: () => addressesApi.crear({
      alias: alias || null,
      linea1,
      linea2: linea2 || null,
      ciudad,
      provincia,
      codigo_postal: codigoPostal,
      latitud: 0,
      longitud: 0,
    }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: queryKeys.addresses.list() }); resetForm() },
  })

  const editarMutation = useMutation({
    mutationFn: (id: number) => addressesApi.actualizar(id, {
      alias: alias || null,
      linea1,
      linea2: linea2 || null,
      ciudad,
      provincia,
      codigo_postal: codigoPostal,
    }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: queryKeys.addresses.list() }); resetForm() },
  })

  const eliminarMutation = useMutation({
    mutationFn: (id: number) => addressesApi.eliminar(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: queryKeys.addresses.list() }); setEliminandoId(null) },
    onError: () => setEliminandoId(null),
  })

  const principalMutation = useMutation({
    mutationFn: (id: number) => addressesApi.marcarPrincipal(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.addresses.list() }),
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (editandoId) editarMutation.mutate(editandoId)
    else crearMutation.mutate()
  }

  return (
    <div className="space-y-4">
      {/* ─── Header ──────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-800">Mis direcciones</h1>
        <button onClick={abrirNueva}
          className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600">
          Agregar dirección
        </button>
      </div>

      {addressesQuery.isLoading ? (
        <p className="text-gray-500">Cargando direcciones...</p>
      ) : addressesQuery.isError ? (
        <p className="text-red-500">No se pudieron cargar las direcciones.</p>
      ) : direcciones.length === 0 && !showForm ? (
        <p className="text-gray-500">No tenés direcciones guardadas.</p>
      ) : (
        /* ─── Lista ─────────────────────────────────────────── */
        <div className="space-y-3">
          {direcciones.map((d) => (
            <article key={d.id} className="rounded-2xl border border-gray-100 bg-white p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h2 className="font-semibold text-gray-800">{d.alias}</h2>
                    {d.es_principal && (
                      <span className="rounded-full bg-orange-500 px-2 py-0.5 text-xs font-medium text-white">
                        Principal
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-gray-500">
                    {d.linea1}{d.linea2 ? `, ${d.linea2}` : ''}
                  </p>
                  <p className="text-sm text-gray-500">
                    {d.ciudad}, {d.provincia} - CP {d.codigo_postal}
                  </p>
                </div>

                {/* ─── Botones de acción ─────────────────────── */}
                <div className="flex items-center gap-1">
                  {!d.es_principal && (
                    <button onClick={() => principalMutation.mutate(d.id)} title="Marcar como principal"
                      className="rounded-lg p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50">
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </button>
                  )}
                  <button onClick={() => abrirEditar(d)} title="Editar"
                    className="rounded-lg p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50">
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                  </button>

                  {eliminandoId === d.id ? (
                    <div className="flex items-center gap-1">
                      <button onClick={() => eliminarMutation.mutate(d.id)}
                        className="rounded bg-red-500 px-2 py-1 text-xs text-white hover:bg-red-600 disabled:opacity-50"
                        disabled={eliminarMutation.isPending}>
                        Confirmar
                      </button>
                      <button onClick={() => setEliminandoId(null)}
                        className="rounded border border-gray-300 px-2 py-1 text-xs text-gray-600 hover:bg-gray-50">
                        No
                      </button>
                    </div>
                  ) : (
                    <button onClick={() => setEliminandoId(d.id)} title="Eliminar"
                      className="rounded-lg p-2 text-gray-400 hover:text-red-600 hover:bg-red-50">
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* ─── Formulario (crear/editar) ───────────────────────── */}
      {showForm && (
        <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-gray-100 bg-white p-6">
          <h2 className="text-sm font-semibold text-gray-700">
            {editandoId ? 'Editar dirección' : 'Nueva dirección'}
          </h2>

          <div>
            <label className="text-sm font-medium text-gray-700">Alias</label>
            <input value={alias} onChange={(e) => setAlias(e.target.value)} placeholder="Ej: Casa, Trabajo"
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-orange-400" />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-gray-700">Dirección *</label>
              <input value={linea1} onChange={(e) => setLinea1(e.target.value)} required placeholder="Av. Siempre Viva 123"
                className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-orange-400" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Complemento</label>
              <input value={linea2} onChange={(e) => setLinea2(e.target.value)} placeholder="Depto, piso"
                className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-orange-400" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Ciudad *</label>
              <input value={ciudad} onChange={(e) => setCiudad(e.target.value)} required placeholder="Mendoza"
                className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-orange-400" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Provincia *</label>
              <input value={provincia} onChange={(e) => setProvincia(e.target.value)} required placeholder="Mendoza"
                className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-orange-400" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">CP *</label>
              <input value={codigoPostal} onChange={(e) => setCodigoPostal(e.target.value)} required placeholder="5507"
                className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-orange-400" />
            </div>
          </div>

          <div className="flex gap-3">
            <button type="submit" disabled={crearMutation.isPending || editarMutation.isPending}
              className="flex-1 rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600 disabled:opacity-50">
              {crearMutation.isPending || editarMutation.isPending ? 'Guardando...' : editandoId ? 'Actualizar' : 'Guardar dirección'}
            </button>
            <button type="button" onClick={resetForm}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50">
              Cancelar
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
