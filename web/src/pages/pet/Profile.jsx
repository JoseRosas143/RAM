import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { db, auth } from '../../firebase.js';
import { speciesList, breeds } from '../../data/species.js';
import { useState, useEffect } from 'react';
import { nanoid } from 'nanoid';

// Schema for pet profile validation
const schema = z.object({
  name: z.string().min(1, 'Nombre requerido'),
  species: z.string(),
  breed: z.string().optional(),
  sex: z.enum(['macho', 'hembra', 'otro']),
  color: z.string().optional(),
  birthDate: z.string().optional(),
  marks: z.string().optional(),
  spayed: z.boolean().optional(),
  // Información de seguro
  insuranceProvider: z.string().optional(),
  insurancePolicy: z.string().optional(),
  insuranceExpiry: z.string().optional(),
  // Permite que otros tutores contacten al dueño desde la sección de amigos
  allowContact: z.boolean().optional(),
});

export default function PetProfile() {
  const queryClient = useQueryClient();
  const [petId, setPetId] = useState(null);

  // Determine user's pet ID (simplified: assume a single pet stored under users/{uid}/pet)
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        // Here we assume pet document ID equals user UID for simplicity
        setPetId(user.uid);
      }
    });
    return unsubscribe;
  }, []);

  // Fetch pet data
  const { data: petData, isLoading } = useQuery(['pet', petId], async () => {
    if (!petId) return null;
    const ref = doc(db, 'pets', petId);
    const snap = await getDoc(ref);
    return snap.exists() ? snap.data() : null;
  }, { enabled: !!petId });

  // Mutation to update pet
  const mutation = useMutation(
    async (values) => {
      if (!petId) throw new Error('petId missing');
      const ref = doc(db, 'pets', petId);
      // If the pet does not have a microchip yet, generate one
      const currentSnap = await getDoc(ref);
      let microchip = currentSnap.exists() ? currentSnap.data().microchip : null;
      if (!microchip) {
        microchip = nanoid(10);
      }
      // Separate insurance fields from the rest
      const { insuranceProvider, insurancePolicy, insuranceExpiry, allowContact, ...rest } = values;
      const insurance = (insuranceProvider || insurancePolicy || insuranceExpiry)
        ? {
            provider: insuranceProvider || '',
            policy: insurancePolicy || '',
            expiry: insuranceExpiry || '',
          }
        : undefined;
      const payload = {
        ...rest,
        ownerId: auth.currentUser.uid,
        microchip,
      };
      if (insurance) payload.insurance = insurance;
      if (typeof allowContact === 'boolean') payload.allowContact = allowContact;
      await setDoc(ref, payload, { merge: true });
    },
    {
      onSuccess: () => queryClient.invalidateQueries(['pet', petId])
    }
  );

  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      species: 'dog',
      breed: '',
      sex: 'macho',
      color: '',
      birthDate: '',
      marks: '',
      spayed: false,
      insuranceProvider: '',
      insurancePolicy: '',
      insuranceExpiry: '',
      allowContact: true
    }
  });

  // Load pet data into form when fetched
  useEffect(() => {
    if (petData) {
      reset({
        name: petData.name || '',
        species: petData.species || 'dog',
        breed: petData.breed || '',
        sex: petData.sex || 'macho',
        color: petData.color || '',
        birthDate: petData.birthDate || '',
        marks: petData.marks || '',
        spayed: petData.spayed || false,
        insuranceProvider: petData.insurance?.provider || '',
        insurancePolicy: petData.insurance?.policy || '',
        insuranceExpiry: petData.insurance?.expiry || '',
        allowContact: typeof petData.allowContact === 'boolean' ? petData.allowContact : true
      });
    }
  }, [petData, reset]);

  const selectedSpecies = watch('species');

  const onSubmit = (values) => {
    mutation.mutate({ ...values });
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Perfil de mascota</h2>
      {isLoading ? (
        <p>Cargando información…</p>
      ) : (
        <form className="space-y-4 max-w-lg" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label className="block mb-1">Nombre</label>
            <input className="w-full border p-2" {...register('name')} />
            {errors.name && <p className="text-red-600 text-sm">{errors.name.message}</p>}
          </div>
          <div>
            <label className="block mb-1">Especie</label>
            <select className="w-full border p-2" {...register('species')} >
              {speciesList.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block mb-1">Raza</label>
            <select className="w-full border p-2" {...register('breed')} >
              {breeds[selectedSpecies || 'dog'].map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block mb-1">Sexo</label>
            <select className="w-full border p-2" {...register('sex')} >
              <option value="macho">Macho</option>
              <option value="hembra">Hembra</option>
              <option value="otro">Otro</option>
            </select>
          </div>
          <div>
            <label className="block mb-1">Color</label>
            <input className="w-full border p-2" {...register('color')} />
          </div>
          <div>
            <label className="block mb-1">Fecha de nacimiento</label>
            <input type="date" className="w-full border p-2" {...register('birthDate')} />
          </div>
          <div>
            <label className="block mb-1">Señas particulares</label>
            <textarea className="w-full border p-2" rows="3" {...register('marks')} />
          </div>
          <div className="flex items-center space-x-2">
            <input type="checkbox" id="spayed" {...register('spayed')} />
            <label htmlFor="spayed">Esterilizado</label>
          </div>
        {/* Show microchip if available.  It is not editable from this form to avoid collisions. */}
        {petData?.microchip && (
          <div>
            <label className="block mb-1">Número de microchip</label>
            <input
              value={petData.microchip}
              className="w-full border p-2 bg-gray-100 text-gray-700 cursor-not-allowed"
              disabled
            />
          </div>
        )}

        {/* Insurance information fields */}
        <div className="mt-4">
          <h3 className="font-semibold mb-2">Información de seguro (opcional)</h3>
          <div className="mb-2">
            <label className="block mb-1">Proveedor del seguro</label>
            <input className="w-full border p-2" {...register('insuranceProvider')} />
          </div>
          <div className="mb-2">
            <label className="block mb-1">Póliza del seguro</label>
            <input className="w-full border p-2" {...register('insurancePolicy')} />
          </div>
          <div className="mb-2">
            <label className="block mb-1">Vencimiento del seguro</label>
            <input type="date" className="w-full border p-2" {...register('insuranceExpiry')} />
          </div>
        </div>

        {/* Allow contact toggle */}
        <div className="flex items-center space-x-2 mt-4">
          <input type="checkbox" id="allowContact" {...register('allowContact')} />
          <label htmlFor="allowContact">Permitir que otros tutores contacten a mi mascota</label>
        </div>
          <button type="submit" className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700">Guardar</button>
          {mutation.isSuccess && <p className="text-green-600">Guardado</p>}
        </form>
      )}
    </div>
  );
}