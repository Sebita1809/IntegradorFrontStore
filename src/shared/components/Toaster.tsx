import { useUiStore } from '../store/uiStore'

// Muestra los toasts del uiStore en una esquina. Clic para cerrarlos a mano.
export function Toaster() {
  const toasts = useUiStore((s) => s.toasts)
  const removeToast = useUiStore((s) => s.removeToast)

  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((t) => (
        <button
          key={t.id}
          type="button"
          onClick={() => removeToast(t.id)}
          className={`rounded-lg px-4 py-3 text-left text-sm font-medium text-white shadow-lg ${
            t.tipo === 'success'
              ? 'bg-green-500'
              : t.tipo === 'error'
                ? 'bg-red-500'
                : 'bg-gray-800'
          }`}
        >
          {t.mensaje}
        </button>
      ))}
    </div>
  )
}
