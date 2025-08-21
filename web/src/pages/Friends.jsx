import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { collection, getDocs } from 'firebase/firestore';
import { db, auth } from '../firebase.js';
import { doc, getDoc } from 'firebase/firestore';

/**
 * Página para buscar amigos para tu mascota.  Permite filtrar por
 * especie y raza y muestra una lista de mascotas registradas (excluyendo
 * la tuya).  En una versión futura se podrían enviar solicitudes o
 * mensajes directos.
 */
export default function FriendsPage() {
  const [speciesFilter, setSpeciesFilter] = useState('');
  const [breedFilter, setBreedFilter] = useState('');

  // Fetch all pets from Firestore
  const { data: pets, isLoading } = useQuery(['allPets'], async () => {
    const snap = await getDocs(collection(db, 'pets'));
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  });

  // Get current user to exclude their own pet(s)
  const currentUid = auth.currentUser?.uid;

  const filteredPets = (pets || [])
    .filter((p) => p.ownerId !== currentUid)
    .filter((p) => (speciesFilter ? p.species === speciesFilter : true))
    .filter((p) => (breedFilter ? p.breed === breedFilter : true));

  const handleContactOwner = async (pet) => {
    try {
      // Check if pet allows contact
      if (!pet.allowContact) return;
      // Fetch owner document to get phone number
      const userRef = doc(db, 'users', pet.ownerId);
      const userSnap = await getDoc(userRef);
      const userData = userSnap.exists() ? userSnap.data() : null;
      const number = userData?.phone;
      if (!number) {
        alert('El tutor no tiene un número de contacto disponible');
        return;
      }
      const msg = `Hola, me gustaría conocer a tu mascota ${pet.name}.`;
      const url = `https://wa.me/${number}?text=${encodeURIComponent(msg)}`;
      window.open(url, '_blank');
    } catch (err) {
      console.error('Error contacting owner', err);
    }
  };

  return (
    <main className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Buscador de Amigos</h1>
      <p className="mb-4">Encuentra compañeros de juego o contactos para tu mascota filtrando por especie o raza.</p>
      <div className="flex flex-wrap gap-4 mb-4">
          <input
            value={speciesFilter}
            onChange={(e) => setSpeciesFilter(e.target.value)}
            placeholder="Especie (ej. perro, gato)"
            className="border p-2 flex-1"
          />
          <input
            value={breedFilter}
            onChange={(e) => setBreedFilter(e.target.value)}
            placeholder="Raza"
            className="border p-2 flex-1"
          />
      </div>
      {isLoading ? (
        <p>Cargando mascotas…</p>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {filteredPets.map((pet) => (
            <div key={pet.id} className="border rounded p-4 shadow">
              <h2 className="font-bold text-lg mb-1">{pet.name}</h2>
              <p className="text-sm mb-1"><strong>Especie:</strong> {pet.species}</p>
              <p className="text-sm mb-1"><strong>Raza:</strong> {pet.breed || 'N/D'}</p>
              {/* Show owner city if available (would require storing in user doc) */}
              {/* Future: add button to send message */}
          {pet.allowContact && (
            <button
              onClick={() => handleContactOwner(pet)}
              className="mt-2 bg-green-600 text-white py-1 px-2 rounded hover:bg-green-700 text-sm"
            >
              Contactar tutor
            </button>
          )}
            </div>
          ))}
          {filteredPets.length === 0 && <p>No se encontraron mascotas con esos filtros.</p>}
        </div>
      )}
    </main>
  );
}