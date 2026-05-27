import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../../features/auth/context/AuthProvider";

export function ClientLayout() {
  const { logout, user } = useAuth();

  return (
    <div className="app-shell">
      <aside className="sidebar client-sidebar">
        <NavLink className="brand" to="/app">
          BIBE
        </NavLink>
        <nav className="sidebar-nav" aria-label="Navegacion de cliente">
          <NavLink to="/app/book">Solicitar turno</NavLink>
          <NavLink to="/app/appointments">Mis turnos</NavLink>
          <NavLink to="/app/profile">Mi perfil</NavLink>
        </nav>
      </aside>
      <div className="workspace">
        <header className="workspace-header">
          <span>Area de cliente</span>
          <div className="header-actions">
            <span>{user?.fullName}</span>
            <NavLink to="/">Sitio publico</NavLink>
            <button className="text-button" type="button" onClick={logout}>
              Salir
            </button>
          </div>
        </header>
        <main className="workspace-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
