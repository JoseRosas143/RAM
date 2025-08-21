import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { nanoid } from 'nanoid';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { db, auth } from '../../firebase.js';

const schema = z.object({
  title: z.string().min(1, 'Título requerido'),
  date: z.string().min(1, 'Fecha requerida'),
  notes: z.string().optional()
});

export default function HistoryPage() {
  const queryClient = useQueryClient();
  const [petId, setPetId] = useState(null);

  useEffect(() => {
    const unsub = auth.onAuthStateChanged((user) => {
      if (user) setPetId(user.uid);
    });
    return unsub;
  }, []);

  const { data: history = [], isLoading } = useQuery(['history', petId], async () => {
    if (!petId) return [];
    const ref = doc(db, 'pets', petId);
    const snap = await getDoc(ref);
    return snap.data()?.history || [];
  }, { enabled: !!petId });

  const mutation = useMutation(async (newEntry) => {
    const ref = doc(db, 'pets', petId);
    const snap = await getDoc(ref);
    const data = snap.data() || {};
    const updated = [...(data.history || []), newEntry];
    await updateDoc(ref, { history: updated });
  }, {
    onSuccess: () => queryClient.invalidateQueries(['history', petId])
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { title: '', date: '', notes: '' }
  });

  const onSubmit = (values) => {
    const entry = { id: nanoid(), ...values };
    mutation.mutate(entry);
    reset();
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Historial clínico</h2>
      {isLoading ? <p>Cargando…</p> : (
        <>
          <ul className="space-y-2">
            {history.map((h) => (
              <li key={h.id} className="border p-2 rounded">
                <p className="font-semibold">{h.title} – {h.date}</p>
                <p className="text-sm">{h.notes}</p>
              </li>
            ))}
            {history.length === 0 && <li>No hay registros</li>}
          </ul>
          <form className="space-y-4 max-w-md" onSubmit={handleSubmit(onSubmit)}>
            <h3 className="font-semibold">Agregar registro</h3>
            <div>
              <label className="block mb-1">Título</label>
              <input className="w-full border p-2" {...register('title')} />
              {errors.title && <p className="text-red-600 text-sm">{errors.title.message}</p>}
            </div>
            <div>
              <label className="block mb-1">Fecha</label>
              <input type="date" className="w-full border p-2" {...register('date')} />
              {errors.date && <p className="text-red-600 text-sm">{errors.date.message}</p>}
            </div>
            <div>
              <label className="block mb-1">Notas (opcional)</label>
              <textarea className="w-full border p-2" rows="3" {...register('notes')} />
            </div>
            <button type="submit" className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700">Añadir</button>
          </form>
        </>
      )}
    </div>
  );
}