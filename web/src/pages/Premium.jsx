import React from 'react'
import { AuthGate } from '../AuthGate'
import { startCheckout } from '../api'

const PRICE_PREMIUM = import.meta.env.VITE_STRIPE_PRICE_PREMIUM

export default function Premium() {
  return (
    <AuthGate>
      <div style={{padding:24, color:'#eee'}}>
        <h1>Premium</h1>
        <p>Desbloquea Vet IA y recomendaciones de dieta.</p>
        <button onClick={()=>startCheckout(PRICE_PREMIUM)}>Pagar suscripción Premium</button>
      </div>
    </AuthGate>
  )
}