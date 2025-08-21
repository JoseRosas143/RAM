import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Página que se muestra cuando el usuario cancela un pago.  Aquí se
 * informa al usuario y se le ofrece volver a la tienda o al panel.
 */
export default function BuyCancelPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8 text-center">
      <h1 className="text-3xl font-bold mb-4">Pago cancelado</h1>
      <p className="mb-4">No se realizó ningún cargo. Puedes volver a intentar la compra cuando quieras.</p>
      <div className="flex gap-4">
        <Link to="/buy" className="px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700">Volver a la tienda</Link>
        <Link to="/app" className="px-6 py-3 bg-gray-300 text-gray-800 rounded hover:bg-gray-400">Panel</Link>
      </div>
    </main>
  );
}