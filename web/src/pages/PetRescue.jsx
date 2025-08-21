import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../firebase.js';
import { updateDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

/**
 * Página pública de rescate.  Se muestra cuando alguien escanea el QR o
 * visita /r/:microchip.  Recupera los datos de la mascota por su
 * número de microchip y muestra información mínima para poder
 * identificarla y contactar al tutor por WhatsApp.
 */
export default function PetRescuePage() {
  const { microchip } = useParams();

  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Query the pet document by microchip
  const { data: pet, isLoading: petLoading } = useQuery(
    ['petByMicrochip', microchip],
    async () => {
      const q = query(collection(db, 'pets'), where('microchip', '==', microchip));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
      }
      return null;
    }
  );

  // Fetch owner document if pet is loaded
  const { data: owner } = useQuery(
    ['owner', pet?.ownerId],
    async () => {
      if (!pet?.ownerId) return null;
      const docRef = doc(db, 'users', pet.ownerId);
      const snap = await getDoc(docRef);
      return snap.exists() ? snap.data() : null;
    },
    { enabled: !!pet?.ownerId }
  );

  // Fetch vet document if pet has vetId
  const { data: vet } = useQuery(
    ['vet', pet?.vetId],
    async () => {
      if (!pet?.vetId) return null;
      const docRef = doc(db, 'clinics', pet.vetId);
      const snap = await getDoc(docRef);
      return snap.exists() ? snap.data() : null;
    },
    { enabled: !!pet?.vetId }
  );

  // Fetch settings for WhatsApp default message and numbers
  const { data: settings } = useQuery(['settings'], async () => {
    const docRef = doc(db, 'settings', 'app');
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? docSnap.data() : {};
  });

  // Determine the WhatsApp number to use
  const getWhatsAppNumber = () => {
    if (!pet) return null;
    // Prefer the pet's own whatsapp field
    if (pet.whatsapp) return pet.whatsapp;
    // Otherwise, attempt to get the owner's phone from settings or return default
    return settings?.defaultWhatsapp || null;
  };

  // Determine the message
  const getWhatsAppMessage = () => {
    return settings?.waLostMessage || 'Hola, tengo información sobre tu mascota.';
  };

  const handleWhatsAppClick = async () => {
    const number = getWhatsAppNumber();
    const message = getWhatsAppMessage();
    if (!number) return;
    try {
      // Call logging endpoint (optional, fails silently)
      await fetch('/onWaClick', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ microchip, origin: 'rescue', ua: navigator.userAgent })
      });
    } catch (err) {
      console.warn('No se pudo registrar el clic de WhatsApp');
    }
    // Redirect to WhatsApp
    const url = `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
    window.location.href = url;
  };

  if (petLoading) {
    return <p className="p-4">Cargando mascota…</p>;
  }
  if (!pet) {
    return <p className="p-4">Mascota no encontrada</p>;
  }

  // Helper to calculate age in years from birthDate
  const calculateAge = (birthDate) => {
    if (!birthDate) return null;
    const birth = new Date(birthDate);
    const now = new Date();
    const diff = now - birth;
    return Math.floor(diff / (365.25 * 24 * 60 * 60 * 1000));
  };

  const age = calculateAge(pet.birthDate);

  // Determine if current user is owner
  const isOwner = auth.currentUser && pet?.ownerId === auth.currentUser.uid;

  // Handlers for buttons
  const handleViewDocuments = () => {
    if (isOwner) {
      navigate('/app/documents');
    }
  };
  const handleViewVaccines = () => {
    if (isOwner) {
      navigate('/app/vaccines');
    }
  };
  const handleViewDeworm = () => {
    if (isOwner) {
      navigate('/app/deworm');
    }
  };
  const handleModifyInfo = () => {
    if (isOwner) {
      navigate('/app/profile');
    }
  };
  const handleReportLost = async () => {
    // Only owner can report lost
    if (!isOwner) return;
    try {
      // Call server-side function to mark lost and log
      await fetch('/notifyLost', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ microchip, ua: navigator.userAgent }),
      });
      // Optionally update lastLocation using browser geolocation
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (pos) => {
          try {
            const ref = doc(db, 'pets', pet.id);
            await updateDoc(ref, {
              lastLocation: {
                lat: pos.coords.latitude,
                lng: pos.coords.longitude,
                at: new Date().toISOString(),
              },
            });
            // Refresh query
            queryClient.invalidateQueries(['petByMicrochip', microchip]);
          } catch (err) {
            console.error('No se pudo actualizar la ubicación', err);
          }
        });
      }
    } catch (err) {
      console.error('Error al reportar extravío', err);
    }
  };

  return (
    <main className="min-h-screen bg-orange-50 p-4">
      {/* Top section with name, sex, microchip and age */}
      <div className="max-w-4xl mx-auto bg-orange-100 p-4 rounded shadow">
        <div className="flex flex-col items-center text-center">
          {/* Photo placeholder if no photoUrl */}
          {pet.photoUrl ? (
            // eslint-disable-next-line jsx-a11y/alt-text
            <img src={pet.photoUrl} className="w-32 h-32 rounded-full object-cover -mt-16 border-4 border-white" />
          ) : (
            <div className="w-32 h-32 rounded-full bg-gray-300 flex items-center justify-center -mt-16 border-4 border-white">
              <span className="text-gray-600">Sin foto</span>
            </div>
          )}
          <h1 className="text-2xl font-bold mt-4">{pet.name}</h1>
          <p className="text-lg font-semibold capitalize">{pet.sex || ''}</p>
          {pet.microchip && <p className="text-sm mt-1">Microchip: {pet.microchip}</p>}
          {age !== null && <p className="text-sm">Edad: {age} {age === 1 ? 'año' : 'años'}</p>}
        </div>

        {/* Info cards */}
        <div className="grid md:grid-cols-3 gap-4 mt-8">
          {/* Pet info */}
          <div className="bg-white rounded shadow p-4 border-t-4 border-orange-400">
            <h2 className="font-bold mb-2">Información de la Mascota</h2>
            <p><strong>Especie:</strong> {pet.species || 'N/D'}</p>
            <p><strong>Raza:</strong> {pet.breed || 'N/D'}</p>
            {pet.birthDate && <p><strong>Fecha de Nacimiento:</strong> {pet.birthDate}</p>}
            {pet.color && <p><strong>Color(es):</strong> {pet.color}</p>}
            {pet.marks && <p><strong>Señas particulares:</strong> {pet.marks}</p>}
            {typeof pet.spayed !== 'undefined' && <p><strong>¿Esterilizado?:</strong> {pet.spayed ? 'Sí' : 'No'}</p>}
          </div>
          {/* Owner info */}
          <div className="bg-white rounded shadow p-4 border-t-4 border-orange-400">
            <h2 className="font-bold mb-2">Información del Tutor</h2>
            <p><strong>Nombre:</strong> {owner?.displayName || 'N/D'}</p>
            <p><strong>E-mail:</strong> {owner?.email || 'N/D'}</p>
            <p><strong>Número de teléfono:</strong> {owner?.phone || 'N/D'}</p>
            {owner?.state && <p><strong>Estado:</strong> {owner.state}</p>}
            {owner?.city && <p><strong>Municipio:</strong> {owner.city}</p>}
          </div>
          {/* Vet info */}
          <div className="bg-white rounded shadow p-4 border-t-4 border-orange-400">
            <h2 className="font-bold mb-2">Veterinario</h2>
            {vet ? (
              <>
                <p><strong>Nombre:</strong> {vet.name}</p>
                <p><strong>Teléfono:</strong> {vet.phone}</p>
                <p><strong>Estado:</strong> {vet.state}</p>
                <p><strong>Municipio:</strong> {vet.city}</p>
              </>
            ) : (
              <p>No asignado</p>
            )}
          </div>
        </div>

        {/* Other buttons */}
        <div className="mt-8 text-center">
          <div className="grid md:grid-cols-3 gap-4 mb-4">
            <button
              onClick={handleViewDocuments}
              disabled={!isOwner}
              className={`py-2 px-3 rounded text-white ${isOwner ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'}`}
            >
              Ver documentos
            </button>
            <button
              onClick={handleViewVaccines}
              disabled={!isOwner}
              className={`py-2 px-3 rounded text-white ${isOwner ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'}`}
            >
              Ver vacunas
            </button>
            <button
              onClick={handleViewDeworm}
              disabled={!isOwner}
              className={`py-2 px-3 rounded text-white ${isOwner ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'}`}
            >
              Ver desparasitaciones
            </button>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            <button
              onClick={handleReportLost}
              disabled={!isOwner}
              className={`py-2 px-3 rounded text-white ${isOwner ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-400 cursor-not-allowed'}`}
            >
              Reportar extravío
            </button>
            <button
              onClick={handleModifyInfo}
              disabled={!isOwner}
              className={`py-2 px-3 rounded text-white ${isOwner ? 'bg-pink-500 hover:bg-pink-600' : 'bg-gray-400 cursor-not-allowed'}`}
            >
              Modificar información
            </button>
            <button
              onClick={handleWhatsAppClick}
              className="bg-green-600 text-white py-2 px-3 rounded hover:bg-green-700"
            >
              Contactar tutor
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}