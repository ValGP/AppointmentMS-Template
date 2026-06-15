import { CalendarCheck, Clock, LogOut, UserRound } from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../../features/auth/context/AuthProvider";

export function ClientLayout() {
  const { logout, user } = useAuth();
  const initials =
    user?.fullName
      ?.split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase() || "B";

  return (
    <div className="client-shell">
      <header className="client-header">
        <NavLink className="client-brand" to="/app/book" aria-label="BIBE cliente">
          <span className="brand-logo">
            <img alt="" src="/icon/blanco.png" />
          </span>
        </NavLink>

        <nav className="client-nav" aria-label="Navegacion de cliente">
          <NavLink to="/app/book">
            <CalendarCheck aria-hidden="true" size={18} />
            Pedir turno
          </NavLink>
          <NavLink to="/app/appointments">
            <Clock aria-hidden="true" size={18} />
            Mis turnos
          </NavLink>
          <NavLink to="/app/profile">
            <UserRound aria-hidden="true" size={18} />
            Perfil
          </NavLink>
        </nav>

        <div className="client-user">
          <div className="client-user-copy">
            <strong>{user?.fullName ?? "Cliente"}</strong>
            <small>{user?.email}</small>
          </div>
          <span className="client-avatar">{initials}</span>
          <button type="button" onClick={logout} aria-label="Cerrar sesion">
            <LogOut aria-hidden="true" size={18} />
          </button>
        </div>
      </header>

      <main className="client-main">
        <Outlet />
      </main>
    </div>
  );
}
