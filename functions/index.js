/* functions/index.js */
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const corsMW = require("cors")({ origin: true });
const Stripe = require("stripe");

try { admin.initializeApp(); } catch (_) {}
const db = admin.firestore();

// --- Config ---
const STRIPE_SECRET          = functions.config().stripe?.secret           || null;
const STRIPE_WEBHOOK_SECRET  = functions.config().stripe?.webhook_secret   || null;
const PREMIUM_PRICE_ID       = functions.config().stripe?.premium_price_id || null;
const OPENAI_KEY             = functions.config().openai?.key              || null;

// --- Stripe ---
const stripe = STRIPE_SECRET ? new Stripe(STRIPE_SECRET) : null;

// --- OpenAI (opcional) ---
let openai = null;
if (OPENAI_KEY) {
  const OpenAI = require("openai");
  openai = new OpenAI({ apiKey: OPENAI_KEY });
}

// --- Helpers ---
const https = require("https");
function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = "";
      res.on("data", (c) => (data += c));
      res.on("end", () => { try { resolve(JSON.parse(data)); } catch (e) { reject(e); } });
    }).on("error", reject);
  });
}

// Middleware: valida ID token de Firebase en endpoints HTTP
async function authenticate(req, res) {
  const h = req.headers.authorization || "";
  if (!h.startsWith("Bearer ")) {
    res.status(401).send("Missing Authorization Bearer token");
    return null;
  }
  const idToken = h.substring(7);
  try {
    const decoded = await admin.auth().verifyIdToken(idToken);
    return decoded; // { uid, ... }
  } catch (e) {
    console.error("verifyIdToken error", e);
    res.status(401).send("Invalid token");
    return null;
  }
}

// ===== HEALTH (público) =====
exports.health = functions.https.onRequest((_, res) => {
  res.json({ ok: true, ts: Date.now() });
});

// ===== generateQr (callable, ya requiere auth via SDK) =====
exports.generateQr = functions.https.onCall(async () => {
  return { message: "QR generado (placeholder)" };
});

// ===== onWaClick (HTTP + requiere auth) =====
exports.onWaClick = functions.https.onRequest(async (req, res) => {
  corsMW(req, res, async () => {
    const user = await authenticate(req, res);
    if (!user) return;

    // Ejemplo de logging mínimo
    try {
      await db.collection("wa_clicks").add({
        uid: user.uid,
        ua: req.headers["user-agent"] || "",
        at: admin.firestore.FieldValue.serverTimestamp(),
      });
    } catch (e) {
      console.error("onWaClick log error", e);
    }
    res.json({ status: "ok" });
  });
});

// ===== createCheckoutSession (callable, ya valida auth por SDK) =====
exports.createCheckoutSession = functions.https.onCall(async (data, context) => {
  if (!stripe) throw new functions.https.HttpsError("failed-precondition", "Stripe no configurado");
  if (!context.auth) throw new functions.https.HttpsError("unauthenticated", "Debe iniciar sesión");

  const { priceId, quantity = 1, mode = "payment", successUrl, cancelUrl } = data;
  if (!priceId || !successUrl || !cancelUrl)
    throw new functions.https.HttpsError("invalid-argument", "Faltan parámetros");

  const session = await stripe.checkout.sessions.create({
    mode,
    payment_method_types: ["card"],
    line_items: [{ price: priceId, quantity }],
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: { uid: context.auth.uid },
  });
  return { url: session.url };
});

// ===== stripeWebhook (público, pero protegido por firma) =====
exports.stripeWebhook = functions.https.onRequest(async (req, res) => {
  // ¡IMPORTANTE! Debe recibir el raw body (en Firebase 1st gen es por defecto).
  if (!STRIPE_WEBHOOK_SECRET || !stripe) return res.status(500).send("Stripe no configurado");

  const sig = req.headers["stripe-signature"];
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.rawBody, sig, STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error("stripeWebhook signature error", err);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const uid = session.metadata?.uid;
    // Mejor fuente del priceId:
    const lineItems = session.line_items || session.display_items || [];
    const purchasedPriceId =
      lineItems[0]?.price?.id || session?.metadata?.priceId || null;

    try {
      if (uid && purchasedPriceId && PREMIUM_PRICE_ID && purchasedPriceId === PREMIUM_PRICE_ID) {
        await db.collection("users").doc(uid).set({ plan: "premium" }, { merge: true });
      }
    } catch (e) {
      console.error("stripeWebhook DB error", e);
    }
  }
  res.json({ received: true });
});

// ===== vetChat (callable) =====
exports.vetChat = functions.https.onCall(async (data, context) => {
  if (!openai) throw new functions.https.HttpsError("failed-precondition", "IA no configurada");
  if (!context.auth) throw new functions.https.HttpsError("unauthenticated", "Inicie sesión");

  const userDoc = await db.collection("users").doc(context.auth.uid).get();
  if (!userDoc.exists || userDoc.data().plan !== "premium")
    throw new functions.https.HttpsError("permission-denied", "Solo usuarios premium");

  const prompt = data.message || "Consejo general de salud para mascotas";
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: "Eres un veterinario virtual. Responde en español con consejos prudentes." },
      { role: "user", content: prompt },
    ],
    temperature: 0.3,
  });
  return { reply: completion.choices[0].message.content };
});

// ===== dietRecommendations (callable) =====
exports.dietRecommendations = functions.https.onCall(async (data, context) => {
  if (!openai) throw new functions.https.HttpsError("failed-precondition", "IA no configurada");
  if (!context.auth) throw new functions.https.HttpsError("unauthenticated", "Inicie sesión");

  const userDoc = await db.collection("users").doc(context.auth.uid).get();
  if (!userDoc.exists || userDoc.data().plan !== "premium")
    throw new functions.https.HttpsError("permission-denied", "Solo usuarios premium");

  const { species = "perro", breed = "mestizo", age = "3" } = data;
  const prompt = `Recomiéndame dieta, ejercicio y cuidados para un ${species} de raza ${breed} y ${age} años.`;
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: "Eres un nutricionista de mascotas. Responde en español." },
      { role: "user", content: prompt },
    ],
    temperature: 0.4,
  });
  return { recommendations: completion.choices[0].message.content };
});

// ===== notifyLost (HTTP + requiere auth) =====
exports.notifyLost = functions.https.onRequest(async (req, res) => {
  corsMW(req, res, async () => {
    const user = await authenticate(req, res);
    if (!user) return;

    try {
      const { microchip, ua } = req.body || {};
      if (!microchip) return res.status(400).send("microchip missing");

      // localiza la mascota por microchip y marca perdida
      const snap = await db.collection("pets").where("microchip", "==", microchip).limit(1).get();
      if (snap.empty) return res.status(404).send("pet not found");

      const petRef = snap.docs[0].ref;
      await petRef.set(
        { lost: true, lastLostAt: admin.firestore.FieldValue.serverTimestamp(), lastLostBy: user.uid },
        { merge: true }
      );

      const reportRef = await petRef.collection("lostReports").add({
        by: user.uid,
        at: admin.firestore.FieldValue.serverTimestamp(),
        ip: req.ip || "",
        ua: ua || req.headers["user-agent"] || "",
      });

      // Geo IP (best effort)
      try {
        const ip = (req.ip || "").replace(/^::ffff:/, "");
        if (ip && ip !== "::1" && ip !== "127.0.0.1") {
          const loc = await fetchJson(`http://ip-api.com/json/${ip}`);
          if (loc?.status === "success") await reportRef.update({ location: loc });
        }
      } catch (e) { console.error("GeoIP error", e); }

      res.json({ status: "marked-lost" });
    } catch (err) {
      console.error(err);
      res.status(500).send("error");
    }
  });
});
