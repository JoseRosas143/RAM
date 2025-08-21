import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthGate } from './auth/AuthGate.jsx';     // ver abajo
import Home from './pages/Home.jsx';                 // landing con hero
import Dashboard from './pages/Dashboard.jsx';       // panel tutor
import Vets from './pages/Vets.jsx';                 // directorio
import Buy from './pages/Buy.jsx';                   // tienda Stripe
import Premium from './pages/Premium.jsx';           // premium hub
import Rescue from './pages/rescue.jsx';             // /r/:microchip

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<div className="p-6">Cargando…</div>}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route
            path="/app/*"
            element={
              <AuthGate>
                <Dashboard />
              </AuthGate>
            }
          />
          <Route path="/vets" element={<Vets />} />
          <Route path="/buy" element={<Buy />} />
          <Route path="/premium/*" element={<Premium />} />
          <Route path="/r/:microchip" element={<Rescue />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
