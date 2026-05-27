import { NavLink, Outlet } from "react-router-dom";

export function PublicLayout() {
  return (
    <div className="public-shell">
      <header className="site-header">
        <NavLink className="brand" to="/">
          BIBE Estetica
        </NavLink>
        <nav className="nav-links" aria-label="Navegacion publica">
          <NavLink to="/">Inicio</NavLink>
          <NavLink to="/login">Ingresar</NavLink>
          <NavLink className="button button-small" to="/register">
            Registrarse
          </NavLink>
        </nav>
      </header>
      <main className="public-main">
        <Outlet />
      </main>
    </div>
  );
}
