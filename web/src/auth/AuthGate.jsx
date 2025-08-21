// src/auth/AuthGate.jsx
import React, { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";

export function AuthGate({ children }) {
  const [state, setState] = useState({ loading: true, user: null });

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) =>
      setState({ loading: false, user: u })
    );
    return () => unsub();
  }, []);

  if (state.loading) {
    return <div className="p-6">Cargando sesión…</div>;
  }
  if (!state.user) {
    return <div className="p-6">Inicia sesión para continuar.</div>;
  }
  return children;
}
