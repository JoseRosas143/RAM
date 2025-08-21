// src/pages/Home.jsx
import React from 'react'
import { Link } from 'react-router-dom'
import { loginWithGoogle } from '../firebase'

export default function Home() {
  return (
    <div style={{padding: 24, color: '#eee'}}>
      <h1 style={{fontSize: 36, marginBottom: 8}}>🐾 RegistroAnimalMX</h1>
      <p>Identificación, rescate y salud de mascotas en un solo lugar.</p>

      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginTop:24}}>
        <div style={{background:'#111', padding:16, borderRadius:12}}>
          <h3>Registro y QR</h3>
          <p>Genera un QR público para ayudar a que tu mascota vuelva a casa.</p>
        </div>
        <div style={{background:'#111', padding:16, borderRadius:12}}>
          <h3>Modo perdido</h3>
          <p>Activa alertas y registra reportes de avistamientos.</p>
        </div>
        <div style={{background:'#111', padding:16, borderRadius:12}}>
          <h3>Directorio de veterinarias</h3>
          <p>Encuentra clínicas cercanas en el mapa.</p>
        </div>
        <div style={{background:'#111', padding:16, borderRadius:12}}>
          <h3>Funciones Premium</h3>
          <p>Vet IA y recomendaciones de dieta personalizadas.</p>
        </div>
      </div>

      <div style={{marginTop:24, display:'flex', gap:12}}>
        <button onClick={loginWithGoogle}>Ingresar / Registrarme</button>
        <Link to="/dashboard">Ir al dashboard</Link>
      </div>
    </div>
  )
}