**Link del video:** 

```bash
cd integradorFrontStore
pnpm install
pnpm dev        # arranca en http://localhost:5173
```

## Variables de entorno

Copiá `.env.example` como `.env`:

| `VITE_API_BASE_URL` | URL del backend. 

1. Levantá el backend (puerto 8000) y este front (`pnpm dev`).
2. Entrá a http://localhost:5173.
3. Logueate con un usuario, por ejemplo el admin del seed
   (`admin@foodstore.com` / `admin123`), o registrá un cliente nuevo.
4. Agregá productos al carrito y confirmá el pedido.
   - Pago en **efectivo / transferencia**: el pedido se crea directo.
   - Pago con **MercadoPago**: te redirige a MercadoPago y al volver el
     pedido queda CONFIRMADO o CANCELADO según el resultado. (Para esto el
     backend necesita ngrok apuntando al puerto 8000.)
