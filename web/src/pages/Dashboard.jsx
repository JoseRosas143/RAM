import { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../firebase';

export default function Dashboard() {
  const [pets, setPets] = useState([]);

  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    const q = query(collection(db, 'pets'), where('ownerId', '==', uid));
    const unsub = onSnapshot(q, (snap) => {
      setPets(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold">Mis mascotas</h2>
      <ul className="mt-4 grid gap-3">
        {pets.map(p => (
          <li key={p.id} className="border rounded p-3">
            <div className="font-medium">{p.name}</div>
            <div className="text-sm text-gray-600">Microchip: {p.microchip}</div>
            <a className="text-indigo-600 text-sm" href={`/r/${p.microchip}`}>Ver perfil público</a>
          </li>
        ))}
      </ul>
      {pets.length === 0 && <div className="text-gray-600 mt-4">Aún no tienes mascotas. Crea la primera.</div>}
    </div>
  );
}
