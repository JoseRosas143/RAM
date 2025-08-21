import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../../firebase';

/**
 * Página que muestra un carnet digital de la mascota.  Resume vacunas y
 * desparasitaciones y permite imprimir o descargar como PDF.  Utiliza
 * window.print() para exportar a PDF (el usuario puede seleccionar
 * guardar como PDF).
 */
export default function Carnet() {
  const uid = auth.currentUser?.uid;

  // Fetch pet document (assume petId = uid)
  const { data: pet, isLoading } = useQuery(
    ['pet', uid],
    async () => {
      if (!uid) return null;
      const ref = doc(db, 'pets', uid);
      const snap = await getDoc(ref);
      return snap.exists() ? snap.data() : null;
    },
    { enabled: !!uid }
  );

  // Helper to format date
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('es-MX');
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Carnet digital de tu mascota</h2>
      {isLoading ? (
        <p>Cargando…</p>
      ) : !pet ? (
        <p>No se encontró mascota</p>
      ) : (
        <div className="bg-white rounded shadow p-4">
          <h3 className="font-semibold text-lg mb-2">{pet.name}</h3>
          {pet.microchip && <p className="text-sm mb-2">Microchip: {pet.microchip}</p>}
          {/* Vacunas */}
          <section className="mb-4">
            <h4 className="font-semibold mb-2">Vacunas</h4>
            {pet.vaccines?.length ? (
              <table className="w-full text-sm border">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border px-2 py-1">Nombre</th>
                    <th className="border px-2 py-1">Fecha</th>
                    <th className="border px-2 py-1">Lote</th>
                    <th className="border px-2 py-1">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {pet.vaccines.map((v) => (
                    <tr key={v.id} className="odd:bg-gray-50">
                      <td className="border px-2 py-1">{v.name}</td>
                      <td className="border px-2 py-1">{formatDate(v.date)}</td>
                      <td className="border px-2 py-1">{v.batch || ''}</td>
                      <td className="border px-2 py-1 capitalize">{v.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>No hay vacunas registradas.</p>
            )}
          </section>
          {/* Desparasitaciones */}
          <section className="mb-4">
            <h4 className="font-semibold mb-2">Desparasitaciones</h4>
            {pet.deworm?.length ? (
              <table className="w-full text-sm border">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border px-2 py-1">Producto</th>
                    <th className="border px-2 py-1">Aplicación</th>
                    <th className="border px-2 py-1">Cobertura hasta</th>
                  </tr>
                </thead>
                <tbody>
                  {pet.deworm.map((d) => (
                    <tr key={d.id} className="odd:bg-gray-50">
                      <td className="border px-2 py-1">{d.product}</td>
                      <td className="border px-2 py-1">{formatDate(d.date)}</td>
                      <td className="border px-2 py-1">{formatDate(d.coverUntil)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>No hay desparasitaciones registradas.</p>
            )}
          </section>
          <button
            onClick={() => window.print()}
            className="mt-4 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
          >
            Descargar / Imprimir carnet
          </button>
        </div>
      )}
    </div>
  );
}