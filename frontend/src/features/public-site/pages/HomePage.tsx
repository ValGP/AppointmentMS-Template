import { Link } from "react-router-dom";

export function HomePage() {
  return (
    <section className="home-grid">
      <div className="hero-copy">
        <p className="eyebrow">BIBE Estetica</p>
        <h1>Turnos simples para una experiencia cuidada.</h1>
        <p>
          Base inicial del sitio publico. En fases posteriores se sumaran
          servicios, contacto y el flujo completo para solicitar turnos.
        </p>
        <div className="actions">
          <Link className="button" to="/login">
            Solicitar turno
          </Link>
          <Link className="button button-secondary" to="/register">
            Crear cuenta
          </Link>
        </div>
      </div>
      <div className="surface-card">
        <h2>Fase 0</h2>
        <p>Router, layouts, cliente HTTP, token y estilos base listos.</p>
      </div>
    </section>
  );
}
