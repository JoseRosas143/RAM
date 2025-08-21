# RegistroAnimalMX

Este repositorio contiene el código base para **registroanimalmx**, una aplicación web completa para el registro y rescate de mascotas, construida con **React + Vite**, **Firebase** y **Stripe**.  Incluye funcionalidades de gestión de mascotas, directorio de veterinarias, generación de códigos QR, panel de administración, recordatorios de vacunas, tienda de plaquitas y un área premium con servicios de inteligencia artificial.

## Estructura del repositorio

- `web/` – Frontend desarrollado con React, Vite y TailwindCSS.
  - `src/` contiene las páginas y componentes de la aplicación.
  - `pages/` incluye la landing page, dashboard, directorio de veterinarias y la sección premium.
  - `pages/premium/` agrupa los componentes del plan premium: chatbot, formulario de recomendaciones y árbol genealógico.
- `functions/` – Backend con Cloud Functions (Node.js).  Aquí se encuentran las funciones para generar QR, registrar clics de WhatsApp, crear sesiones de checkout en Stripe, webhook de Stripe y llamadas a la API de OpenAI.
- `premium_feature.md` – Documento detallado que describe el diseño de la sección premium y cómo integrarla con Stripe y OpenAI.

## Instalación

1. **Clonar el repositorio**

   ```bash
   git clone <url-del-repositorio>
   cd registroanimalmx
   ```

2. **Configurar el frontend**

   ```bash
   cd web
   npm install
   npm run dev # Inicia el servidor de Vite en desarrollo
   ```

3. **Configurar las funciones**

   ```bash
   cd functions
   npm install
   ```

4. **Inicializar Firebase**

   Ejecuta `firebase init` en la raíz del proyecto y selecciona Hosting, Firestore, Functions, Storage y Emulators.  Asegúrate de apuntar a las carpetas `web` para hosting y `functions` para las Cloud Functions.

5. **Variables de entorno**

   Crea un archivo `.env` en `web/` con el siguiente contenido (rellena los valores reales):

   ```env
   VITE_FIREBASE_API_KEY=<tu-api-key>
   VITE_FIREBASE_AUTH_DOMAIN=<tu-auth-domain>
   VITE_FIREBASE_PROJECT_ID=<tu-project-id>
   VITE_FIREBASE_STORAGE_BUCKET=<tu-storage-bucket>
   VITE_FIREBASE_MESSAGING_SENDER_ID=<tu-sender-id>
   VITE_FIREBASE_APP_ID=<tu-app-id>
   VITE_FIREBASE_MEASUREMENT_ID=<tu-measurement-id>
   VITE_STRIPE_PUBLISHABLE_KEY=<pk_test_o_pk_live>
   VITE_MAPS_API_KEY=<opcional-si-usar-google-maps>
   ```

   Para las funciones, configura los secretos mediante:

   ```bash
   firebase functions:config:set stripe.secret="sk_test_o_sk_live" stripe.webhook_secret="whsec_..." openai.key="sk-proj-..."
   ```

   También puedes exportar `STRIPE_PREMIUM_PRICE_ID` al entorno para la Cloud Function `stripeWebhook`.

## Uso

- **Landing Page** (`/`): página de marketing con CTA para tutores y veterinarias.
- **Dashboard** (`/app`): panel para gestionar mascotas (en desarrollo).
- **Directorio de veterinarias** (`/vets`): listado y mapa de clínicas (en desarrollo).
- **Sección Premium** (`/premium`): acceso a servicios avanzados (chatbot, recomendaciones, árbol genealógico) restringido a usuarios con suscripción premium.
- **Checkout** (`/buy`): tienda de productos (plaquitas y kits) y suscripción premium.

## Desarrollo futuro

El código es un esqueleto inicial y requiere completar funcionalidades como:

- Integración con Firebase Auth, Firestore y Storage para CRUD completo de mascotas.
- Implementar la generación real de QR en `functions/generateQr`.
- Añadir lógica de recordatorios y panel de estadísticas.
- Finalizar el directorio de veterinarias con Google Maps o iframe.
- Desarrollar el árbol genealógico interactivo.
- Conectar las Cloud Functions `vetChat` y `dietRecommendations` con la interfaz premium.

Consulta `premium_feature.md` para una especificación detallada de la sección premium y los servicios de IA.