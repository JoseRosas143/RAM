import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { initializeApp } from 'firebase/app';

// Firebase config should be provided via environment variables.  Replace the
// placeholders below with process.env.VITE_… values during build.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

/**
 * Login and registration page.  Provides a simple form to create a new account
 * or sign in.  In a real application, you might separate registration and
 * login flows and add better validation.
 */
export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSignIn = async () => {
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/app');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleRegister = async () => {
    setError(null);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      navigate('/app');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h1 className="text-2xl font-semibold mb-4 text-center">Acceso a Registro Animal MX</h1>
        {error && <p className="text-red-600 mb-4">{error}</p>}
        <div className="space-y-4">
          <input
            type="email"
            className="w-full p-2 border rounded"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            className="w-full p-2 border rounded"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            onClick={handleSignIn}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700">
            Iniciar sesión
          </button>
          <button
            onClick={handleRegister}
            className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700">
            Crear cuenta
          </button>
        </div>
        <div className="text-center mt-4">
          <Link to="/">Regresar</Link>
        </div>
      </div>
    </main>
  );
}