import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
export default function ProtectedRoute({ children }) {
  const navigate = useNavigate();
  useEffect(() => {
    const unsub = auth.onAuthStateChanged(user => {
      if (!user) navigate("/login");
    });
    return () => unsub();
  }, [navigate]);
  return children;
}