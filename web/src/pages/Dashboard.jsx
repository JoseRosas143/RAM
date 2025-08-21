// src/pages/Dashboard.jsx
import React from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "../firebase";
import { doc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const [user, loading] = useAuthState(auth);
  const navigate = useNavigate();

  if (loading) return null;          // 🔒 Espera estado real
  if (!user)  return navigate("/");  // <-- o renderiza <Login>

  async function handleCreate(e) {
    e.preventDefault();
    const form = e.target;
    const data = {
      name: form.name.value,
      microchip: form.microchip.value,
      // … resto de campos …
      ownerId: user.uid,
      createdAt: Date.now(),
    };
    await setDoc(doc(db, "pets", data.microchip), data);
    navigate(`/pet/${data.microchip}`);
  }

  return (
    <section>
      <h1>Mis mascotas</h1>

      <form onSubmit={handleCreate} className="flex flex-col gap-3 max-w-sm">
        <input name="name"       placeholder="Nombre"         required />
        <input name="microchip"  placeholder="Microchip"      required />
        {/* especie, sexo, fecha, color, señas, etc. */}
        <button className="btn-primary">Crear</button>
      </form>
    </section>
  );
}
