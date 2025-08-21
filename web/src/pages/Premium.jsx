import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAuth } from 'firebase/auth';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { initializeApp } from 'firebase/app';

// Firebase config (use environment variables at build time)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const functions = getFunctions(app);

/**
 * Premium page – shows subscription offer if user is not premium.  If the user
 * has an active subscription (determined via custom claims or Firestore), it
 * renders premium tools (chatbot, diet form and genealogy builder).  This
 * component focuses on the structure; implementation of each tool is left
 * to separate components.
 */
export default function PremiumPage() {
  const [isPremium, setIsPremium] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        setIsPremium(false);
        setLoading(false);
        return;
      }
      // Example: read custom claim 'plan' or fetch from Firestore
      const token = await user.getIdTokenResult();
      setIsPremium(token.claims.plan === 'premium');
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const startCheckout = async () => {
    const createSession = httpsCallable(functions, 'createCheckoutSession');
    try {
      const { data } = await createSession({ priceId: import.meta.env.VITE_STRIPE_PREMIUM_PRICE_ID, mode: 'subscription' });
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error(err);
      alert('Error al iniciar la suscripción');
    }
  };

  if (loading) {
    return <p className="p-6">Verificando suscripción…</p>;
  }

  if (!auth.currentUser) {
    return (
      <div className="p-6">
        <p>Debes iniciar sesión para acceder a la suscripción premium.</p>
        <Link to="/login" className="text-blue-600 underline">Iniciar sesión</Link>
      </div>
    );
  }

  return (
    <div className="p-6">
      {isPremium ? (
        <div className="space-y-6">
          <h1 className="text-2xl font-bold">Acceso Premium</h1>
          <p>Bienvenido a las herramientas premium.  Selecciona una sección:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li>Chatbot veterinario (próximamente)</li>
            <li>Recomendaciones de dieta y ejercicio (próximamente)</li>
            <li>Árbol genealógico (próximamente)</li>
          </ul>
        </div>
      ) : (
        <div className="space-y-4 max-w-xl mx-auto text-center">
          <h1 className="text-3xl font-bold">Suscripción Premium</h1>
          <p>Desbloquea nuestro chatbot de salud, recomendaciones personalizadas y un árbol genealógico interactivo para tus mascotas.</p>
          <button onClick={startCheckout} className="bg-purple-600 text-white py-2 px-4 rounded hover:bg-purple-700">Suscribirme</button>
        </div>
      )}
    </div>
  );
}