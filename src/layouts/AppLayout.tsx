import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useCarrito } from '../hooks/useCarrito'
import { useAuth } from '../hooks/useAuth'

/* se hacen funciones para los íconos(idea de midudev) */
function StoreIcon() {
  return (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349M3.75 21V9.349m0 0a3.001 3.001 0 0 0 3.75-.615A2.993 2.993 0 0 0 9.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 0 0 2.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 0 0 3.75.614m-16.5 0a3.004 3.004 0 0 1-.621-4.72l1.189-1.19A1.5 1.5 0 0 1 5.378 3h13.243a1.5 1.5 0 0 1 1.06.44l1.19 1.189a3 3 0 0 1-.621 4.72M6.75 18h3.75a.75.75 0 0 0 .75-.75V13.5a.75.75 0 0 0-.75-.75H6.75a.75.75 0 0 0-.75.75v3.75c0 .414.336.75.75.75Z" />
    </svg>
  )
}

function CartIcon() {
  return (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
    </svg>
  )
}

function PackageIcon() {
  return (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
    </svg>
  )
}

function PinIcon() {
  return (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
    </svg>
  )
}

export function AppLayout() {
  const { cantidadTotal } = useCarrito()
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const links = [
    { to: '/', label: 'Tienda', icon: <StoreIcon /> },
    { to: '/carrito', label: 'Carrito', icon: <CartIcon />, badge: cantidadTotal },
    { to: '/pedidos', label: 'Mis pedidos', icon: <PackageIcon /> },
    { to: '/direcciones', label: 'Direcciones', icon: <PinIcon /> },
  ]

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/'
    return location.pathname.startsWith(path)
  }

  return (
    <div className="flex min-h-screen bg-orange-50">
      <aside className="fixed left-0 top-0 z-30 flex h-screen w-64 flex-col bg-white border-r border-orange-100">
        <Link
          to="/"
          className="flex items-center gap-3 bg-orange-600 px-6 py-5"
        >
          <span className="text-lg">🍔</span>
          <span className="text-xl font-bold text-white">Food Store</span>
        </Link>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {links.map((link) => {
            const active = isActive(link.to)
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
                  active
                    ? 'bg-orange-100 text-orange-700'
                    : 'text-gray-500 hover:bg-orange-50 hover:text-orange-600'
                }`}
              >
                <span className="shrink-0">{link.icon}</span>
                <span>{link.label}</span>
                {link.badge != null && link.badge > 0 && (
                  <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-orange-500 px-1.5 text-xs font-bold text-white">
                    {link.badge > 99 ? '99+' : link.badge}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>

        <div className="border-t border-orange-100 px-4 py-4">
          {user ? (
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-200 text-sm font-bold text-orange-700">
                  {user.nombre.charAt(0)}{user.apellido.charAt(0)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-gray-800">
                    {user.nombre} {user.apellido}
                  </p>
                  <p className="truncate text-xs text-gray-400">{user.email}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => { logout(); navigate('/login') }}
                className="text-sm text-gray-500 hover:text-red-600"
              >
                Cerrar sesión
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="block rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white text-center hover:bg-orange-600"
            >
              Iniciar sesión
            </Link>
          )}
        </div>
      </aside>

      <main className="ml-64 flex-1 px-8 py-8">
        <Outlet />
      </main>
    </div>
  )
}
