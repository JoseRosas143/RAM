import React, { useState } from 'react';

const DietForm = () => {
  const [species, setSpecies] = useState('perro');
  const [breed, setBreed] = useState('');
  const [age, setAge] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // TODO: invocar dietRecommendations Cloud Function
      setResult('Ejemplo de recomendación: dieta equilibrada y ejercicio diario.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto">
      <form onSubmit={handleSubmit} className="space-y-4 mb-4">
        <div>
          <label className="block mb-1">Especie</label>
          <select value={species} onChange={(e) => setSpecies(e.target.value)} className="w-full border p-2 rounded">
            <option value="perro">Perro</option>
            <option value="gato">Gato</option>
            <option value="otro">Otro</option>
          </select>
        </div>
        <div>
          <label className="block mb-1">Raza (opcional)</label>
          <input
            type="text"
            value={breed}
            onChange={(e) => setBreed(e.target.value)}
            className="w-full border p-2 rounded"
          />
        </div>
        <div>
          <label className="block mb-1">Edad (años)</label>
          <input
            type="number"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            className="w-full border p-2 rounded"
          />
        </div>
        <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded" disabled={loading}>
          {loading ? 'Obteniendo...' : 'Obtener recomendaciones'}
        </button>
      </form>
      {result && <div className="p-4 border rounded bg-gray-50">{result}</div>}
    </div>
  );
};

export default DietForm;