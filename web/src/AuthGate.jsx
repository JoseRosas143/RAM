// src/components/AuthGate.jsx
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../firebase";
import { Navigate } from "react-router-dom";

export default function AuthGate({ children }) {
  const [user, loading] = useAuthState(auth);
  if (loading) return null;          // spinner opcional
  if (!user)   return <Navigate to="/" replace />;
  return children;
}
