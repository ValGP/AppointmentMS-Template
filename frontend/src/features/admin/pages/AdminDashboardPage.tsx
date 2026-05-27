import { useQuery } from "@tanstack/react-query";
import {
  AlertCircle,
  CalendarClock,
  CheckCircle2,
  Clock3,
  ListChecks,
  Plus,
  RefreshCw,
  UserPlus,
} from "lucide-react";
import {
  getAppointments,
  type Appointment,
  type AppointmentStatus,
} from "../../appointments/api/appointmentsApi";
import {
  addDays,
  endOfDay,
  formatShortDateTime,
  formatTime,
  startOfDay,
  startOfWeek,
  toLocalDateTimeParam,
} from "../../../shared/utils/date";

const statusLabels: Record<AppointmentStatus, string> = {
  PENDING: "Pendiente",
  CONFIRMED: "Confirmado",
  REJECTED: "Rechazado",
  CANCELED_BY_CLIENT: "Cancelado cliente",
  CANCELED_BY_ADMIN: "Cancelado admin",
  COMPLETED: "Completado",
  NO_SHOW: "No asistio",
};

const statusTone: Record<AppointmentStatus, string> = {
  PENDING: "warning",
  CONFIRMED: "success",
  REJECTED: "danger",
  CANCELED_BY_CLIENT: "muted",
  CANCELED_BY_ADMIN: "muted",
  COMPLETED: "success",
  NO_SHOW: "danger",
};

const windowStart = startOfWeek(new Date());
const windowEnd = endOfDay(addDays(windowStart, 13));

function countByStatus(appointments: Appointment[], status: AppointmentStatus) {
  return appointments.filter((appointment) => appointment.status === status)
    .length;
}

function getNextAppointment(appointments: Appointment[]) {
  const now = Date.now();

  return appointments
    .filter((appointment) => new Date(appointment.startDateTime).getTime() >= now)
    .sort(
      (a, b) =>
        new Date(a.startDateTime).getTime() -
        new Date(b.startDateTime).getTime(),
    )[0];
}

export function AdminDashboardPage() {
  const appointmentsQuery = useQuery({
    queryKey: ["admin-dashboard-appointments"],
    queryFn: () =>
      getAppointments({
        from: toLocalDateTimeParam(windowStart),
        to: toLocalDateTimeParam(windowEnd),
        page: 0,
        size: 100,
        sort: "startDateTime,asc",
      }),
  });

  const appointments = appointmentsQuery.data?.content ?? [];
  const nextAppointment = getNextAppointment(appointments);
  const visibleAppointments = appointments.slice(0, 6);
  const pendingCount = countByStatus(appointments, "PENDING");
  const confirmedCount = countByStatus(appointments, "CONFIRMED");
  const completedCount = countByStatus(appointments, "COMPLETED");

  return (
    <section className="admin-dashboard">
      <div className="dashboard-title-row">
        <div>
          <p className="admin-kicker">Semana actual y proxima</p>
          <h2>Operacion diaria</h2>
        </div>
        <div className="dashboard-actions">
          <button
            className="admin-soft-button"
            type="button"
            onClick={() => void appointmentsQuery.refetch()}
          >
            <RefreshCw aria-hidden="true" size={16} />
            Actualizar
          </button>
          <button className="admin-primary-button" type="button">
            <Plus aria-hidden="true" size={16} />
            Nuevo turno
          </button>
        </div>
      </div>

      <div className="metric-grid">
        <MetricCard
          icon={Clock3}
          label="Pendientes"
          value={pendingCount}
          detail="Requieren confirmacion"
          tone="warning"
        />
        <MetricCard
          icon={CheckCircle2}
          label="Confirmados"
          value={confirmedCount}
          detail="Agenda comprometida"
          tone="success"
        />
        <MetricCard
          icon={ListChecks}
          label="Completados"
          value={completedCount}
          detail="Servicios finalizados"
          tone="accent"
        />
        <MetricCard
          icon={CalendarClock}
          label="Total ventana"
          value={appointmentsQuery.data?.totalElements ?? appointments.length}
          detail="14 dias visibles"
          tone="info"
        />
      </div>

      <div className="dashboard-content-grid">
        <article className="admin-card schedule-card">
          <div className="card-heading">
            <div>
              <p className="admin-kicker">Agenda</p>
              <h3>Turnos proximos</h3>
            </div>
            <span className="window-pill">14 dias</span>
          </div>

          {appointmentsQuery.isLoading ? (
            <DashboardState label="Cargando turnos..." />
          ) : null}

          {appointmentsQuery.isError ? (
            <DashboardState
              icon={AlertCircle}
              label="No se pudieron cargar los turnos."
            />
          ) : null}

          {!appointmentsQuery.isLoading &&
          !appointmentsQuery.isError &&
          visibleAppointments.length === 0 ? (
            <DashboardState label="No hay turnos en la ventana actual." />
          ) : null}

          {visibleAppointments.length > 0 ? (
            <div className="appointment-list">
              {visibleAppointments.map((appointment) => (
                <AppointmentRow
                  appointment={appointment}
                  key={appointment.id}
                />
              ))}
            </div>
          ) : null}
        </article>

        <aside className="dashboard-side-stack">
          <article className="admin-card next-card">
            <div className="card-heading">
              <div>
                <p className="admin-kicker">Siguiente</p>
                <h3>Proximo turno</h3>
              </div>
            </div>
            {nextAppointment ? (
              <div className="next-appointment">
                <strong>{nextAppointment.clientName}</strong>
                <span>{nextAppointment.serviceName}</span>
                <time>{formatShortDateTime(nextAppointment.startDateTime)}</time>
              </div>
            ) : (
              <p className="muted-copy">No hay turnos proximos cargados.</p>
            )}
          </article>

          <article className="admin-card quick-actions-card">
            <div className="card-heading">
              <div>
                <p className="admin-kicker">Acciones</p>
                <h3>Rapidas</h3>
              </div>
            </div>
            <button className="quick-action" type="button">
              <Plus aria-hidden="true" size={16} />
              Crear turno manual
            </button>
            <button className="quick-action" type="button">
              <UserPlus aria-hidden="true" size={16} />
              Registrar cliente
            </button>
            <button className="quick-action" type="button">
              <CalendarClock aria-hidden="true" size={16} />
              Revisar disponibilidad
            </button>
          </article>
        </aside>
      </div>
    </section>
  );
}

type MetricCardProps = {
  icon: typeof Clock3;
  label: string;
  value: number;
  detail: string;
  tone: string;
};

function MetricCard({ detail, icon: Icon, label, tone, value }: MetricCardProps) {
  return (
    <article className={`admin-card metric-card tone-${tone}`}>
      <div className="metric-icon">
        <Icon aria-hidden="true" size={18} />
      </div>
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{detail}</small>
    </article>
  );
}

function AppointmentRow({ appointment }: { appointment: Appointment }) {
  return (
    <article className="appointment-row">
      <div className="appointment-time">
        <strong>{formatTime(appointment.startDateTime)}</strong>
        <span>{formatShortDateTime(appointment.startDateTime)}</span>
      </div>
      <div className="appointment-main">
        <strong>{appointment.clientName}</strong>
        <span>{appointment.serviceName}</span>
      </div>
      <div className="appointment-meta">
        <span>{appointment.professionalName}</span>
        <span className={`status-badge tone-${statusTone[appointment.status]}`}>
          {statusLabels[appointment.status]}
        </span>
      </div>
    </article>
  );
}

function DashboardState({
  icon: Icon = CalendarClock,
  label,
}: {
  icon?: typeof CalendarClock;
  label: string;
}) {
  return (
    <div className="dashboard-state">
      <Icon aria-hidden="true" size={20} />
      <span>{label}</span>
    </div>
  );
}
