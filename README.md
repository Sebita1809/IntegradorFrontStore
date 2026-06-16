# 🍔 Food Store — Front Tienda (Store)

Frontend de la tienda del cliente del TPI de Programación 4. Desde acá el
cliente navega el catálogo, arma el carrito, hace el pedido, paga con
MercadoPago y sigue el estado del pedido en tiempo real (WebSocket).

**Link del video:** https://youtu.be/BKPTDvoGfu0

## Stack

- **React + TypeScript** con **Vite**
- **Tailwind CSS** (estilos)
- **TanStack Query** (datos del servidor: productos, pedidos)
- **Zustand** (estado del cliente: carrito, sesión, WebSocket, UI)
- **Axios** (cliente HTTP con interceptor de refresh de token)

## Requisitos previos

- **Node 18+**
- El **backend corriendo en `http://localhost:8000`** (ver el README del backend).

## Inicialización del proyecto

```bash
pnpm install
pnpm dev        # arranca en http://localhost:5173
```

En desarrollo, el front usa el **proxy de Vite**: todo lo que pega a `/api/v1`
lo reenvía al backend en `localhost:8000` (configurado en `vite.config.ts`).
Por eso no hace falta configurar nada para que hable con la API en local.

## Variables de entorno

Copiá `.env.example` como `.env`:

| `VITE_API_BASE_URL` | URL del backend. **Solo se usa en el build de producción.** En desarrollo se ignora porque se usa el proxy de Vite. |

## Cómo usarlo

1. Levantá el backend (puerto 8000) y este front (`npm run dev`).
2. Entrá a http://localhost:5173.
3. Logueate con un usuario, por ejemplo el admin del seed
   (`admin@foodstore.com` / `admin123`), o registrá un cliente nuevo.
4. Agregá productos al carrito y confirmá el pedido.
   - Pago en **efectivo / transferencia**: el pedido se crea directo.
   - Pago con **MercadoPago**: te redirige a MercadoPago y al volver el
     pedido queda CONFIRMADO o CANCELADO según el resultado. (Para esto el
     backend necesita ngrok apuntando al puerto 8000.)
