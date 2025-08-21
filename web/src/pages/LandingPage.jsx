import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../translation';

const LandingPage = () => {
  const { t } = useTranslation();
  return (
    <main className="min-h-screen bg-white flex flex-col">
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center text-center py-20 px-4 bg-gradient-to-b from-green-200 to-blue-200">
        <h1 className="text-4xl md:text-6xl font-bold mb-4">{t('landing.title')}</h1>
        <p className="text-xl md:text-2xl mb-6">{t('landing.subtitle')}</p>
        <div className="flex flex-wrap justify-center gap-4 mb-6">
          <span className="px-3 py-1 bg-white rounded-full shadow">{t('landing.badges.free')}</span>
          <span className="px-3 py-1 bg-white rounded-full shadow">{t('landing.badges.verified')}</span>
          <span className="px-3 py-1 bg-white rounded-full shadow">{t('landing.badges.qr')}</span>
        </div>
        <div className="flex gap-4">
          <Link
            to="/app"
            className="px-6 py-3 bg-green-600 text-white rounded-lg shadow hover:bg-green-700"
          >
            {t('landing.cta_tutor')}
          </Link>
          <Link
            to="/register-vet"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700"
          >
            {t('landing.cta_vet')}
          </Link>
        </div>
      </section>
      {/* How it works section */}
      <section className="py-12 px-4">
        <h2 className="text-3xl font-semibold mb-6">Cómo funciona</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-2">1. Registra a tu mascota</h3>
            <p>Crea el perfil de tu mascota y descarga su QR.</p>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-2">2. Escanea o lee el microchip</h3>
            <p>Si se pierde, cualquier persona o veterinaria puede escanear el QR o leer el microchip.</p>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-2">3. Te contactan por WhatsApp</h3>
            <p>Recibe un mensaje prellenado para recuperar a tu mascota rápidamente.</p>
          </div>
        </div>
      </section>
      {/* Placeholder for additional sections like benefits, map, testimonials */}
    </main>
  );
};

export default LandingPage;