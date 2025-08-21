import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { collection, addDoc } from 'firebase/firestore';
import { db, auth } from '../firebase.js';
import { useNavigate } from 'react-router-dom';

const schema = z.object({
  name: z.string().min(1, 'Nombre requerido'),
  phone: z.string().min(1, 'Teléfono requerido'),
  email: z.string().email('Email inválido'),
  state: z.string().min(1, 'Estado requerido'),
  city: z.string().min(1, 'Ciudad requerida'),
  lat: z.number().or(z.string().transform(Number)),
  lng: z.number().or(z.string().transform(Number))
});

export default function VetRegister() {
  const navigate = useNavigate();
  const { register, handleSubmit, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { name: '', phone: '', email: '', state: '', city: '', lat: '', lng: '' }
  });

  useEffect(() => {
    // Try to get current position for convenience
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setValue('lat', pos.coords.latitude);
        setValue('lng', pos.coords.longitude);
      });
    }
  }, [setValue]);

  const onSubmit = async (values) => {
    try {
      // Create clinic document
      await addDoc(collection(db, 'clinics'), {
        name: values.name,
        phone: values.phone,
        email: values.email,
        state: values.state,
        city: values.city,
        lat: Number(values.lat),
        lng: Number(values.lng),
        verified: false,
        createdAt: Date.now(),
        ownerUserId: auth.currentUser ? auth.currentUser.uid : null
      });
      alert('Clínica registrada. Un administrador debe verificarla.');
      navigate('/vets');
    } catch (err) {
      console.error(err);
      alert('Error al registrar clínica');
    }
  };

  return (
    <main className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Registro de clínica</h1>
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label className="block mb-1">Nombre de la clínica</label>
          <input className="w-full border p-2" {...register('name')} />
          {errors.name && <p className="text-red-600 text-sm">{errors.name.message}</p>}
        </div>
        <div>
          <label className="block mb-1">Teléfono</label>
          <input className="w-full border p-2" {...register('phone')} />
          {errors.phone && <p className="text-red-600 text-sm">{errors.phone.message}</p>}
        </div>
        <div>
          <label className="block mb-1">Email</label>
          <input type="email" className="w-full border p-2" {...register('email')} />
          {errors.email && <p className="text-red-600 text-sm">{errors.email.message}</p>}
        </div>
        <div>
          <label className="block mb-1">Estado</label>
          <input className="w-full border p-2" {...register('state')} />
          {errors.state && <p className="text-red-600 text-sm">{errors.state.message}</p>}
        </div>
        <div>
          <label className="block mb-1">Ciudad</label>
          <input className="w-full border p-2" {...register('city')} />
          {errors.city && <p className="text-red-600 text-sm">{errors.city.message}</p>}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-1">Latitud</label>
            <input className="w-full border p-2" {...register('lat')} />
            {errors.lat && <p className="text-red-600 text-sm">{errors.lat.message}</p>}
          </div>
          <div>
            <label className="block mb-1">Longitud</label>
            <input className="w-full border p-2" {...register('lng')} />
            {errors.lng && <p className="text-red-600 text-sm">{errors.lng.message}</p>}
          </div>
        </div>
        <button type="submit" className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700">Registrar clínica</button>
      </form>
    </main>
  );
}