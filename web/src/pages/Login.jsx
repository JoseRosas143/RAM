import { useState } from "react";
import { auth } from "../firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";
export default function Login() {
  const [email, setEmail] = useState(""); const [pass, setPass] = useState(""); const navigate = useNavigate();
  return (
    <div className="login-container">
      <h2>Iniciar sesión</h2>
      <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="Correo"/>
      <input type="password" value={pass} onChange={e=>setPass(e.target.value)} placeholder="Contraseña"/>
      <button onClick={async ()=>{
        try { await signInWithEmailAndPassword(auth, email, pass); navigate("/dashboard"); } 
        catch (e) { alert("Error: " + e.message); }
      }}>Ingresar</button>
    </div>
  );
}