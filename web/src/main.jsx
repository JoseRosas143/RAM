import React from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import App from './App'
import Home from './pages/Home'
import Dashboard from './pages/Dashboard'
import Premium from './pages/Premium'
import Vet from './pages/Vet'
import Diet from './pages/Diet'
import Lost from './pages/Lost'
import PetPublic from './pages/PetPublic'
import Vets from './pages/Vets'
import PremiumSuccess from './pages/PremiumSuccess'
import PremiumCancel from './pages/PremiumCancel'
import './index.css'

const router = createBrowserRouter([
  {
    element: <App />,
    children: [
      { path: '/', element: <Home /> },
      { path: '/dashboard', element: <Dashboard /> },
      { path: '/premium', element: <Premium /> },
      { path: '/success', element: <PremiumSuccess /> },
      { path: '/cancel', element: <PremiumCancel /> },
      { path: '/vet', element: <Vet /> },
      { path: '/diet', element: <Diet /> },
      { path: '/lost', element: <Lost /> },
      { path: '/p/:petId', element: <PetPublic /> },
      { path: '/vets', element: <Vets /> },
    ]
  }
])

createRoot(document.getElementById('root')).render(<RouterProvider router={router} />)