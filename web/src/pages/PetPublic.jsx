import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { db } from '../firebase'
import { doc, getDoc } from 'firebase/firestore'

export default function PetPublic() {
  const { petId } = useParams()
  const [pet, setPet] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    (async () => {
      const snap = await getDoc(doc(db, 'pets', petId))
      if (snap.exists()) setPet({ id: snap.id, ...snap.data() })
      setLoading(false)
    })()
  }, [petId])

  if (loading) return <div style={{padding:24}}>Cargando…</div>
  if (!pet) return <div style={{padding:24}}>Mascota no encontrada.</div>

  return (
    <div style={{padding:24, color:'#eee'}}>
      <h1>{pet.name}</h1>
      {pet.photoUrl && <img src={pet.photoUrl} alt="" style={{width:240, borderRadius:12}}/>}
      <p>Especie: {pet.species}</p>
      <p>Estado: {pet.lost ? '🚨 Reportada como perdida' : '✔️ En casa'}</p>

      {/** Puedes guardar en el doc del usuario teléfono o email para mostrar aquí */}
      <p>Si encontraste a {pet.name}, por favor contacta al dueño mediante la plataforma.</p>

      <p style={{marginTop:16}}>
        <Link to="/">Ir a RegistroAnimalMX</Link>
      </p>
    </div>
  )
}