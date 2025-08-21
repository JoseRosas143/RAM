// Simulación de directorio (haz fetch real en versión final)
const vets = [
    { name: "Vet CDMX", phone: "55 1111 2222", address: "CDMX, México" },
    { name: "Clínica Patitas", phone: "55 3333 4444", address: "Monterrey, NL" },
    { name: "AnimalCare", phone: "55 5555 6666", address: "Guadalajara, Jalisco" },
  ];
  export default function VetDirectory() {
    return (
      <div className="vet-directory">
        <h2>Veterinarios aliados</h2>
        <ul>
          {vets.map((v, i) => (
            <li key={i}>
              <b>{v.name}</b><br/>
              {v.address}<br/>
              Tel: <a href={`tel:${v.phone}`}>{v.phone}</a>
            </li>
          ))}
        </ul>
        <p>¿Eres veterinario? <a href="mailto:contacto@bonica.com.mx">¡Únete aquí!</a></p>
      </div>
    );
  }