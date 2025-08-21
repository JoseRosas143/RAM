import { Link } from "react-router-dom";

export default function Landing() {
  return (
    <div className="landing-container">
      <img src="https://images.unsplash.com/photo-1518717758536-85ae29035b6d?auto=format&fit=crop&w=700&q=80" alt="Perro feliz" className="hero-img" />
      <h1>RegistroAnimalMX</h1>
      <h2>Crea la red de rescate y protección más grande en México 🐾</h2>
      <p>
        Identifica, protege y cuida a tu mascota con tecnología QR y microchip.<br />
        Acceso gratis a veterinarios aliados y modo rescate inmediato.
      </p>
      <div style={{ margin: "2rem 0" }}>
        <Link to="/register" className="cta-btn">Registrarse</Link>
        <span style={{ margin: "0 8px" }}></span>
        <Link to="/login" className="cta-btn secondary">Ingresar</Link>
      </div>
      <img src="https://images.unsplash.com/photo-1518715308788-30057527ade5?auto=format&fit=crop&w=600&q=80" alt="Veterinario" className="mini-img" />
    </div>
  );
}
