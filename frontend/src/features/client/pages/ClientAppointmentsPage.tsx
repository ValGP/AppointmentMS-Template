import {
  CalendarClock,
  CheckCircle2,
  Clock,
  XCircle,
} from "lucide-react";
import { type ReactNode } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  getAppointments,
  type Appointment,
  type AppointmentStatus,
} from "../../appointments/api/appointmentsApi";
import { formatShortDateTime } from "../../../shared/utils/date";

const statusLabels: Record<AppointmentStatus, string> = {
  PENDING: "Pendiente",
  CONFIRMED: "Confirmado",
  REJECTED: "Rechazado",
  CANCELED_BY_CLIENT: "Cancelado por vos",
  CANCELED_BY_ADMIN: "Cancelado por BIBE",
  COMPLETED: "Completado",
  NO_SHOW: "No asistio",
};

function getStatusTone(status: AppointmentStatus) {
  if (status === "PENDING") return "is-pending";
  if (status === "CONFIRMED") return "is-confirmed";
  if (status === "COMPLETED") return "is-completed";
  return "is-muted";
}

function isUpcoming(appointment: Appointment) {
  const date = new Date(appointment.startDateTime).getTime();
  return (
    date >= Date.now() &&
    (appointment.status === "PENDING" || appointment.status === "CONFIRMED")
  );
}

export function ClientAppointmentsPage() {
  const appointmentsQuery = useQuery({
    queryKey: ["appointments", "client"],
    queryFn: () =>
      getAppointments({
        page: 0,
        size: 30,
        sort: "startDateTime,desc",
      }),
  });

  const appointments = appointmentsQuery.data?.content ?? [];
  const upcomingAppointments = appointments.filter(isUpcoming);
  const pastAppointments = appointments.filter(
    (appointment) => !isUpcoming(appointment),
  );

  return (
    <section className="client-appointments-page">
      <div className="client-book-hero">
        <div>
          <p className="public-pill">Mis turnos</p>
          <h1>Segui tus solicitudes.</h1>
          <p>
            Aca vas a ver los turnos pedidos, los confirmados por BIBE y el
            historial cuando vayan cerrando.
          </p>
        </div>
        <Link className="client-primary-link" to="/app/book">
          Pedir otro turno
          <CalendarClock aria-hidden="true" size={18} />
        </Link>
      </div>

      {appointmentsQuery.isLoading ? (
        <div className="client-empty-state">
          <strong>Cargando turnos...</strong>
          <p>Estamos buscando tus solicitudes.</p>
        </div>
      ) : null}

      {appointmentsQuery.isError ? (
        <div className="client-empty-state tone-danger">
          <strong>No pudimos cargar tus turnos.</strong>
          <p>Proba recargar la pagina en unos minutos.</p>
        </div>
      ) : null}

      {!appointmentsQuery.isLoading &&
      !appointmentsQuery.isError &&
      appointments.length === 0 ? (
        <div className="client-empty-state">
          <strong>Todavia no solicitaste turnos.</strong>
          <p>Cuando pidas uno, va a aparecer aca con su estado.</p>
          <Link className="client-inline-link" to="/app/book">
            Pedir mi primer turno
          </Link>
        </div>
      ) : null}

      {appointments.length > 0 ? (
        <div className="client-appointments-grid">
          <AppointmentSection
            appointments={upcomingAppointments}
            emptyText="No tenes turnos proximos pendientes o confirmados."
            icon={<Clock aria-hidden="true" size={20} />}
            title="Proximos turnos"
          />
          <AppointmentSection
            appointments={pastAppointments}
            emptyText="Todavia no hay historial para mostrar."
            icon={<CheckCircle2 aria-hidden="true" size={20} />}
            title="Historial"
          />
        </div>
      ) : null}
    </section>
  );
}

function AppointmentSection({
  appointments,
  emptyText,
  icon,
  title,
}: {
  appointments: Appointment[];
  emptyText: string;
  icon: ReactNode;
  title: string;
}) {
  return (
    <section className="client-book-card client-appointment-section">
      <div className="client-section-title">
        {icon}
        <h2>{title}</h2>
      </div>

      {appointments.length === 0 ? (
        <p className="client-muted-text">{emptyText}</p>
      ) : (
        <div className="client-appointment-list">
          {appointments.map((appointment) => (
            <AppointmentCard appointment={appointment} key={appointment.id} />
          ))}
        </div>
      )}
    </section>
  );
}

function AppointmentCard({ appointment }: { appointment: Appointment }) {
  const statusTone = getStatusTone(appointment.status);

  return (
    <article className="client-appointment-card">
      <div>
        <span className={`client-status-pill ${statusTone}`}>
          {appointment.status === "PENDING" ? (
            <Clock aria-hidden="true" size={14} />
          ) : appointment.status === "CONFIRMED" ? (
            <CheckCircle2 aria-hidden="true" size={14} />
          ) : (
            <XCircle aria-hidden="true" size={14} />
          )}
          {statusLabels[appointment.status]}
        </span>
        <h3>{appointment.serviceName}</h3>
        <p>{formatShortDateTime(appointment.startDateTime)}</p>
      </div>

      <dl>
        <div>
          <dt>Profesional</dt>
          <dd>{appointment.professionalName}</dd>
        </div>
        <div>
          <dt>Notas</dt>
          <dd>{appointment.notes || "Sin notas"}</dd>
        </div>
      </dl>
    </article>
  );
}
