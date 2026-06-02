# Food Store Front Store - Guia de Defensa

> **Food Store** es un e-commerce de comida desarrollado con React 19 + TypeScript + Vite.
> Este documento explica cada modulo, las decisiones tecnicas clave y como defender el proyecto.

---

## Indice

1. [Stack Tecnologico](#stack-tecnologico)
2. [Estructura del Proyecto](#estructura-del-proyecto)
3. [Modulo api/ - Capa de comunicacion con el backend](#modulo-api)
4. [Modulo types/ - Modelos de datos (TypeScript)](#modulo-types)
5. [Modulo hooks/ - Estado global y logica compartida](#modulo-hooks)
6. [Modulo app/ - Configuracion de la aplicacion](#modulo-app)
7. [Modulo components/ - Componentes reutilizables](#modulo-components)
8. [Modulo layouts/ - Layout principal](#modulo-layouts)
9. [Modulo pages/ - Pantallas de la aplicacion](#modulo-pages)
10. [Archivos raiz de configuracion](#archivos-raiz)
11. [Flujo completo de la aplicacion](#flujo-completo)
12. [Decisiones tecnicas clave](#decisiones-tecnicas)
13. [Posibles preguntas en la defensa](#posibles-preguntas)

---

## Stack Tecnologico

| Tecnologia | Version | Para que se usa? |
|---|---|---|
| **React** | ^19.2.6 | UI declarativa basada en componentes |
| **TypeScript** | ~6.0.2 | Tipado estatico, safety en desarrollo |
| **Vite** | ^8.0.12 | Bundler ultra-rapido con HMR |
| **React Router** | ^7.15.1 | Enrutamiento SPA (client-side) |
| **TanStack React Query** | ^5.100.11 | Fetching, cache y sincronizacion de datos del servidor |
| **Axios** | ^1.16.1 | Cliente HTTP con interceptores |
| **Tailwind CSS** | ^4.3.0 | CSS utility-first |
| **ESLint** | ^10.3.0 | Linter y formato de codigo |

---

## Estructura del Proyecto

```
food-store-front-store/
  public/                    # Archivos estaticos (favicon, icons)
  src/                       # Codigo fuente de la aplicacion
    api/                   # Clientes HTTP (Axios) + endpoints
    app/                   # Providers + Router
    components/            # Componentes reutilizables
    hooks/                 # Custom hooks + Contexts globales
    layouts/               # Layouts (sidebar, nav)
    pages/                 # Paginas del router
    types/                 # Tipos TypeScript (modelos)
  .env                       # Variables de entorno
  .env.example               # Template del .env
  index.html                 # Entry point HTML
  vite.config.ts             # Configuracion de Vite (proxy incluido)
  package.json               # Dependencias y scripts
  defense.md                 # Este archivo
```

---

## Modulo api/

**Proposito**: Capa de comunicacion con el backend REST (ruta base: /api/v1).
**Ubicacion**: src/api/

### http.ts - Nucleo de la comunicacion

- Crea una instancia de **Axios** con withCredentials: true.
- **Base URL dinamica**: En desarrollo usa el **proxy de Vite** (/api/v1). En produccion usa la URL real del backend.
- **Interceptor de request**: Toma el access_token de localStorage y lo adjunta como Authorization: Bearer <token>.
- **Interceptor de response**: Si recibe un 401, limpia access_token y user_id de localStorage (logout automatico).
- decodeJwtPayload(): Decodifica el payload de un JWT sin verificarlo (solo lectura del sub).

> **Para defender**: El JWT se decodifica del lado del cliente solo para leer datos no sensibles (user ID). La verificacion real la hace el backend.

### auth.api.ts - Autenticacion

| Funcion | Metodo HTTP | Ruta |
|---|---|---|
| login(email, password) | POST | /auth/login |
| me() | GET | /auth/me |
| logout() | POST | /auth/logout |
| registrar(payload) | POST | /auth/register |
| getUserIdFromToken() | - | Extrae sub del JWT |

### products.api.ts - Productos

- listar(params?) -> GET /productos/ - Listado paginado con filtros.
- obtenerPorId(id) -> GET /productos/{id} - Detalle de un producto.

### categories.api.ts - Categorias

- listar(params?) -> GET /categorias/ - Listado paginado.
- tree() -> GET /categorias/tree - Arbol jerarquico de categorias.

### orders.api.ts - Pedidos

- listarPorUsuario(userId) -> GET /pedidos/usuario/{userId}
- obtenerPorId(id) -> GET /pedidos/{id}
- crear(payload) -> POST /pedidos/
- cancelar(id, motivo?) -> PATCH /pedidos/{id} (estado_bool: false)

### addresses.api.ts - Direcciones

CRUD completo: listar(), crear(), actualizar(), eliminar(), marcarPrincipal().
- listar() filtra del lado del cliente (deleted_at === null) porque el backend hace soft delete.

### formas-pago.api.ts - Formas de pago

- listar() -> GET /forma-pago

### queryKeys.ts - Claves de cache para React Query

Usa el patron **factory** de TanStack Query.
Ejemplo: queryKeys.products.list({ offset: 0, limit: 20 }) genera [products, list, { offset, limit }].

> **Para defender**: Centraliza las claves y evita errores de tipeo. Al incluir los parametros en la clave, React Query cachea correctamente distintas variaciones de una misma consulta.

---
## Modulo types/

**Proposito**: Tipos TypeScript que modelan las entidades del dominio.
**Ubicacion**: src/types/

| Archivo | Tipo principal | Descripcion |
|---|---|---|
| producto.ts | Producto, ProductoPaginado | Producto con precio, stock, categorias, ingredientes |
| categoria.ts | Categoria, CategoriaTree | Categorias con soporte jerarquico (subcategorias) |
| ingrediente.ts | Ingrediente | Ingrediente con flag de alergeno y links a productos |
| direccion.ts | Direccion, DireccionCreate | Direccion con geolocalizacion y soft delete |
| pedido.ts | Pedido, PedidoCreate | Pedido con items, historial, calculo de total |
| detalle-pedido.ts | DetallePedido | Line item con snapshot de nombre/precio al momento de la compra |
| forma-pago.ts | FormaPago | Metodo de pago (codigo, descripcion, habilitado) |
| estado-pedido.ts | EstadoPedido | Estado posible de un pedido (orden, terminal) |
| historial-estado.ts | HistorialEstado | Transicion de estados con motivo |

> **Para defender**: Los snapshots en DetallePedido (nombre_snapshot, precio_snapshot) son una decision de disenio importante. Si el admin cambia el precio de un producto luego de que un usuario hizo un pedido, el pedido guarda los valores en el momento de la compra. Fundamental para integridad historica.

---

## Modulo hooks/

**Proposito**: Estado global de la aplicacion mediante Context API.
**Ubicacion**: src/hooks/

### useAuth.tsx - Autenticacion

AuthProvider expone via Context: { user, isLoading, login, logout }

- **Al montar**: Si hay access_token en localStorage, llama a authApi.me() para cargar el usuario.
- **Login**: Guarda el token, pide me() y setea el usuario en el estado.
- **Logout**: Llama a authApi.logout() (fire-and-forget), borra el token, limpia el estado.
- Usa useCallback para evitar renders innecesarios.

### useCarrito.tsx - Carrito de compras

CarritoProvider expone: { items, addItem(), removeItem(), updateCantidad(), togglePersonalizacion(), limpiar(), cantidadTotal, total }

**Caracteristicas importantes**:

1. Persistencia en localStorage: cada cambio se persiste automaticamente.
2. Sincronizacion entre pestanias: escucha el evento storage de window.
3. Personalizacion: cada item tiene un array personalizacion con IDs de ingredientes a remover.
4. Calculos derivados: cantidadTotal y total se computan con useMemo para eficiencia.

---
## Modulo app/

**Proposito**: Configuracion de la aplicacion.
**Ubicacion**: src/app/

### router.tsx - Definicion de rutas

Usa createBrowserRouter de React Router v7.

| Ruta | Componente | Requiere auth? |
|---|---|---|
| /login | LoginPage | No |
| /registro | RegisterPage | No |
| / (Home) | HomePage | No |
| /productos/:id | ProductDetailPage | No |
| /carrito | CartPage | No |
| /checkout | CheckoutPage | Si (AuthGuard) |
| /direcciones | AddressesPage | Si (AuthGuard) |
| /pedidos | OrdersPage | Si (AuthGuard) |
| /pedidos/:id | OrderDetailPage | Si (AuthGuard) |

Las rutas protegidas estan envueltas en <AuthGuard> que redirige a /login si no hay usuario.

### providers.tsx - Providers

AppProviders envuelve con QueryClientProvider. Actualmente NO se usa - los providers se declaran directamente en main.tsx.

> **Para defender**: providers.tsx existe como disenio preparado para escalar, pero por ahora la app es chica y se declaran inline en main.tsx.

---

## Modulo components/

**Proposito**: Componentes reutilizables.
**Ubicacion**: src/components/

### AuthGuard.tsx

Componente de proteccion de rutas:
- isLoading -> muestra "Verificando sesion..."
- !user -> redirige a /login
- user -> renderiza children

---

## Modulo layouts/

**Proposito**: Layout principal con navegacion.
**Ubicacion**: src/layouts/

### AppLayout.tsx

Sidebar fijo de 256px (w-64) con:
- Logo + nombre "Food Store" con fondo naranja.
- Nav: Tienda, Carrito (con badge de cantidad), Mis pedidos, Direcciones.
- Footer con usuario: avatar con iniciales, nombre, email, boton de cerrar sesion.
- Main content: <Outlet /> de React Router.
- Usa useLocation() para resaltar la ruta activa.

> **Para defender**: Se eligio un sidebar fijo en vez de navbar para un panel de gestion de pedidos. En mobile habria que adaptarlo, pero la prioridad fue desktop.

---
## Modulo pages/

**Proposito**: Pantallas de la aplicacion.
**Ubicacion**: src/pages/

### HomePage.tsx - Tienda

- Banner promocional con gradiente naranja.
- Buscador de productos por nombre (filtro en tiempo real).
- Filtro por categorias: las primeras 8 como pills seleccionables.
- Grid de productos: 4 columnas responsive con imagen, precio y boton Agregar.
- Paginacion: Anterior/Siguiente con offset y limit=20.
- Estados: Loading, error, empty, y data.

### ProductDetailPage.tsx - Detalle de producto

- Galeria de imagenes con selector de thumbnail.
- Info completa: precio, disponibilidad, stock, categorias, ingredientes.
- Ingredientes alergenos marcados con "(Alergeno)".
- Boton deshabilitado si no hay stock.

### CartPage.tsx - Carrito de compras

- Lista de items con nombre, precio unitario, subtotal.
- Controles +/- con limite (min 1, max segun stock).
- Eliminar item con icono de basurero SVG.
- Personalizacion: ingredientes removibles con checkbox, fijos con candado.
- Validacion: no permite dejar 0 ingredientes si no hay fijos.
- Total + boton Finalizar pedido.

### CheckoutPage.tsx - Confirmar pedido

- Si el carrito esta vacio, redirige a /carrito.
- Resumen con subtotal, envio ( fijo), total.
- Seleccion de direccion (radio buttons).
- Forma de pago: Efectivo, MercadoPago, Transferencia bancaria.
- Creacion del pedido via mutation. Al exito, limpia carrito y navega al detalle.

### AddressesPage.tsx - Direcciones

- Lista con alias, direccion, badge Principal.
- CRUD completo: crear, editar, eliminar (con confirmacion), marcar como principal.
- Formulario inline: alias, linea1, linea2, ciudad, provincia, CP.
- Usa React Query mutations con invalidacion de cache.

### OrdersPage.tsx - Mis pedidos

- Lista de pedidos con numero, fecha, estado y total.
- Formato de fecha localizado (es-AR).
- Cada pedido linkea al detalle.

### OrderDetailPage.tsx - Detalle de pedido

- Header con numero, fecha, estado y total.
- Tabla de items con nombre, cantidad, precio, subtotal.
- Resolucion de ingredientes removidos.
- Historial de estados: linea de tiempo de transiciones.
- Boton de cancelar: solo si estado es PENDIENTE o CONFIRMADO, con confirmacion previa.

---
## Archivos raiz de configuracion

| Archivo | Proposito |
|---|---|
| index.html | Entry point HTML con lang="es", theme-color naranja |
| vite.config.ts | Plugins React + Tailwind, proxy /api/v1 -> localhost:8000 |
| tsconfig.app.json | Target ES2023, JSX react-jsx, moduleResolution bundler |
| eslint.config.js | Flat config con ESLint v10 + plugins React |
| .env | VITE_API_BASE_URL=http://localhost:8000 |
| package.json | Scripts: dev, build (tsc + vite), lint, preview |
| src/index.css | @import tailwindcss, fuente system-ui, fondo #fff7ed |
| src/main.tsx | Renderiza React con QueryClient, AuthProvider, CarritoProvider |
| src/App.tsx | Renderiza <RouterProvider router={router} /> |

---

## Flujo completo de la aplicacion

1. Usuario no autenticado -> Navega Tienda, busca productos, ve detalle, agrega al carrito.
2. Al querer checkout -> AuthGuard redirige a /login.
3. Login/Registro -> AuthProvider guarda el JWT en localStorage, carga el usuario.
4. Checkout -> Selecciona direccion, forma de pago, notas. Confirma -> mutation POST /pedidos.
5. Pedido creado -> Carrito se limpia, redirige a detalle del pedido.
6. Mis pedidos -> Lista todos los pedidos del usuario, puede ver detalle y cancelar.
7. Direcciones -> CRUD completo, direccion principal se usa en checkout.

---

## Decisiones tecnicas clave

### 1. React Query en vez de useState para datos del servidor

**Problema**: Manejar loading, error, caching y re-fetch manualmente con useEffect + useState.

**Solucion**: TanStack React Query abstrae todo eso. Cada query tiene isLoading, isError, data. Cachea respuestas 30s (staleTime: 30000), evita re-fetch al enfocar ventana (refetchOnWindowFocus: false), y permite invalidacion selectiva.

### 2. Axios con interceptores para auth

**Problema**: Tener que pasar el token manualmente en cada request.

**Solucion**: Interceptor de request que lee localStorage y agrega el header Authorization. Interceptor de response que hace logout automatico en 401.

### 3. Context API en vez de Redux/Zustand

**Problema**: Estado global para auth y carrito.

**Solucion**: Context API es suficiente para dos contextos que no cambian frecuentemente. Redux o Zustand agregarian complejidad innecesaria. Escalable a Zustand si la app crece.

### 4. Personalizacion como IDs de ingredientes a remover

**Problema**: Modelar como el usuario personaliza su producto (ej: sin cebolla).

**Solucion**: En vez de modelar adiciones, se modelan remociones. El carrito guarda un array personalizacion: number[] con IDs de ingredientes que el usuario no quiere.

### 5. Snapshots en DetallePedido

**Problema**: Si el admin cambia precio/nombre de un producto, el pedido debe reflejar los valores originales.

**Solucion**: Al crear el pedido se guarda nombre_snapshot, precio_snapshot, subtotal_snap por cada item. Asegura integridad historica.

### 6. Tailwind CSS v4

Usamos @import "tailwindcss" (sin tailwind.config.js). Se integra nativamente con Vite via @tailwindcss/vite.

### 7. Proxy de Vite en desarrollo

proxy: { /api/v1: { target: http://localhost:8000, changeOrigin: true } }
Esto evita CORS en desarrollo. En produccion se usa la URL real del backend.

---
## Posibles preguntas en la defensa

### Por que React Query y no fetch() o axios solo?

React Query nos da gratis: cache, re-fetch automatico, manejo de estados (loading/error/data), deduplicacion de requests, invalidacion selectiva. Con fetch() o axios solo tendriamos que implementar todo eso manualmente con useEffect + useState.

### Por que Tailwind y no CSS Modules/Styled Components?

Tailwind acelera el desarrollo con clases utility predecibles, sin necesidad de nombrar clases CSS constantemente, y produce bundles chicos porque purga estilos no usados.

### Como manejas la seguridad del token?

El access_token se guarda en localStorage y se envia como Bearer token en cada request via interceptor de Axios. Si el backend responde 401, el interceptor limpia el token automaticamente. La verificacion real del JWT la hace el backend.

### Que pasa si el usuario cierra el navegador y vuelve?

El carrito persiste en localStorage. La sesion tambien: al recargar, useAuth detecta el token en localStorage y llama a /auth/me para restaurar el usuario.

### Como sincronizas el carrito entre pestanias?

Escuchamos el evento storage de window. Cuando el usuario agrega un producto en la pestania A, se escribe en localStorage, lo que dispara el evento en la pestania B, que actualiza su estado.

### Por que usaste Context API en vez de Redux?

Para el tamano actual del proyecto, Context API es suficiente. Solo tenemos dos contexts globales (auth y carrito) con valores que cambian con poca frecuencia. Redux/Zustand agregarian boilerplate innecesario. Si el estado crece, migrar a Zustand es directo.

### Como manejas la personalizacion de productos?

Cada item en el carrito tiene un array personalizacion con IDs de ingredientes que el usuario quiere remover. En la UI se muestran checkboxes para ingredientes removibles, y los fijos tienen candado.

### Que son los snapshots en el detalle del pedido?

Son valores congelados en el momento de la compra (nombre_snapshot, precio_snapshot). Si el admin actualiza el producto despues, el pedido historico mantiene los valores originales. Practica estandar en e-commerce.

### Como esta estructurado el ruteo?

Con createBrowserRouter de React Router v7. Las rutas publicas son Home, Productos, Carrito, Login y Registro. Las protegidas (Checkout, Direcciones, Pedidos) estan envueltas en <AuthGuard>.

### Que pasa si la API no responde?

Cada componente maneja tres estados via React Query: isLoading (spinner/mensaje de carga), isError (mensaje de error), y data (contenido). QueryClient tiene retry: 1 y staleTime: 30000.
