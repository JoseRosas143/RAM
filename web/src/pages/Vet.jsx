import React, { useState } from 'react'
import { AuthGate } from '../AuthGate'
import { vetAsk } from '../api'

export default function Vet() {
  return (
    <AuthGate>
      <Inner />
    </AuthGate>
  )
}

function Inner() {
  const [q, setQ] = useState('')
  const [a, setA] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function send() {
    setLoading(true); setError(''); setA('')
    try {
      const res = await vetAsk(q)
      setA(res.reply || '(sin respuesta)')
    } catch (e) {
      // Cuando no es premium, CF devuelve permission-denied
      setError('Necesitas Premium para usar Vet IA.')
    } finally { setLoading(false) }
  }

  return (
    <div style={{padding:24, color:'#eee'}}>
      <h1>Vet IA</h1>
      <textarea rows="4" value={q} onChange={e=>setQ(e.target.value)} placeholder="Describe el problema…" style={{width:'100%', maxWidth:600}}/>
      <div style={{marginTop:8}}>
        <button onClick={send} disabled={loading}>{loading?'Consultando…':'Preguntar'}</button>
      </div>
      {error && <div style={{marginTop:12, color:'#f77'}}>{error}</div>}
      {a && <div style={{marginTop:12, whiteSpace:'pre-wrap'}}>{a}</div>}
    </div>
  )
}