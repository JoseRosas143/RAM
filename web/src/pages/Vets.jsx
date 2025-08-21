import React, { useEffect, useState } from 'react'
import { db } from '../firebase'
import { collection, getDocs } from 'firebase/firestore'
import { Loader } from '@googlemaps/js-api-loader'

export default function Vets() {
  const [items, setItems] = useState([])
  const [map, setMap] = useState(null)

  useEffect(() => {
    (async () => {
      const snap = await getDocs(collection(db, 'clinics'))
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      setItems(list)

      // Carga Maps
      const loader = new Loader({
        apiKey: import.meta.env.VITE_GMAPS_API_KEY,
        version: 'weekly'
      })
      const { Map } = await loader.importLibrary('maps')
      const ele = document.getElementById('map')
      const center = { lat: 19.4326, lng: -99.1332 } // CDMX
      const m = new Map(ele, { center, zoom: 10 })
      setMap(m)
    })()
  }, [])

  useEffect(() => {
    if (!map) return
    ;(async () => {
      const { AdvancedMarkerElement } = await (new Loader({
        apiKey: import.meta.env.VITE_GMAPS_API_KEY,
        version: 'weekly'
      })).importLibrary('marker')

      items.forEach(c => {
        if (typeof c.lat === 'number' && typeof c.lng === 'number') {
          new AdvancedMarkerElement({
            map,
            position: { lat: c.lat, lng: c.lng },
            title: c.name || 'Clínica'
          })
        }
      })
    })()
  }, [map, items])

  return (
    <div style={{padding:24, color:'#eee'}}>
      <h1>Directorio de veterinarias</h1>
      <div id="map" style={{width:'100%', height:400, borderRadius:12, background:'#111', margin:'12px 0'}} />
      <ul>
        {items.map(c => (
          <li key={c.id} style={{marginBottom:8}}>
            <strong>{c.name}</strong> · {c.phone || ''} · {c.address || ''}
          </li>
        ))}
        {items.length===0 && <li>No hay clínicas cargadas aún.</li>}
      </ul>
    </div>
  )
}