import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Página mostrada después de completar la suscripción premium.  Se
 * recomienda que la aplicación compruebe la suscripción a través de
 * Firestore o un webhook, pero aquí simplemente informamos al usuario.
 */
export default function PremiumThanksPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8 text-center">
      <h1 className="text-3xl font-bold mb-4">¡Suscripción exitosa!</h1>
      <p className="mb-4">Gracias por suscribirte al plan premium. Ahora puedes acceder a los servicios exclusivos.</p>
      <Link to="/premium" className="px-6 py-3 bg-green-600 text-white rounded hover:bg-green-700">Ir a servicios premium</Link>
    </main>
  );
}