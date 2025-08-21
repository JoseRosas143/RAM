import React from 'react';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../firebase.js';
import products from '../data/products.js';

/**
 * Tienda de productos.  Muestra los artículos disponibles y permite
 * iniciar un pago a través de Stripe creando una sesión de Checkout
 * mediante una Cloud Function callable.  La página espera que el
 * usuario esté autenticado; de lo contrario la función lanzará un
 * error de autenticación.
 */
export default function BuyPage() {
  const handleBuy = async (product) => {
    try {
      const createSession = httpsCallable(functions, 'createCheckoutSession');
      const successUrl = `${window.location.origin}/buy/success`;
      const cancelUrl = `${window.location.origin}/buy`;
      const result = await createSession({
        priceId: product.priceId,
        quantity: 1,
        mode: product.mode || 'payment',
        successUrl,
        cancelUrl
      });
      const { url } = result.data;
      if (url) {
        window.location.href = url;
      }
    } catch (err) {
      console.error(err);
      alert('No se pudo iniciar el pago. Asegúrate de estar autenticado.');
    }
  };

  return (
    <main className="p-6">
      <h1 className="text-3xl font-bold mb-6">Tienda</h1>
      <div className="grid md:grid-cols-3 gap-6">
        {products
          .filter((p) => !!p.priceId)
          .map((product) => (
            <div key={product.id} className="border rounded p-4 flex flex-col justify-between">
              <div>
                <h2 className="text-xl font-semibold mb-2">{product.name}</h2>
                <p className="text-sm text-gray-700 mb-4">{product.description}</p>
              </div>
              <button
                onClick={() => handleBuy(product)}
                className="mt-auto bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Comprar
              </button>
            </div>
          ))}
      </div>
    </main>
  );
}