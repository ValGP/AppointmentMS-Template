import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Ban,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Edit3,
  RefreshCw,
  Search,
  UserX,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ApiError } from "../../../shared/api/httpClient";
import {
  addDays,
  endOfDay,
  formatShortDateTime,
  formatTime,
  startOfWeek,
  toLocalDateTimeParam,
} from "../../../shared/utils/date";
import {
  cancelAppointmentByAdmin,
  completeAppointment,
  confirmAppointment,
  getAppointments,
  markAppointmentNoShow,
  rejectAppointment,
  type Appointment,
  type AppointmentStatus,
} from "../../appointments/api/appointmentsApi";
import { getClients } from "../../clients/api/clientsApi";
import { getProfessionals } from "../../professionals/api/professionalsApi";
import { AdminConfirmDialog } from "../components/AdminConfirmDialog";
import { AdminModal } from "../components/AdminModal";
import { AdminToast } from "../components/AdminToast";
import { useAdminToast } from "../hooks/useAdminToast";

const statusOptions: Array<{ label: string; value: AppointmentStatus }> = [
  { label: "Pendiente", value: "PENDING" },
  { label: "Confirmado", value: "CONFIRMED" },
  { label: "Rechazado", value: "REJECTED" },
  { label: "Cancelado cliente", value: "CANCELED_BY_CLIENT" },
  { label: "Cancelado admin", value: "CANCELED_BY_ADMIN" },
  { label: "Completado", value: "COMPLETED" },
  { label: "No asistio", value: "NO_SHOW" },
];

const statusLabels = Object.fromEntries(
  statusOptions.map((status) => [status.value, status.label]),
) as Record<AppointmentStatus, string>;

const statusTone: Record<AppointmentStatus, string> = {
  PENDING: "warning",
  CONFIRMED: "success",
  REJECTED: "danger",
  CANCELED_BY_CLIENT: "muted",
  CANCELED_BY_ADMIN: "muted",
  COMPLETED: "success",
  NO_SHOW: "danger",
};

type Filters = {
  clientId: string;
  professionalId: string;
  status: string;
  from: string;
  to: string;
};

type TransitionAction = "reject" | "cancel";
type SimpleAction = "confirm" | "complete" | "no-show";

const simpleActionLabels: Record<
  SimpleAction,
  {
    confirmLabel: string;
    message: (appointment: Appointment) => string;
    success: string;
    title: string;
  }
> = {
  confirm: {
    confirmLabel: "Confirmar",
    message: (appointment) =>
      `Vas a confirmar el turno de ${appointment.clientName}. Esta accion cambia el estado del turno.`,
    success: "Turno confirmado.",
    title: "Confirmar turno",
  },
  complete: {
    confirmLabel: "Completar",
    message: (appointment) =>
      `Vas a marcar como completado el turno de ${appointment.clientName}.`,
    success: "Turno completado.",
    title: "Completar turno",
  },
  "no-show": {
    confirmLabel: "Marcar no-show",
    message: (appointment) =>
      `Vas a marcar que ${appointment.clientName} no asistio al turno.`,
    success: "Turno marcado como no asistio.",
    title: "Marcar no-show",
  },
};

const initialStart = startOfWeek(new Date());
const initialEnd = endOfDay(addDays(initialStart, 13));

function toDateInput(value: Date) {
  return value.toISOString().slice(0, 10);
}

function toDayKey(value: string) {
  return new Date(value).toISOString().slice(0, 10);
}

function formatDayTitle(dayKey: string) {
  return new Intl.DateTimeFormat("es-AR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  }).format(new Date(`${dayKey}T00:00:00`));
}

function toDateTimeStart(value: string) {
  return `${value}T00:00:00`;
}

function toDateTimeEnd(value: string) {
  return `${value}T23:59:59`;
}

export function AdminAppointmentsPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const [filters, setFilters] = useState<Filters>({
    clientId: "",
    professionalId: "",
    status: "",
    from: toDateInput(initialStart),
    to: toDateInput(initialEnd),
  });
  const [transition, setTransition] = useState<{
    action: TransitionAction;
    appointment: Appointment;
  } | null>(null);
  const [simpleAction, setSimpleAction] = useState<{
    action: SimpleAction;
    appointment: Appointment;
  } | null>(null);
  const [transitionReason, setTransitionReason] = useState("");
  const [transitionError, setTransitionError] = useState<string | null>(null);
  const { showToast, toast } = useAdminToast();

  const appointmentsQuery = useQuery({
    queryKey: ["admin-appointments", filters, page],
    queryFn: () =>
      getAppointments({
        clientId: filters.clientId ? Number(filters.clientId) : undefined,
        professionalId: filters.professionalId
          ? Number(filters.professionalId)
          : undefined,
        status: filters.status ? (filters.status as AppointmentStatus) : undefined,
        from: filters.from ? toDateTimeStart(filters.from) : undefined,
        to: filters.to ? toDateTimeEnd(filters.to) : undefined,
        page,
        size: 40,
        sort: "startDateTime,asc",
      }),
  });

  const clientsQuery = useQuery({ queryKey: ["clients"], queryFn: getClients });
  const professionalsQuery = useQuery({
    queryKey: ["professionals"],
    queryFn: () => getProfessionals(),
  });

  const appointments = appointmentsQuery.data?.content ?? [];
  const clients = clientsQuery.data ?? [];
  const professionals = professionalsQuery.data ?? [];

  const groupedAppointments = useMemo(() => {
    return appointments.reduce<Record<string, Appointment[]>>((acc, appointment) => {
      const key = toDayKey(appointment.startDateTime);
      acc[key] = acc[key] ?? [];
      acc[key].push(appointment);
      return acc;
    }, {});
  }, [appointments]);

  const simpleActionMutation = useMutation({
    mutationFn: ({
      action,
      id,
    }: {
      action: SimpleAction;
      id: number;
    }) => {
      if (action === "confirm") {
        return confirmAppointment(id);
      }
      if (action === "complete") {
        return completeAppointment(id);
      }
      return markAppointmentNoShow(id);
    },
    onSuccess: async (_data, variables) => {
      await refreshAppointments();
      setSimpleAction(null);
      showToast(simpleActionLabels[variables.action].success);
    },
    onError: (error) =>
      showToast(
        error instanceof ApiError
          ? error.message
          : "No se pudo actualizar el turno.",
        "danger",
      ),
  });

  const transitionMutation = useMutation({
    mutationFn: ({
      action,
      id,
      reason,
    }: {
      action: TransitionAction;
      id: number;
      reason: string;
    }) =>
      action === "reject"
        ? rejectAppointment(id, { reason })
        : cancelAppointmentByAdmin(id, { reason }),
    onSuccess: async (_data, variables) => {
      await refreshAppointments();
      closeTransitionModal();
      showToast(
        variables.action === "reject" ? "Turno rechazado." : "Turno cancelado.",
      );
    },
    onError: (error) =>
      setTransitionError(
        error instanceof ApiError
          ? error.message
          : "No se pudo actualizar el turno.",
      ),
  });

  function refreshAppointments() {
    return Promise.all([
      queryClient.invalidateQueries({ queryKey: ["admin-appointments"] }),
      queryClient.invalidateQueries({ queryKey: ["admin-dashboard-appointments"] }),
    ]);
  }

  function updateFilter(key: keyof Filters, value: string) {
    setFilters((current) => ({ ...current, [key]: value }));
    setPage(0);
  }

  function resetFilters() {
    setFilters({
      clientId: "",
      professionalId: "",
      status: "",
      from: toDateInput(initialStart),
      to: toDateInput(initialEnd),
    });
    setPage(0);
  }

  function openTransitionModal(action: TransitionAction, appointment: Appointment) {
    setTransition({ action, appointment });
    setTransitionReason("");
    setTransitionError(null);
  }

  function closeTransitionModal() {
    setTransition(null);
    setTransitionReason("");
    setTransitionError(null);
  }

  function submitTransition() {
    if (!transition) {
      return;
    }

    if (!transitionReason.trim()) {
      setTransitionError("Ingresa un motivo.");
      return;
    }

    transitionMutation.mutate({
      action: transition.action,
      id: transition.appointment.id,
      reason: transitionReason.trim(),
    });
  }

  const dayKeys = Object.keys(groupedAppointments).sort();
  const total = appointmentsQuery.data?.totalElements ?? 0;

  return (
    <section className="appointments-page">
      <AdminToast toast={toast} />
      <div className="catalog-header">
        <div>
          <p className="admin-kicker">Agenda</p>
          <h2>Turnos</h2>
          <p>
            Opera los turnos desde una agenda simple por dia, con filtros y
            acciones de estado.
          </p>
        </div>
        <Link
          className="admin-primary-button"
          to="/admin/calendar"
        >
          Revisar agenda
        </Link>
      </div>

      <article className="admin-card appointments-filter-card">
        <div className="card-heading">
          <div>
            <p className="admin-kicker">Filtros</p>
            <h3>Busqueda operativa</h3>
          </div>
          <button
            className="admin-soft-button"
            type="button"
            onClick={() => void appointmentsQuery.refetch()}
          >
            <RefreshCw aria-hidden="true" size={16} />
            Actualizar
          </button>
        </div>

        <div className="appointments-filter-grid">
          <label>
            Desde
            <input
              type="date"
              value={filters.from}
              onChange={(event) => updateFilter("from", event.target.value)}
            />
          </label>
          <label>
            Hasta
            <input
              type="date"
              value={filters.to}
              onChange={(event) => updateFilter("to", event.target.value)}
            />
          </label>
          <label>
            Estado
            <select
              value={filters.status}
              onChange={(event) => updateFilter("status", event.target.value)}
            >
              <option value="">Todos</option>
              {statusOptions.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            Profesional
            <select
              value={filters.professionalId}
              onChange={(event) =>
                updateFilter("professionalId", event.target.value)
              }
            >
              <option value="">Todos</option>
              {professionals.map((professional) => (
                <option key={professional.id} value={professional.id}>
                  {professional.fullName}
                </option>
              ))}
            </select>
          </label>
          <label>
            Cliente
            <select
              value={filters.clientId}
              onChange={(event) => updateFilter("clientId", event.target.value)}
            >
              <option value="">Todos</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.fullName}
                </option>
              ))}
            </select>
          </label>
          <button className="admin-soft-button" type="button" onClick={resetFilters}>
            <Search aria-hidden="true" size={16} />
            Semana actual + proxima
          </button>
        </div>
      </article>

      <article className="admin-card appointments-list-card">
        <div className="card-heading">
          <div>
            <p className="admin-kicker">Listado</p>
            <h3>{total} turnos encontrados</h3>
          </div>
          <div className="appointments-pagination">
            <button
              className="icon-button"
              type="button"
              onClick={() => setPage((current) => Math.max(0, current - 1))}
              disabled={appointmentsQuery.data?.first ?? true}
              aria-label="Pagina anterior"
            >
              <ChevronLeft aria-hidden="true" size={18} />
            </button>
            <span>
              Pagina {(appointmentsQuery.data?.page ?? page) + 1} de{" "}
              {Math.max(appointmentsQuery.data?.totalPages ?? 1, 1)}
            </span>
            <button
              className="icon-button"
              type="button"
              onClick={() => setPage((current) => current + 1)}
              disabled={appointmentsQuery.data?.last ?? true}
              aria-label="Pagina siguiente"
            >
              <ChevronRight aria-hidden="true" size={18} />
            </button>
          </div>
        </div>

        {appointmentsQuery.isLoading ? (
          <DashboardState label="Cargando turnos..." />
        ) : null}
        {appointmentsQuery.isError ? (
          <DashboardState label="No se pudieron cargar los turnos." />
        ) : null}
        {!appointmentsQuery.isLoading &&
        !appointmentsQuery.isError &&
        appointments.length === 0 ? (
          <DashboardState label="No hay turnos para los filtros elegidos." />
        ) : null}

        {dayKeys.length > 0 ? (
          <div className="appointments-day-list">
            {dayKeys.map((dayKey) => (
              <section className="appointments-day-group" key={dayKey}>
                <h4>{formatDayTitle(dayKey)}</h4>
                <div className="appointments-admin-list">
                  {groupedAppointments[dayKey].map((appointment) => (
                    <AppointmentAdminRow
                      appointment={appointment}
                      isBusy={
                        simpleActionMutation.isPending ||
                        transitionMutation.isPending
                      }
                      key={appointment.id}
                      onCancel={() => openTransitionModal("cancel", appointment)}
                      onComplete={() =>
                        setSimpleAction({ action: "complete", appointment })
                      }
                      onConfirm={() =>
                        setSimpleAction({ action: "confirm", appointment })
                      }
                      onNoShow={() =>
                        setSimpleAction({ action: "no-show", appointment })
                      }
                      onReject={() => openTransitionModal("reject", appointment)}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        ) : null}
      </article>

      {transition ? (
        <AdminModal
          title={
            transition.action === "reject" ? "Rechazar turno" : "Cancelar turno"
          }
          kicker="Confirmacion"
          onClose={closeTransitionModal}
        >
          <div className="transition-summary">
            <strong>{transition.appointment.clientName}</strong>
            <span>{transition.appointment.serviceName}</span>
            <time>{formatShortDateTime(transition.appointment.startDateTime)}</time>
          </div>
          <label className="modal-field">
            Motivo
            <textarea
              rows={4}
              value={transitionReason}
              onChange={(event) => setTransitionReason(event.target.value)}
              maxLength={300}
            />
          </label>
          {transitionError ? (
            <div className="admin-form-error">{transitionError}</div>
          ) : null}
          <div className="form-actions">
            <button
              className="admin-soft-button"
              type="button"
              onClick={closeTransitionModal}
            >
              Volver
            </button>
            <button
              className="admin-primary-button"
              type="button"
              onClick={submitTransition}
              disabled={transitionMutation.isPending}
            >
              {transitionMutation.isPending ? "Guardando..." : "Confirmar"}
            </button>
          </div>
        </AdminModal>
      ) : null}

      {simpleAction ? (
        <AdminConfirmDialog
          title={simpleActionLabels[simpleAction.action].title}
          message={simpleActionLabels[simpleAction.action].message(
            simpleAction.appointment,
          )}
          confirmLabel={simpleActionLabels[simpleAction.action].confirmLabel}
          isPending={simpleActionMutation.isPending}
          onCancel={() => setSimpleAction(null)}
          onConfirm={() =>
            simpleActionMutation.mutate({
              action: simpleAction.action,
              id: simpleAction.appointment.id,
            })
          }
        />
      ) : null}
    </section>
  );
}

function AppointmentAdminRow({
  appointment,
  isBusy,
  onCancel,
  onComplete,
  onConfirm,
  onNoShow,
  onReject,
}: {
  appointment: Appointment;
  isBusy: boolean;
  onCancel: () => void;
  onComplete: () => void;
  onConfirm: () => void;
  onNoShow: () => void;
  onReject: () => void;
}) {
  const canConfirm = appointment.status === "PENDING";
  const canReject = appointment.status === "PENDING";
  const canCancel =
    appointment.status === "PENDING" || appointment.status === "CONFIRMED";
  const canComplete = appointment.status === "CONFIRMED";
  const canNoShow = appointment.status === "CONFIRMED";

  return (
    <article className="appointment-admin-row">
      <div className="appointment-time">
        <strong>{formatTime(appointment.startDateTime)}</strong>
        <span>{formatTime(appointment.endDateTime)}</span>
      </div>
      <div className="appointment-main">
        <strong>{appointment.clientName}</strong>
        <span>{appointment.serviceName}</span>
      </div>
      <div className="appointment-main appointment-secondary">
        <strong>{appointment.professionalName}</strong>
        <span>{appointment.notes || "Sin notas"}</span>
      </div>
      <span className={`status-badge tone-${statusTone[appointment.status]}`}>
        {statusLabels[appointment.status]}
      </span>
      <div className="appointment-admin-actions">
        {canConfirm ? (
          <button
            className="icon-button"
            type="button"
            onClick={onConfirm}
            disabled={isBusy}
            aria-label={`Confirmar turno ${appointment.id}`}
            title="Confirmar"
          >
            <Check aria-hidden="true" size={16} />
          </button>
        ) : null}
        {canReject ? (
          <button
            className="icon-button"
            type="button"
            onClick={onReject}
            disabled={isBusy}
            aria-label={`Rechazar turno ${appointment.id}`}
            title="Rechazar"
          >
            <X aria-hidden="true" size={16} />
          </button>
        ) : null}
        {canCancel ? (
          <button
            className="icon-button"
            type="button"
            onClick={onCancel}
            disabled={isBusy}
            aria-label={`Cancelar turno ${appointment.id}`}
            title="Cancelar"
          >
            <Ban aria-hidden="true" size={16} />
          </button>
        ) : null}
        {canComplete ? (
          <button
            className="icon-button"
            type="button"
            onClick={onComplete}
            disabled={isBusy}
            aria-label={`Completar turno ${appointment.id}`}
            title="Completar"
          >
            <CheckCircle2 aria-hidden="true" size={16} />
          </button>
        ) : null}
        {canNoShow ? (
          <button
            className="icon-button"
            type="button"
            onClick={onNoShow}
            disabled={isBusy}
            aria-label={`Marcar no-show turno ${appointment.id}`}
            title="No asistio"
          >
            <UserX aria-hidden="true" size={16} />
          </button>
        ) : null}
        {!canConfirm && !canReject && !canCancel && !canComplete && !canNoShow ? (
          <span className="appointment-locked">
            <Edit3 aria-hidden="true" size={14} />
            Cerrado
          </span>
        ) : null}
      </div>
    </article>
  );
}

function DashboardState({ label }: { label: string }) {
  return (
    <div className="dashboard-state">
      <Clock3 aria-hidden="true" size={20} />
      <span>{label}</span>
    </div>
  );
}
