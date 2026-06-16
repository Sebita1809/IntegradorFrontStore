import { useEffect } from 'react'
import { RouterProvider } from 'react-router-dom'
import { router } from './app/router'
import { useAuthStore } from './modules/auth/store/authStore'

function App() {
  const init = useAuthStore((s) => s.init)

  // Al arrancar revalidamos la sesion contra el server (cookie HttpOnly).
  useEffect(() => {
    init()
  }, [init])

  return <RouterProvider router={router} />
}

export default App
