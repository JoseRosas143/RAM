import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { nanoid } from 'nanoid';
import { useEffect, useState } from 'react';
import { db, auth } from '../../firebase.js';

const schema = z.object({
  name: z.string().min(1, 'Nombre de vacuna requerido'),
  date: z.string().min(1, 'Fecha requerida'),
  batch: z.string().optional(),
  status: z.enum(['programada', 'aplicada'])
});

export default function VaccinesPage() {
  const queryClient = useQueryClient();
  const [petId, setPetId] = useState(null);

  useEffect(() => {
    const unsub = auth.onAuthStateChanged((user) => {
      if (user) setPetId(user.uid);
    });
    return unsub;
  }, []);

  const { data: vaccines = [], isLoading } = useQuery(['vaccines', petId], async () => {
    if (!petId) return [];
    const ref = doc(db, 'pets', petId);
    const snap = await getDoc(ref);
    const data = snap.data();
    return data?.vaccines || [];
  }, { enabled: !!petId });

  const mutation = useMutation(async (newVaccine) => {
    const ref = doc(db, 'pets', petId);
    const snap = await getDoc(ref);
    const data = snap.data() || {};
    const updated = [...(data.vaccines || []), newVaccine];
    await updateDoc(ref, { vaccines: updated });
  }, {
    onSuccess: () => queryClient.invalidateQueries(['vaccines', petId])
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { name: '', date: '', batch: '', status: 'programada' }
  });

  const onSubmit = (values) => {
    const newVaccine = { id: nanoid(), ...values };
    mutation.mutate(newVaccine);
    reset();
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Vacunas</h2>
      {isLoading ? (
        <p>Cargando…</p>
      ) : (
        <>
          <table className="w-full mb-6 text-sm text-left">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2">Nombre</th>
                <th className="p-2">Fecha</th>
                <th className="p-2">Lote</th>
                <th className="p-2">Estado</th>
              </tr>
            </thead>
            <tbody>
              {vaccines.map((v) => (
                <tr key={v.id} className="border-b">
                  <td className="p-2">{v.name}</td>
                  <td className="p-2">{v.date}</td>
                  <td className="p-2">{v.batch}</td>
                  <td className="p-2">{v.status}</td>
                </tr>
              ))}
              {vaccines.length === 0 && (
                <tr><td colSpan="4" className="p-2 text-center">Sin registros</td></tr>
              )}
            </tbody>
          </table>
          <form className="space-y-4 max-w-md" onSubmit={handleSubmit(onSubmit)}>
            <h3 className="font-semibold">Agregar vacuna</h3>
            <div>
              <label className="block mb-1">Nombre</label>
              <input className="w-full border p-2" {...register('name')} />
              {errors.name && <p className="text-red-600 text-sm">{errors.name.message}</p>}
            </div>
            <div>
              <label className="block mb-1">Fecha</label>
              <input type="date" className="w-full border p-2" {...register('date')} />
              {errors.date && <p className="text-red-600 text-sm">{errors.date.message}</p>}
            </div>
            <div>
              <label className="block mb-1">Lote (opcional)</label>
              <input className="w-full border p-2" {...register('batch')} />
            </div>
            <div>
              <label className="block mb-1">Estado</label>
              <select className="w-full border p-2" {...register('status')} >
                <option value="programada">Programada</option>
                <option value="aplicada">Aplicada</option>
              </select>
            </div>
            <button type="submit" className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700">Añadir vacuna</button>
          </form>
        </>
      )}
    </div>
  );
}