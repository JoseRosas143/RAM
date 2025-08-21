export default function Vets() {
  const apiKey = import.meta.env.VITE_GMAPS_API_KEY;
  const hasKey = Boolean(apiKey);
  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-3">Directorio de veterinarias</h2>
      {hasKey ? (
        <div id="map" className="h-[420px] w-full border rounded flex items-center justify-center">
          (Aquí va Google Maps JS con tu API Key)
        </div>
      ) : (
        <iframe
          title="map-fallback"
          className="w-full h-[420px] border rounded"
          src="https://maps.google.com/maps?q=México&t=&z=5&ie=UTF8&iwloc=&output=embed"
        />
      )}
    </div>
  );
}
