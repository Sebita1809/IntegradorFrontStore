import { createBrowserRouter } from 'react-router-dom'
import { AppLayout } from '../layouts/AppLayout'
import { AuthGuard } from '../components/AuthGuard'
import { LoginPage } from '../pages/LoginPage'
import { RegisterPage } from '../pages/RegisterPage'
import { HomePage } from '../pages/HomePage'
import { ProductDetailPage } from '../pages/ProductDetailPage'
import { CartPage } from '../pages/CartPage'
import { CheckoutPage } from '../pages/CheckoutPage'
import { AddressesPage } from '../pages/AddressesPage'
import { OrdersPage } from '../pages/OrdersPage'
import { OrderDetailPage } from '../pages/OrderDetailPage'

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/registro',
    element: <RegisterPage />,
  },
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'productos/:id', element: <ProductDetailPage /> },
      { path: 'carrito', element: <CartPage /> },
      { path: 'checkout', element: <AuthGuard><CheckoutPage /></AuthGuard> },
      { path: 'direcciones', element: <AuthGuard><AddressesPage /></AuthGuard> },
      { path: 'pedidos', element: <AuthGuard><OrdersPage /></AuthGuard> },
      { path: 'pedidos/:id', element: <AuthGuard><OrderDetailPage /></AuthGuard> },
    ],
  },
])
