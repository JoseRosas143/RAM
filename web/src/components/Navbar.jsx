import { Link } from "react-router-dom";
export default function Navbar() {
  return (
    <nav className="navbar">
      <Link to="/" className="logo">RegistroAnimalMX</Link>
      <Link to="/veterinarios">Veterinarios</Link>
      <Link to="/premium">Premium</Link>
    </nav>
  );
}
