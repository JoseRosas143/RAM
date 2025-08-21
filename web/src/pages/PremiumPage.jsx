import React, { useEffect, useState } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { auth, db, functions } from '../firebase.js';
import { doc, getDoc } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';

const PremiumPage = () => {
  const navigate = useNavigate();
  const [uid, setUid] = useState(null);

  // Observe auth state to get current user ID
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUid(user ? user.uid : null);
    });
    return unsubscribe;
  }, []);

  // Fetch user document to check plan
  const { data: userDoc, isLoading: userLoading } = useQuery(
    ['userPlan', uid],
    async () => {
      if (!uid) return null;
      const docRef = doc(db, 'users', uid);
      const docSnap = await getDoc(docRef);
      return docSnap.exists() ? docSnap.data() : null;
    },
    { enabled: !!uid }
  );

  const hasSubscription = userDoc?.plan === 'premium';

  const handleSubscribe = async () => {
    try {
      const createSession = httpsCallable(functions, 'createCheckoutSession');
      const successUrl = `${window.location.origin}/premium/thanks`;
      const cancelUrl = `${window.location.origin}/premium`;
      const result = await createSession({
        priceId: import.meta.env.VITE_STRIPE_PRICE_PREMIUM,
        quantity: 1,
        mode: 'subscription',
        successUrl,
        cancelUrl
      });
      const { url } = result.data;
      if (url) {
        window.location.href = url;
      }
    } catch (err) {
      console.error(err);
      alert('No se pudo iniciar la suscripción. Asegúrate de estar autenticado.');
    }
  };

  if (userLoading) {
    return <p className="p-4">Cargando...</p>;
  }

  // If user is not subscribed, show subscription prompt
  if (!hasSubscription) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-8 text-center">
        <h1 className="text-3xl font-bold mb-4">Acceso Premium</h1>
        <p className="mb-6">Suscríbete para acceder al chatbot veterinario, recomendaciones personalizadas y árbol genealógico.</p>
        <button
          onClick={handleSubscribe}
          className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
        >
          Suscribirme
        </button>
      </main>
    );
  }

  // User has an active subscription: show premium services
  return (
    <div className="min-h-screen p-4">
      <h1 className="text-3xl font-bold mb-4">Servicios Premium</h1>
      <nav className="flex gap-4 mb-4">
        <Link to="/premium/chat" className="text-blue-600 underline">Chat Veterinario</Link>
        <Link to="/premium/diet" className="text-blue-600 underline">Recomendaciones</Link>
        <Link to="/premium/family" className="text-blue-600 underline">Árbol genealógico</Link>
      </nav>
      <Outlet />
    </div>
  );
};

export default PremiumPage;