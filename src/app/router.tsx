import { createBrowserRouter } from 'react-router-dom'
import { AppLayout } from '../shared/layouts/AppLayout'
import { AuthGuard } from '../modules/auth/components/AuthGuard'
import { LoginPage } from '../modules/auth/pages/LoginPage'
import { RegisterPage } from '../modules/auth/pages/RegisterPage'
import { HomePage } from '../modules/products/pages/HomePage'
import { ProductDetailPage } from '../modules/products/pages/ProductDetailPage'
import { CartPage } from '../modules/cart/pages/CartPage'
import { CheckoutPage } from '../modules/checkout/pages/CheckoutPage'
import { PaymentResultPage } from '../modules/checkout/pages/PaymentResultPage'
import { AddressesPage } from '../modules/addresses/pages/AddressesPage'
import { OrdersPage } from '../modules/orders/pages/OrdersPage'
import { OrderDetailPage } from '../modules/orders/pages/OrderDetailPage'

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
      { path: 'pedidos/:pedidoId/pago/:status', element: <PaymentResultPage /> },
    ],
  },
])
