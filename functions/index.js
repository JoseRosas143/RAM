const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { Configuration, OpenAIApi } = require('openai');
const Stripe = require('stripe');

admin.initializeApp();
const db = admin.firestore();

// Initialize Stripe with secret key from environment config
const stripe = Stripe(functions.config().stripe.secret);

// Initialize OpenAI with API key from environment config
const openai = new OpenAIApi(new Configuration({
  apiKey: functions.config().openai.key,
}));

// Helper: fetch JSON using node's https module (no external deps)
const https = require('https');
function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          try {
            resolve(JSON.parse(data));
          } catch (err) {
            reject(err);
          }
        });
      })
      .on('error', (err) => {
        reject(err);
      });
  });
}

/**
 * Callable function to generate QR codes (placeholder).
 */
exports.generateQr = functions.https.onCall(async (data, context) => {
  // TODO: implement QR generation and storage in Firebase Storage
  return { message: 'QR generado (placeholder)' };
});

/**
 * HTTP function to log WhatsApp clicks (placeholder).
 */
exports.onWaClick = functions.https.onRequest(async (req, res) => {
  // TODO: implement WhatsApp click logging
  res.json({ status: 'ok' });
});

/**
 * Callable function to create a Stripe Checkout Session.
 * @param data.priceId ID del precio de Stripe
 * @param data.quantity Cantidad (opcional)
 * @param data.mode payment | subscription (opcional)
 */
exports.createCheckoutSession = functions.https.onCall(async (data, context) => {
  const { priceId, quantity = 1, mode = 'payment', successUrl, cancelUrl } = data;
  const uid = context.auth?.uid;
  if (!uid) {
    throw new functions.https.HttpsError('unauthenticated', 'Debe iniciar sesión');
  }
  const session = await stripe.checkout.sessions.create({
    mode,
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity }],
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: { uid },
  });
  return { url: session.url };
});

/**
 * HTTP function to handle Stripe webhooks.
 */
exports.stripeWebhook = functions.https.onRequest(async (req, res) => {
  const endpointSecret = functions.config().stripe.webhook_secret;
  const sig = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.rawBody, sig, endpointSecret);
  } catch (err) {
    console.error(err);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  // Handle the checkout.session.completed event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const uid = session.metadata.uid;
    const priceId = session.display_items?.[0]?.price?.id || '';
    // Determine the configured premium price ID from environment or functions config
    const premiumPriceId = process.env.STRIPE_PREMIUM_PRICE_ID || functions.config().stripe.premium_price_id;
    // Si el priceId coincide con el plan premium, asigna plan premium al usuario
    if (priceId && premiumPriceId && priceId === premiumPriceId) {
      await db.collection('users').doc(uid).set({ plan: 'premium' }, { merge: true });
    }
  }
  res.json({ received: true });
});

/**
 * Callable function for veterinary chatbot using OpenAI.
 */
exports.vetChat = functions.https.onCall(async (data, context) => {
  const uid = context.auth?.uid;
  if (!uid) throw new functions.https.HttpsError('unauthenticated', 'Inicie sesión');
  const userDoc = await db.collection('users').doc(uid).get();
  if (!userDoc.exists || userDoc.data().plan !== 'premium') {
    throw new functions.https.HttpsError('permission-denied', 'Solo usuarios premium');
  }
  const { message } = data;
  const completion = await openai.createChatCompletion({
    model: 'gpt-4-turbo',
    messages: [
      { role: 'system', content: 'Eres un asistente veterinario virtual. Responde en español.' },
      { role: 'user', content: message },
    ],
  });
  return { reply: completion.data.choices[0].message.content };
});

/**
 * Callable function to provide diet and exercise recommendations.
 */
exports.dietRecommendations = functions.https.onCall(async (data, context) => {
  const uid = context.auth?.uid;
  if (!uid) throw new functions.https.HttpsError('unauthenticated', 'Inicie sesión');
  const userDoc = await db.collection('users').doc(uid).get();
  if (!userDoc.exists || userDoc.data().plan !== 'premium') {
    throw new functions.https.HttpsError('permission-denied', 'Solo usuarios premium');
  }
  const { species, breed, age } = data;
  const prompt = `Escribe recomendaciones de alimentación, ejercicio y cuidados para un ${species} de raza ${breed || 'desconocida'} y edad ${age} años.`;
  const completion = await openai.createChatCompletion({
    model: 'gpt-4-turbo',
    messages: [
      { role: 'system', content: 'Eres un nutricionista de mascotas experto. Responde en español.' },
      { role: 'user', content: prompt },
    ],
  });
  return { recommendations: completion.data.choices[0].message.content };
});

/**
 * HTTP function to mark a pet as lost and notify nearby clinics/tutors (placeholder).
 * Expects { microchip, ua } in the request body.  Looks up the pet by microchip,
 * sets the `lost` flag to true and stores a timestamp.  In una versión
 * futura se podrían enviar notificaciones push o correos a las clínicas y
 * tutores cercanos.
 */
exports.notifyLost = functions.https.onRequest(async (req, res) => {
  try {
    // Support both JSON and URL-encoded bodies
    const body = req.body || {};
    const microchip = body.microchip;
    if (!microchip) {
      return res.status(400).send('microchip missing');
    }
    // Find pet by microchip
    const snap = await db.collection('pets').where('microchip', '==', microchip).get();
    if (snap.empty) {
      return res.status(404).send('pet not found');
    }
    const petRef = snap.docs[0].ref;
    await petRef.set(
      {
        lost: true,
        lastLostAt: admin.firestore.FieldValue.serverTimestamp()
      },
      { merge: true }
    );
    // Log the lost report (this could be extended to notify clinics)
    // Create lost report
    const reportRef = await petRef.collection('lostReports').add({
      at: admin.firestore.FieldValue.serverTimestamp(),
      ip: req.ip || '',
      ua: body.ua || '',
    });
    // Attempt to geolocate IP using external service (ip-api.com)
    try {
      const ip = (req.ip || '').replace(/^::ffff:/, '');
      if (ip && ip !== '::1' && ip !== '127.0.0.1') {
        const loc = await fetchJson(`http://ip-api.com/json/${ip}`);
        if (loc && loc.status === 'success') {
          await reportRef.update({
            location: {
              lat: loc.lat,
              lng: loc.lon,
              city: loc.city,
              region: loc.regionName,
              country: loc.country,
            },
          });
        }
      }
    } catch (geoErr) {
      console.error('IP geolocation failed', geoErr);
    }
    try {
      // Send alerts to nearby clinics and tutors (naive implementation)
      const petDoc = await petRef.get();
      const petData = petDoc.data();
      const lastLocation = petData.lastLocation;
      // Fetch clinics
      const clinicsSnapshot = await db.collection('clinics').get();
      clinicsSnapshot.forEach(async (clinicDoc) => {
        const clinicData = clinicDoc.data();
        // Simple filter: same state or within 50km if location available
        let include = false;
        if (lastLocation && clinicData.lat && clinicData.lng) {
          const distKm = haversine(
            lastLocation.lat,
            lastLocation.lng,
            clinicData.lat,
            clinicData.lng
          );
          if (distKm <= 50) include = true;
        }
        if (include) {
          // Write alert document (could be used by another service to send notifications)
          await db.collection('lostAlerts').add({
            type: 'clinic',
            clinicId: clinicDoc.id,
            microchip,
            at: admin.firestore.FieldValue.serverTimestamp(),
          });
        }
      });
      // Fetch tutors (users) to alert (excluding owner)
      const usersSnapshot = await db.collection('users').where('notify', '==', true).get();
      usersSnapshot.forEach(async (userDoc) => {
        if (userDoc.id !== petData.ownerId) {
          await db.collection('lostAlerts').add({
            type: 'user',
            userId: userDoc.id,
            microchip,
            at: admin.firestore.FieldValue.serverTimestamp(),
          });
        }
      });
    } catch (alertErr) {
      console.error('Error sending alerts', alertErr);
    }
    return res.json({ status: 'marked-lost' });
  } catch (err) {
    console.error(err);
    return res.status(500).send('error');
  }
});

/**
 * Calcula la distancia Haversine entre dos puntos en kilómetros.
 */
function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radio de la Tierra
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
function deg2rad(deg) {
  return deg * (Math.PI / 180);
}