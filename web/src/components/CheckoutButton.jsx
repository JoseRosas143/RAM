import React from 'react'
import { callCreateCheckoutSession } from '../firebase'

export default function CheckoutButton({ priceId, mode = 'subscription' }) {
  async function go() {
    const successUrl = import.meta.env.VITE_STRIPE_SUCCESS_URL
    const cancelUrl = import.meta.env.VITE_STRIPE_CANCEL_URL
    const { data } = await callCreateCheckoutSession({ priceId, mode, successUrl, cancelUrl, quantity: 1 })
    window.location.href = data.url
  }
  return <button onClick={go}>Activar Premium</button>
}