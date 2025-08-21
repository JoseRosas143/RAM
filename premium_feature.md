# Página Premium y Suscripción con OpenAI para RegistroAnimalMX

Este documento describe el diseño y la implementación propuesta para una página de **acceso premium** en la aplicación **registroanimalmx**.  La página ofrecerá tres servicios de inteligencia artificial para los tutores de mascotas a cambio de una suscripción de pago gestionada con **Stripe**.

## 1. Descripción general de la página premium

La página premium está dirigida a usuarios que desean acceder a herramientas avanzadas de cuidado de mascotas.  Para acceder a ella se requerirá una suscripción activa (plan “premium”) con el **Price ID** `price_1RyNShCQpOtx3yYSRxQ8UkQq`.  Los usuarios suscritos verán las siguientes secciones:

1. **Chatbot veterinario** (IA de OpenAI): permite consultas generales de salud y bienestar de mascotas.  Utiliza la API de OpenAI para responder preguntas en español.  Debe dejar claro que no sustituye la asesoría veterinaria profesional.
2. **Recomendaciones de dieta y ejercicio**: un formulario donde el usuario introduce la especie (perro/gato/otros), raza y edad.  El sistema genera recomendaciones sobre alimentación, ejercicio y cuidados especiales según la entrada.  También utiliza la API de OpenAI para generar respuestas personalizadas.
3. **Árbol genealógico**: herramienta interactiva para construir y visualizar el árbol familiar de una mascota.  Permite subir fotos y enlazar a perfiles de otras mascotas registradas.  Puede almacenarse en Firestore como una colección `familyTrees` o como subcolecciones dentro de `pets`.

## 2. Suscripción con Stripe

Los usuarios que accedan a `/premium` sin suscripción serán redirigidos a una página donde se explica el valor del servicio y se ofrece un botón **“Suscribirme”**.  Al pulsarlo se llamará a la Cloud Function `createCheckoutSession` (que debe admitir `mode: subscription`) con el Price ID **premium** (`price_1RyNShCQpOtx3yYSRxQ8UkQq`).  La configuración de Stripe debe incluir:

- **Clave publicable** y **secreta** de prueba (`pk_test_…` y `sk_test_…`) y de producción (`pk_live_…` y `sk_live_…`), definidas en variables de entorno.  Se obtienen desde **Developers → API keys** en el Dashboard de Stripe【371864037948401†L63-L73】.
- **Webhook** configurado para el endpoint `/stripeWebhook` con eventos `checkout.session.completed` y `invoice.paid`.  El panel de Stripe generará un **signing secret** (por ejemplo `whsec_Y1YEuL9GCDqnJoKOD2MRRHLPsITcERXV`).  Cada endpoint y modo (prueba o live) tiene su propio secret【980360130676299†L1049-L1056】.
- Actualiza la Cloud Function `stripeWebhook` para registrar al usuario como **premium** en Firestore al recibir el evento `checkout.session.completed`.  Se puede añadir un campo `plan: "premium"` en el documento `users/{uid}`.

## 3. Integración de OpenAI

Para asegurar la confidencialidad del **OpenAI API Key** (`sk-proj-…`), todas las llamadas deben hacerse desde el backend (Cloud Functions) para que la clave no sea expuesta en el cliente.  Se recomienda crear las siguientes funciones:

### 3.1 Función `vetChat`

*Tipo:* Callable HTTP (o HTTPS con validación de token Firebase).

*Entradas:* `uid` del usuario autenticado y mensaje del usuario.

*Proceso:* La función llama a la API de OpenAI (modelo GPT‑4 Turbo u otro adecuado) con un prompt predefinido que contextualice que el asistente es un **“veterinario virtual”** y que debe responder en español, dar recomendaciones generales y exhortar a consultar un veterinario cuando sea necesario.

*Salidas:* Respuesta generada por la IA.

*Seguridad:* Valida que el usuario tenga `plan === "premium"` en su documento `users/{uid}` antes de procesar la consulta.

### 3.2 Función `dietRecommendations`

*Tipo:* Callable HTTP.

*Entradas:* `uid` y datos del formulario (`species`, `breed`, `age`).

*Proceso:* Se construye un prompt que pida a la IA recomendaciones de dieta, ejercicio y cuidados especiales basados en la especie, raza y edad.  Se pasa el prompt a la API de OpenAI.  Devuelve el texto generado.

### 3.3 Datos de genealogía

Los árboles genealógicos pueden almacenarse en una colección `familyTrees` con documentos del tipo:

```json
{
  "petId": "ref → pets/{id}",
  "nodes": [
    {
      "id": "string",
      "name": "string",
      "photoUrl": "string",
      "children": ["id", "id"]
    }
  ],
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

El frontend puede usar un componente de grafo o un árbol recursivo para visualizar la estructura.  Se permitirá enlazar cada nodo a la página de perfil `/app/pets/{id}` si existe.

## 4. Interfaz de usuario

- La página `/premium` debe tener un layout amigable, usando **TailwindCSS** y **shadcn/ui** para los componentes.  Usa encabezados claros y accesibles (WAI‑ARIA).  Implementa un estado de acceso: si el usuario no es premium, se muestra la oferta de suscripción; si ya es premium, se muestran las herramientas.
- **Chatbot**: cuadro de chat con historial de mensajes, indicador de escritura y botón para enviar preguntas.  Puedes usar websockets o polling para mostrar respuestas progresivas.
- **Formulario de recomendaciones**: inputs de selección para especie y raza (pueden cargarse de una lista), campo de edad numérico y botón de “Obtener recomendaciones”.  Muestra el resultado en un panel inferior.
- **Árbol genealógico**: formulario para añadir familiares (padres e hijos) y subir fotos (almacenadas en Firebase Storage).  Visualiza el árbol con un componente de diagrama.  Permite expandir y contraer nodos.

## 5. Seguridad y control de acceso

Implementa reglas de Firestore para que solo usuarios con `plan === "premium"` puedan leer y escribir en la colección `familyTrees`.  En las funciones `vetChat` y `dietRecommendations`, valida el plan antes de llamar a OpenAI.  Limita la longitud de los prompts y sanitiza las entradas para evitar abusos.

## 6. Variables de entorno necesarias

- `VITE_STRIPE_PUBLISHABLE_KEY` – clave publicable.
- `STRIPE_SECRET_KEY` – clave secreta.
- `STRIPE_WEBHOOK_SECRET` – secret del webhook (prueba y live).  Cada entorno tendrá su valor.
- `STRIPE_PREMIUM_PRICE_ID` – valor `price_1RyNShCQpOtx3yYSRxQ8UkQq` para el plan premium.
- `OPENAI_API_KEY` – clave de OpenAI (no exponer en el cliente).

## 7. Pasos siguientes

1. **Crear página y componentes** en el frontend (`/premium`, `PremiumChat`, `DietForm`, `FamilyTree`).
2. **Implementar funciones de backend** (`createCheckoutSession` para suscripción, `stripeWebhook` para manejar `checkout.session.completed`, `vetChat`, `dietRecommendations`).
3. **Configurar reglas de Firestore** para proteger datos premium.
4. **Agregar pruebas** de usabilidad y carga.  Validar que la integración de IA funcione correctamente y que el tiempo de respuesta sea aceptable.

## 8. Consideraciones finales

- La IA no sustituye el diagnóstico veterinario profesional.  Incluye siempre un aviso legal.
- Controla el uso de tokens de OpenAI para evitar costos inesperados.  Puedes limitar el número de consultas mensuales o la longitud de las respuestas.
- Mantén actualizados los términos y condiciones de la suscripción y cumple con las leyes de consumo de México.

Esta propuesta permitirá ofrecer un valor añadido a los tutores de mascotas a través de herramientas inteligentes y potenciar el ecosistema de **registroanimalmx** con un plan premium.