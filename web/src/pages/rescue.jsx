import { useParams } from 'react-router-dom';
import { doc, getDocs, query, collection, where, limit } from 'firebase/firestore';
import { db } from '../firebase';
import { useEffect, useState } from 'react';

export default function Rescue() {
  const { microchip } = useParams();
  const [pet, setPet] = useState(null);

  useEffect(() => {
    async function run() {
      // si guardas "microchip" como campo con índice, usa una query:
      const q = query(collection(db,'pets'), where('microchip','==', microchip), limit(1));
      const snap = await getDocs(q);
      setPet(snap.docs[0]?.data() ?? null);
    }
    run();
  }, [microchip]);

  if (!pet) return <div className="p-6">Cargando perfil…</div>;
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">{pet.name}</h1>
      <div className="text-gray-700">Microchip: {pet.microchip}</div>
      <a
        className="inline-block mt-3 px-4 py-2 bg-green-600 text-white rounded"
        href={`https://wa.me/${pet.whatsapp ?? ''}?text=${encodeURIComponent('Hola, tengo información sobre tu mascota.')}`}
        target="_blank" rel="noreferrer"
      >
        Contactar por WhatsApp
      </a>
    </div>
  );
}
