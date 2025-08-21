import { useEffect, useState } from 'react';
import { useTranslation } from '../translation';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase.js';
import { useQuery } from '@tanstack/react-query';

/**
 * Directorio de veterinarias.  Esta página obtiene la lista de clínicas
 * registradas en Firestore y permite filtrarlas por estado y ciudad.  Si
 * existe una Google Maps API Key en el documento de configuración
 * `settings/app` bajo el campo `gmapsApiKey`, la página cargará la
 * biblioteca de Maps para visualizar un mapa con marcadores.  También
 * ofrece un botón para ordenar las clínicas por proximidad usando la
 * ubicación del usuario.
 */
export default function VetsPage() {
  const { t } = useTranslation();
  const [userLoc, setUserLoc] = useState(null);
  const [filterState, setFilterState] = useState('');
  const [filterCity, setFilterCity] = useState('');
  const [mapLoaded, setMapLoaded] = useState(false);

  // Determine which API key to use outside of useEffect for rendering
  const apiKey = (settings && settings.gmapsApiKey) || import.meta.env.VITE_GMAPS_API_KEY;

  // Load clinics from Firestore
  const { data: clinics, isLoading: clinicsLoading } = useQuery(['clinics'], async () => {
    const snap = await getDocs(collection(db, 'clinics'));
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  });

  // Load app settings to get gmapsApiKey
  const { data: settings } = useQuery(['settings'], async () => {
    const docRef = doc(db, 'settings', 'app');
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? docSnap.data() : {};
  });

  // Once we have a gmaps key and clinics, load the Maps script and create map
  useEffect(() => {
    // Determine which API key to use: preference for Firestore settings, fallback to env
    const apiKey = settings?.gmapsApiKey || import.meta.env.VITE_GMAPS_API_KEY;
    if (!apiKey || mapLoaded || !clinics || clinics.length === 0) return;
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initMap`;
    script.async = true;
    // Callback executed by Maps JS API when loaded
    window.initMap = () => {
      const first = clinics.find((c) => c.lat && c.lng) || { lat: 19.4326, lng: -99.1332 };
      const map = new google.maps.Map(document.getElementById('map'), {
        zoom: 5,
        center: { lat: Number(first.lat), lng: Number(first.lng) }
      });
      clinics.forEach((c) => {
        if (c.lat && c.lng) {
          new google.maps.Marker({
            position: { lat: Number(c.lat), lng: Number(c.lng) },
            map,
            title: c.name
          });
        }
      });
    };
    document.body.appendChild(script);
    setMapLoaded(true);
    return () => {
      script.remove();
      delete window.initMap;
    };
  }, [settings, clinics, mapLoaded]);

  // Handler to fetch user's location and sort clinics
  const handleNearMe = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setUserLoc({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      });
    }
  };

  // Filter clinics by state/city
  const filteredClinics = clinics
    ? clinics.filter((c) => {
        const stateMatch = filterState ? c.state?.toLowerCase().includes(filterState.toLowerCase()) : true;
        const cityMatch = filterCity ? c.city?.toLowerCase().includes(filterCity.toLowerCase()) : true;
        return stateMatch && cityMatch;
      })
    : [];

  // Sort clinics by distance if user location is available
  const sortedClinics = filteredClinics.slice().sort((a, b) => {
    if (!userLoc) return 0;
    const distA = haversineDistance(userLoc.lat, userLoc.lng, a.lat, a.lng);
    const distB = haversineDistance(userLoc.lat, userLoc.lng, b.lat, b.lng);
    return distA - distB;
  });

  return (
    <main className="p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
        <h1 className="text-2xl font-bold">{t('vets.title')}</h1>
        {/* Link to clinic registration page */}
        <a
          href="/register-vet"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-center"
        >
          {t('vets.registerCTA')}
        </a>
      </div>
      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <input
          value={filterState}
          onChange={(e) => setFilterState(e.target.value)}
          placeholder={t('vets.statePlaceholder')}
          className="border p-2 flex-1"
        />
        <input
          value={filterCity}
          onChange={(e) => setFilterCity(e.target.value)}
          placeholder={t('vets.cityPlaceholder')}
          className="border p-2 flex-1"
        />
        <button
          onClick={handleNearMe}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          {t('vets.nearMe')}
        </button>
      </div>
      {apiKey ? (
        <div id="map" className="w-full h-80 mb-4 border rounded" />
      ) : (
        <div className="mb-4 p-4 border rounded">
          <p>Google Maps no disponible. Configura una API Key en la colección settings/app o en las variables de entorno para habilitar el mapa.</p>
        </div>
      )}
      {clinicsLoading ? (
        <p>{t('vets.loading')}</p>
      ) : sortedClinics.length > 0 ? (
        <ul className="space-y-2">
          {sortedClinics.map((clinic) => {
            // Compute distance if user location is available
            const dist = userLoc
              ? haversineDistance(userLoc.lat, userLoc.lng, clinic.lat, clinic.lng).toFixed(1)
              : null;
            return (
              <li
                key={clinic.id}
                className="p-4 border rounded hover:bg-gray-50 flex flex-col sm:flex-row sm:justify-between sm:items-center"
              >
                <div>
                  <h2 className="font-semibold text-lg">{clinic.name}</h2>
                  <p className="text-sm text-gray-600">{clinic.city}, {clinic.state}</p>
                  {dist && <p className="text-xs text-gray-500">{t('vets.distance', { distance: dist })}</p>}
                </div>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${clinic.lat},${clinic.lng}`}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 sm:mt-0 text-blue-600 underline"
                >
                  Ver mapa
                </a>
              </li>
            );
          })}
        </ul>
      ) : (
        <p>{t('vets.noClinics')}</p>
      )}
    </main>
  );
}

/**
 * Compute the distance between two geographic coordinates using the
 * Haversine formula.  Returns the distance in kilometers.  If any
 * coordinate is missing, returns Infinity to push the entry to the end
 * when sorting.
 */
function haversineDistance(lat1, lon1, lat2, lon2) {
  if (
    lat1 === undefined ||
    lon1 === undefined ||
    lat2 === undefined ||
    lon2 === undefined
  ) {
    return Infinity;
  }
  function toRad(deg) {
    return (deg * Math.PI) / 180;
  }
  const R = 6371; // Earth radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}