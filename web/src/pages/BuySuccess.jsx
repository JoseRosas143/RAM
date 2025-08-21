import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Página que se muestra después de un pago exitoso en Stripe.  En un
 * entorno real se podría consultar la API de Stripe o una Cloud
 * Function para obtener detalles de la orden usando el session_id
 * presente en la URL.  Aquí mostramos un mensaje genérico.
 */
export default function BuySuccessPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8 text-center">
      <h1 className="text-3xl font-bold mb-4">¡Pago completado!</h1>
      <p className="mb-4">Gracias por tu compra. Recibirás un correo de confirmación y podrás encontrar tus productos en el panel.</p>
      <Link to="/app" className="px-6 py-3 bg-green-600 text-white rounded hover:bg-green-700">Ir al panel</Link>
    </main>
  );
}