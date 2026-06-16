import { useCallback, useEffect, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { ordersQueryKeys } from '../queryKeys'
import { useWsStore } from '../../../shared/store/wsStore'

// El navegador adjunta sola la cookie HttpOnly en el handshake, asi que el
// backend autentica el socket sin que mandemos ningun token.
// Vite hace proxy de /api/v1/pedidos/cocina/ws al backend (ver vite.config.ts).
const protocolo = location.protocol === 'https:' ? 'wss' : 'ws'
const WS_URL = `${protocolo}://${location.host}/api/v1/pedidos/cocina/ws`

const MAX_REINTENTOS = 10

/**
 * Conecta con el backend por WebSocket para ver el estado de los pedidos
 * en tiempo real. Cada vez que llega un aviso de cambio, refresca los
 * pedidos cacheados (la lista y el detalle se actualizan solos) y guarda el
 * estado de la conexion en el wsStore.
 *
 * @param enabled normalmente `user !== null`: no conectamos sin sesion.
 */
export function useOrdersRealtime(enabled: boolean) {
  const queryClient = useQueryClient()
  const wsRef = useRef<WebSocket | null>(null)
  const conectado = useWsStore((s) => s.conectado)
  const setConectado = useWsStore((s) => s.setConectado)
  const setUltimoEvento = useWsStore((s) => s.setUltimoEvento)

  useEffect(() => {
    if (!enabled) return

    // Se pone en true al desmontar, para no reconectar al pedo.
    let cerrado = false
    let intentos = 0
    let reconnectTimer: ReturnType<typeof setTimeout>

    function conectar() {
      const ws = new WebSocket(WS_URL)
      wsRef.current = ws

      ws.onopen = () => {
        intentos = 0
        setConectado(true)
        // Al (re)conectar refrescamos por si nos perdimos algun cambio.
        queryClient.invalidateQueries({ queryKey: ordersQueryKeys.all })
      }

      // Llego un evento de pedido -> lo guardamos y refrescamos los pedidos.
      ws.onmessage = (e) => {
        try {
          setUltimoEvento(JSON.parse(e.data))
        } catch {
          // Si no es JSON valido lo ignoramos.
        }
        queryClient.invalidateQueries({ queryKey: ordersQueryKeys.all })
      }

      ws.onclose = () => {
        setConectado(false)
        if (cerrado || intentos >= MAX_REINTENTOS) return
        // Reconexion con backoff exponencial: 1s, 2s, 4s... con tope de 30s.
        const espera = Math.min(1000 * 2 ** intentos, 30000)
        intentos++
        reconnectTimer = setTimeout(conectar, espera)
      }
    }

    conectar()

    return () => {
      cerrado = true
      clearTimeout(reconnectTimer)
      setConectado(false)

      const ws = wsRef.current
      if (!ws) return
      // Si el socket todavia se esta conectando, cerrarlo ahora tira el warning
      // "closed before the connection is established". Por eso esperamos a que
      // abra para recien cerrarlo; si ya esta abierto, lo cerramos directo.
      if (ws.readyState === WebSocket.CONNECTING) {
        ws.onopen = () => ws.close()
      } else {
        ws.close()
      }
    }
  }, [enabled, queryClient, setConectado, setUltimoEvento])

  // Suscribe el socket a un pedido puntual para recibir sus actualizaciones.
  const subscribeToOrder = useCallback((orderId: number) => {
    const ws = wsRef.current
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ action: 'subscribe-order', order_id: orderId }))
    }
  }, [])

  return { conectado, subscribeToOrder }
}
