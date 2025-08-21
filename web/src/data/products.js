/**
 * Define the available products for sale on the shop page.  Each
 * product references a Stripe Price ID defined in environment
 * variables.  If a price ID is missing the product will not be
 * displayed.
 */
const products = [
  {
    id: 'kit-basico',
    name: 'Kit básico',
    description: 'Plaquita QR y carnet digital para tu mascota.',
    priceId: import.meta.env.VITE_STRIPE_PRICE_KIT_BASICO,
    mode: 'payment'
  },
  {
    id: 'microchip',
    name: 'Lector de microchip',
    description: 'Lector portátil compatible con ISO para identificar mascotas.',
    priceId: import.meta.env.VITE_STRIPE_PRICE_MICROCHIP,
    mode: 'payment'
  },
  {
    id: 'kit-completo',
    name: 'Kit completo',
    description: 'Plaquita QR, carnet digital y lector de microchip.',
    priceId: import.meta.env.VITE_STRIPE_PRICE_KIT_COMPLETO,
    mode: 'payment'
  },
  // You can add additional products such as a smart plaque (placa inteligente)
  {
    id: 'placa-inteligente',
    name: 'Placa inteligente QR y NFC',
    description: 'Placa para collar con código QR y chip NFC integrado.',
    priceId: import.meta.env.VITE_STRIPE_PRICE_PLAQUITA,
    mode: 'payment'
  }
];

export default products;