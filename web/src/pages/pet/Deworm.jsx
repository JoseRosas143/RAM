import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { nanoid } from 'nanoid';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useEffect, useState } from 'react';
import { db, auth } from '../../firebase.js';

const schema = z.object({
  product: z.string().min(1, 'Producto requerido'),
  date: z.string().min(1, 'Fecha requerida'),
  coverUntil: z.string().min(1, 'Cobertura hasta requerida')
});

export default function DewormPage() {
  const queryClient = useQueryClient();
  const [petId, setPetId] = useState(null);

  useEffect(() => {
    const unsub = auth.onAuthStateChanged((user) => {
      if (user) setPetId(user.uid);
    });
    return unsub;
  }, []);

  const { data: deworm = [], isLoading } = useQuery(['deworm', petId], async () => {
    if (!petId) return [];
    const ref = doc(db, 'pets', petId);
    const snap = await getDoc(ref);
    return snap.data()?.deworm || [];
  }, { enabled: !!petId });

  const mutation = useMutation(async (newItem) => {
    const ref = doc(db, 'pets', petId);
    const snap = await getDoc(ref);
    const data = snap.data() || {};
    const updated = [...(data.deworm || []), newItem];
    await updateDoc(ref, { deworm: updated });
  }, {
    onSuccess: () => queryClient.invalidateQueries(['deworm', petId])
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { product: '', date: '', coverUntil: '' }
  });

  const onSubmit = (values) => {
    const newItem = { id: nanoid(), ...values };
    mutation.mutate(newItem);
    reset();
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Desparasitación</h2>
      {isLoading ? (
        <p>Cargando…</p>
      ) : (
        <>
          <table className="w-full mb-6 text-sm text-left">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2">Producto</th>
                <th className="p-2">Fecha</th>
                <th className="p-2">Cobertura hasta</th>
              </tr>
            </thead>
            <tbody>
              {deworm.map((item) => (
                <tr key={item.id} className="border-b">
                  <td className="p-2">{item.product}</td>
                  <td className="p-2">{item.date}</td>
                  <td className="p-2">{item.coverUntil}</td>
                </tr>
              ))}
              {deworm.length === 0 && (
                <tr><td colSpan="3" className="p-2 text-center">Sin registros</td></tr>) }
            </tbody>
          </table>
          <form className="space-y-4 max-w-md" onSubmit={handleSubmit(onSubmit)}>
            <h3 className="font-semibold">Agregar desparasitación</h3>
            <div>
              <label className="block mb-1">Producto</label>
              <input className="w-full border p-2" {...register('product')} />
              {errors.product && <p className="text-red-600 text-sm">{errors.product.message}</p>}
            </div>
            <div>
              <label className="block mb-1">Fecha</label>
              <input type="date" className="w-full border p-2" {...register('date')} />
              {errors.date && <p className="text-red-600 text-sm">{errors.date.message}</p>}
            </div>
            <div>
              <label className="block mb-1">Cobertura hasta</label>
              <input type="date" className="w-full border p-2" {...register('coverUntil')} />
              {errors.coverUntil && <p className="text-red-600 text-sm">{errors.coverUntil.message}</p>}
            </div>
            <button type="submit" className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700">Añadir</button>
          </form>
        </>
      )}
    </div>
  );
}