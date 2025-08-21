import React, { useState } from 'react'
import { AuthGate } from '../AuthGate'
import { getDiet } from '../api'

export default function Diet() {
  return (
    <AuthGate>
      <Inner />
    </AuthGate>
  )
}

function Inner() {
  const [species, setSpecies] = useState('perro')
  const [breed, setBreed] = useState('')
  const [age, setAge] = useState('3')
  const [out, setOut] = useState('')
  const [error, setError] = useState('')

  async function run() {
    setOut(''); setError('')
    try {
      const res = await getDiet({ species, breed, age })
      setOut(res.recommendations || '')
    } catch {
      setError('Necesitas Premium para esta función.')
    }
  }

  return (
    <div style={{padding:24, color:'#eee'}}>
      <h1>Dieta</h1>
      <div style={{display:'grid', gap:8, maxWidth:480}}>
        <select value={species} onChange={e=>setSpecies(e.target.value)}>
          <option value="perro">Perro</option>
          <option value="gato">Gato</option>
        </select>
        <input placeholder="Raza (opcional)" value={breed} onChange={e=>setBreed(e.target.value)} />
        <input type="number" placeholder="Edad (años)" value={age} onChange={e=>setAge(e.target.value)} />
        <button onClick={run}>Generar recomendaciones</button>
      </div>
      {error && <div style={{marginTop:12, color:'#f77'}}>{error}</div>}
      {out && <pre style={{whiteSpace:'pre-wrap', marginTop:12}}>{out}</pre>}
    </div>
  )
}