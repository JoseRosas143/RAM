import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { nanoid } from 'nanoid';
import { useEffect, useState } from 'react';
import { db, auth, storage } from '../../firebase.js';

export default function DocumentsPage() {
  const queryClient = useQueryClient();
  const [petId, setPetId] = useState(null);

  useEffect(() => {
    const unsub = auth.onAuthStateChanged((user) => {
      if (user) setPetId(user.uid);
    });
    return unsub;
  }, []);

  const { data: docs = [], isLoading } = useQuery(['docs', petId], async () => {
    if (!petId) return [];
    const refDoc = doc(db, 'pets', petId);
    const snap = await getDoc(refDoc);
    return snap.data()?.docs || [];
  }, { enabled: !!petId });

  const mutation = useMutation(async (file) => {
    const fileId = nanoid();
    const storageRef = ref(storage, `pets/${petId}/docs/${fileId}-${file.name}`);
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);
    const refDoc = doc(db, 'pets', petId);
    const snap = await getDoc(refDoc);
    const currentDocs = snap.data()?.docs || [];
    currentDocs.push({ id: fileId, name: file.name, url, type: file.type, uploadedAt: Date.now() });
    await updateDoc(refDoc, { docs: currentDocs });
  }, {
    onSuccess: () => queryClient.invalidateQueries(['docs', petId])
  });

  const removeDoc = useMutation(async (docId) => {
    const refDoc = doc(db, 'pets', petId);
    const snap = await getDoc(refDoc);
    const currentDocs = snap.data()?.docs || [];
    const toDelete = currentDocs.find((d) => d.id === docId);
    if (toDelete) {
      // Delete file from storage
      const fileRef = ref(storage, toDelete.url);
      await deleteObject(fileRef).catch(() => {});
    }
    const updated = currentDocs.filter((d) => d.id !== docId);
    await updateDoc(refDoc, { docs: updated });
  }, {
    onSuccess: () => queryClient.invalidateQueries(['docs', petId])
  });

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      mutation.mutate(file);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Documentos</h2>
      {isLoading ? <p>Cargando…</p> : (
        <>
          <ul className="space-y-2">
            {docs.map((d) => (
              <li key={d.id} className="flex items-center justify-between">
                <a href={d.url} target="_blank" rel="noopener" className="text-blue-600 underline">{d.name}</a>
                <button onClick={() => removeDoc.mutate(d.id)} className="text-red-600">Eliminar</button>
              </li>
            ))}
            {docs.length === 0 && <li>No hay documentos</li>}
          </ul>
          <input type="file" onChange={handleFileChange} />
        </>
      )}
    </div>
  );
}