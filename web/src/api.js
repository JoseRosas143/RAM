import { auth, db, storage, callCreateCheckoutSession, callVetChat, callDietRecommendations } from './firebase'
import { collection, addDoc, query, where, getDocs, doc, updateDoc, getDoc } from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import QRCode from 'qrcode'

const BASE_URL = import.meta.env.VITE_PUBLIC_BASE_URL || window.location.origin

export async function addPet({ name, species, microchip }) {
  const uid = auth.currentUser?.uid
  if (!uid) throw new Error('No auth')
  const pets = collection(db, 'pets')
  const docRef = await addDoc(pets, {
    ownerId: uid,
    name, species, microchip,
    photoUrl: '',
    lost: false,
    createdAt: Date.now()
  })
  return docRef.id
}

export async function listMyPets() {
  const uid = auth.currentUser?.uid
  if (!uid) return []
  const pets = collection(db, 'pets')
  const q = query(pets, where('ownerId', '==', uid))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export async function uploadPetPhoto(petId, file) {
  const uid = auth.currentUser?.uid
  if (!uid) throw new Error('No auth')

  const storageRef = ref(storage, `pets/${uid}/${petId}-${file.name}`)
  await uploadBytes(storageRef, file)
  const url = await getDownloadURL(storageRef)

  await updateDoc(doc(db, 'pets', petId), { photoUrl: url })
  return url
}

export function publicPetUrl(petId) {
  return `/p/${petId}`
}

export async function generateQrDataUrl(petId) {
  const full = `${BASE_URL}${publicPetUrl(petId)}`
  return QRCode.toDataURL(full, { width: 512 })
}

export async function toggleLost(petId, lost) {
  await updateDoc(doc(db, 'pets', petId), { lost })
  // Si marcamos perdido, opcional: ping a la CF de notifyLost con microchip real
  if (lost) {
    const snap = await getDoc(doc(db, 'pets', petId))
    const microchip = snap.data()?.microchip || ''
    try {
      await fetch(`https://us-central1-${import.meta.env.VITE_FIREBASE_PROJECT_ID}.cloudfunctions.net/notifyLost`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ microchip, ua: navigator.userAgent })
      })
    } catch (e) { /* no-op */ }
  }
}

// Stripe
export async function startCheckout(priceId) {
  const successUrl = `${BASE_URL}/success`
  const cancelUrl  = `${BASE_URL}/cancel`
  const { data } = await callCreateCheckoutSession({ priceId, successUrl, cancelUrl })
  if (data?.url) window.location.href = data.url
  return data
}

// Vet IA
export async function vetAsk(message) {
  const { data } = await callVetChat({ message })
  return data
}

// Dieta
export async function getDiet({ species, breed, age }) {
  const { data } = await callDietRecommendations({ species, breed, age })
  return data
}