import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Sparkles,
  UserRoundCheck,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useMutation, useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { ApiError } from "../../../shared/api/httpClient";
import {
  addDays,
  formatTime,
  startOfWeek,
} from "../../../shared/utils/date";
import {
  createAppointment,
  type Appointment,
  type AppointmentPayload,
} from "../../appointments/api/appointmentsApi";
import {
  getAvailability,
  type AvailabilitySlot,
} from "../../availability/api/availabilityApi";
import {
  getProfessionals,
  type Professional,
} from "../../professionals/api/professionalsApi";
import {
  getServices,
  type ServiceCatalogItem,
} from "../../services/api/servicesApi";

type DayModel = {
  date: Date;
  dateKey: string;
  label: string;
  shortLabel: string;
};

const currentWeekStart = startOfWeek(new Date());

function toDateKey(date: Date) {
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function getWeekDays(weekStart: Date): DayModel[] {
  return Array.from({ length: 7 }, (_, index) => {
    const date = addDays(weekStart, index);
    return {
      date,
      dateKey: toDateKey(date),
      label: new Intl.DateTimeFormat("es-AR", {
        weekday: "long",
        day: "2-digit",
        month: "2-digit",
      }).format(date),
      shortLabel: new Intl.DateTimeFormat("es-AR", {
        weekday: "short",
        day: "2-digit",
      }).format(date),
    };
  });
}

function formatWeekRange(weekStart: Date) {
  const weekEnd = addDays(weekStart, 6);
  const formatter = new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "2-digit",
  });
  return `${formatter.format(weekStart)} al ${formatter.format(weekEnd)}`;
}

function formatSlotSummary(slot: AvailabilitySlot) {
  const day = new Intl.DateTimeFormat("es-AR", {
    weekday: "long",
    day: "2-digit",
    month: "short",
  }).format(new Date(slot.startDateTime));

  return `${day}, ${formatTime(slot.startDateTime)} a ${formatTime(slot.endDateTime)}`;
}

export function ClientBookPage() {
  const queryClient = useQueryClient();
  const [selectedServiceId, setSelectedServiceId] = useState<number | null>(null);
  const [selectedProfessionalId, setSelectedProfessionalId] = useState<number | null>(
    null,
  );
  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedSlot, setSelectedSlot] = useState<AvailabilitySlot | null>(null);
  const [notes, setNotes] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [createdAppointment, setCreatedAppointment] = useState<Appointment | null>(
    null,
  );

  const servicesQuery = useQuery({
    queryKey: ["client-services"],
    queryFn: () => getServices(),
  });

  const professionalsQuery = useQuery({
    queryKey: ["client-professionals", selectedServiceId],
    enabled: selectedServiceId !== null,
    queryFn: () => getProfessionals({ serviceId: selectedServiceId! }),
  });

  const activeServices = useMemo(
    () => (servicesQuery.data ?? []).filter((service) => service.active),
    [servicesQuery.data],
  );
  const selectedService =
    activeServices.find((service) => service.id === selectedServiceId) ?? null;

  const activeProfessionals = useMemo(
    () =>
      (professionalsQuery.data ?? []).filter((professional) => professional.active),
    [professionalsQuery.data],
  );
  const selectedProfessional =
    activeProfessionals.find(
      (professional) => professional.id === selectedProfessionalId,
    ) ?? null;

  const weekStart = useMemo(
    () => addDays(currentWeekStart, weekOffset * 7),
    [weekOffset],
  );
  const weekDays = useMemo(() => getWeekDays(weekStart), [weekStart]);

  useEffect(() => {
    setSelectedProfessionalId(null);
    setSelectedSlot(null);
  }, [selectedServiceId]);

  useEffect(() => {
    if (activeProfessionals.length === 1 && selectedProfessionalId === null) {
      setSelectedProfessionalId(activeProfessionals[0].id);
    }
  }, [activeProfessionals, selectedProfessionalId]);

  useEffect(() => {
    setSelectedSlot(null);
  }, [selectedProfessionalId, weekOffset]);

  const availabilityQueries = useQueries({
    queries: weekDays.map((day) => ({
      queryKey: [
        "client-availability",
        selectedProfessionalId,
        selectedServiceId,
        day.dateKey,
      ],
      enabled: selectedProfessionalId !== null && selectedServiceId !== null,
      queryFn: () =>
        getAvailability({
          professionalId: selectedProfessionalId!,
          serviceId: selectedServiceId!,
          date: day.dateKey,
        }),
    })),
  });

  const availabilityByDay = weekDays.reduce<Record<string, AvailabilitySlot[]>>(
    (acc, day, index) => {
      acc[day.dateKey] = availabilityQueries[index]?.data ?? [];
      return acc;
    },
    {},
  );
  const hasAvailabilitySelection =
    selectedService !== null && selectedProfessional !== null;
  const isAvailabilityLoading = availabilityQueries.some((query) => query.isLoading);
  const isAvailabilityError = availabilityQueries.some((query) => query.isError);
  const availableSlotCount = Object.values(availabilityByDay).reduce(
    (count, slots) => count + slots.length,
    0,
  );

  const createMutation = useMutation({
    mutationFn: (payload: AppointmentPayload) => createAppointment(payload),
    onSuccess: async (appointment) => {
      setCreatedAppointment(appointment);
      setFormError(null);
      setNotes("");
      setSelectedSlot(null);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["client-availability"] }),
        queryClient.invalidateQueries({ queryKey: ["appointments"] }),
      ]);
    },
    onError: (error) => {
      const message =
        error instanceof ApiError
          ? error.message
          : "No pudimos solicitar el turno. Proba nuevamente.";
      setFormError(message);
    },
  });

  function handleCreateAppointment() {
    if (!selectedService || !selectedProfessional || !selectedSlot) {
      return;
    }

    setFormError(null);
    createMutation.mutate({
      professionalId: selectedProfessional.id,
      serviceId: selectedService.id,
      startDateTime: selectedSlot.startDateTime,
      notes: notes.trim() || undefined,
    });
  }

  function handleNewRequest() {
    setCreatedAppointment(null);
    setSelectedServiceId(null);
    setSelectedProfessionalId(null);
    setSelectedSlot(null);
    setWeekOffset(0);
    setNotes("");
    setFormError(null);
  }

  return (
    <section className="client-book-page">
      <div className="client-book-hero">
        <div>
          <p className="public-pill">Reservar turno</p>
          <h1>Elegi el servicio para empezar.</h1>
          <p>
            Primero selecciona que tratamiento queres consultar. Despues vamos a
            mostrar profesionales compatibles, disponibilidad y horarios.
          </p>
        </div>
        <div className="client-book-status">
          <Sparkles aria-hidden="true" size={22} />
          <span>Solicitud simple, confirmacion administrativa.</span>
        </div>
      </div>

      <div className="client-book-grid">
        <div className="client-book-card">
          <div className="client-section-heading">
            <span>Paso 1</span>
            <h2>Selecciona un servicio</h2>
          </div>

          {servicesQuery.isLoading ? (
            <div className="client-empty-state">
              <strong>Cargando servicios...</strong>
              <p>Estamos buscando los tratamientos disponibles para reserva.</p>
            </div>
          ) : null}

          {servicesQuery.isError ? (
            <div className="client-empty-state tone-danger">
              <strong>No pudimos cargar los servicios.</strong>
              <p>Proba recargar la pagina o intenta nuevamente en unos minutos.</p>
            </div>
          ) : null}

          {!servicesQuery.isLoading &&
          !servicesQuery.isError &&
          activeServices.length === 0 ? (
            <div className="client-empty-state">
              <strong>Todavia no hay servicios disponibles.</strong>
              <p>Cuando BIBE habilite servicios activos, van a aparecer aca.</p>
            </div>
          ) : null}

          {activeServices.length > 0 ? (
            <div className="client-service-grid">
              {activeServices.map((service) => (
                <ServiceOption
                  key={service.id}
                  service={service}
                  selected={service.id === selectedServiceId}
                  onSelect={() => setSelectedServiceId(service.id)}
                />
              ))}
            </div>
          ) : null}

          <div className="client-professional-section">
            <div className="client-section-heading">
              <span>Paso 2</span>
              <h2>Elegi profesional</h2>
            </div>

            {!selectedService ? (
              <div className="client-empty-state">
                <strong>Primero selecciona un servicio.</strong>
                <p>
                  Despues vamos a mostrar solo los profesionales que realizan ese
                  tratamiento.
                </p>
              </div>
            ) : null}

            {selectedService && professionalsQuery.isLoading ? (
              <div className="client-empty-state">
                <strong>Cargando profesionales...</strong>
                <p>Estamos buscando profesionales compatibles con el servicio.</p>
              </div>
            ) : null}

            {selectedService && professionalsQuery.isError ? (
              <div className="client-empty-state tone-danger">
                <strong>No pudimos cargar profesionales.</strong>
                <p>Proba nuevamente en unos minutos.</p>
              </div>
            ) : null}

            {selectedService &&
            !professionalsQuery.isLoading &&
            !professionalsQuery.isError &&
            activeProfessionals.length === 0 ? (
              <div className="client-empty-state tone-danger">
                <strong>No hay profesionales disponibles para este servicio.</strong>
                <p>Elegi otro servicio o consultanos para coordinar una alternativa.</p>
              </div>
            ) : null}

            {activeProfessionals.length > 0 ? (
              <div className="client-professional-grid">
                {activeProfessionals.map((professional) => (
                  <ProfessionalOption
                    key={professional.id}
                    professional={professional}
                    selected={professional.id === selectedProfessionalId}
                    onSelect={() => setSelectedProfessionalId(professional.id)}
                  />
                ))}
              </div>
            ) : null}
          </div>

          <div className="client-availability-section">
            <div className="client-section-heading">
              <span>Paso 3</span>
              <h2>Elegi un horario</h2>
            </div>

            {!hasAvailabilitySelection ? (
              <div className="client-empty-state">
                <strong>Selecciona servicio y profesional para ver horarios.</strong>
                <p>
                  La disponibilidad se calcula con la agenda real, por eso aparece
                  despues de completar los pasos anteriores.
                </p>
              </div>
            ) : null}

            {hasAvailabilitySelection ? (
              <>
                <div className="client-week-toolbar">
                  <button
                    type="button"
                    onClick={() => setWeekOffset(0)}
                    disabled={weekOffset === 0}
                    aria-label="Ver semana actual"
                  >
                    <ChevronLeft aria-hidden="true" size={18} />
                  </button>
                  <div>
                    <span>Semana visible</span>
                    <strong>{formatWeekRange(weekStart)}</strong>
                  </div>
                  <button
                    type="button"
                    onClick={() => setWeekOffset(1)}
                    disabled={weekOffset === 1}
                    aria-label="Ver semana proxima"
                  >
                    <ChevronRight aria-hidden="true" size={18} />
                  </button>
                </div>

                {isAvailabilityLoading ? (
                  <div className="client-empty-state">
                    <strong>Cargando horarios...</strong>
                    <p>Estamos revisando la semana seleccionada.</p>
                  </div>
                ) : null}

                {isAvailabilityError ? (
                  <div className="client-empty-state tone-danger">
                    <strong>No pudimos cargar la disponibilidad.</strong>
                    <p>Proba nuevamente o elegi otra combinacion.</p>
                  </div>
                ) : null}

                {!isAvailabilityLoading &&
                !isAvailabilityError &&
                availableSlotCount === 0 ? (
                  <div className="client-empty-state">
                    <strong>No hay horarios disponibles esta semana.</strong>
                    <p>Proba con la otra semana visible o consultanos para coordinar.</p>
                  </div>
                ) : null}

                {!isAvailabilityLoading && !isAvailabilityError ? (
                  <div className="client-week-grid" aria-label="Disponibilidad semanal">
                    {weekDays.map((day) => (
                      <DayAvailability
                        key={day.dateKey}
                        day={day}
                        selectedSlot={selectedSlot}
                        slots={availabilityByDay[day.dateKey] ?? []}
                        onSelectSlot={setSelectedSlot}
                      />
                    ))}
                  </div>
                ) : null}
              </>
            ) : null}
          </div>
        </div>

        <aside className="client-next-panel">
          <p className="public-pill">Tu solicitud</p>
          <h2>Resumen inicial</h2>

          {selectedService ? (
            <div className="client-selected-service">
              <span>Servicio seleccionado</span>
              <strong>{selectedService.name}</strong>
              <small>
                {selectedService.durationMinutes} min
                {selectedService.description ? ` - ${selectedService.description}` : ""}
              </small>
            </div>
          ) : (
            <div className="client-empty-summary">
              <CalendarDays aria-hidden="true" size={24} />
              <strong>Selecciona un servicio para continuar.</strong>
              <p>
                Este panel va a mostrar profesional, disponibilidad y horario a
                medida que avances.
              </p>
            </div>
          )}

          {selectedProfessional ? (
            <div className="client-selected-service">
              <span>Profesional seleccionado</span>
              <strong>{selectedProfessional.fullName}</strong>
              <small>{selectedProfessional.email}</small>
            </div>
          ) : null}

          {selectedSlot ? (
            <div className="client-selected-service">
              <span>Horario seleccionado</span>
              <strong>{formatSlotSummary(selectedSlot)}</strong>
              <small>El turno queda pendiente hasta que BIBE lo confirme.</small>
            </div>
          ) : null}

          <div className="client-flow-preview">
            <span className={selectedService ? "is-ready" : ""}>Servicio</span>
            <span className={selectedProfessional ? "is-ready" : ""}>Profesional</span>
            <span className={selectedSlot ? "is-ready" : ""}>Horario</span>
            <span>Confirmacion</span>
          </div>

          <button
            className="client-primary-action"
            type="button"
            disabled={!selectedService || !selectedProfessional || !selectedSlot}
            onClick={() => {
              document
                .querySelector(".client-confirmation-box")
                ?.scrollIntoView({ behavior: "smooth", block: "center" });
            }}
          >
            Revisar solicitud
            <ArrowRight aria-hidden="true" size={18} />
          </button>

          {createdAppointment ? (
            <div className="client-success-box">
              <CheckCircle2 aria-hidden="true" size={24} />
              <div>
                <strong>Turno solicitado correctamente.</strong>
                <p>
                  Quedo pendiente de confirmacion. BIBE va a revisar la solicitud y
                  confirmar el horario.
                </p>
                <small>Solicitud #{createdAppointment.id}</small>
              </div>
              <div className="client-success-actions">
                <Link to="/app/appointments">Ver mis turnos</Link>
                <button type="button" onClick={handleNewRequest}>
                  Solicitar otro turno
                </button>
              </div>
            </div>
          ) : null}

          {selectedService && selectedProfessional && selectedSlot ? (
            <div className="client-confirmation-box">
              <span>Confirmacion</span>
              <strong>Revisa antes de solicitar</strong>
              <dl>
                <div>
                  <dt>Servicio</dt>
                  <dd>{selectedService.name}</dd>
                </div>
                <div>
                  <dt>Profesional</dt>
                  <dd>{selectedProfessional.fullName}</dd>
                </div>
                <div>
                  <dt>Dia y horario</dt>
                  <dd>{formatSlotSummary(selectedSlot)}</dd>
                </div>
              </dl>
              <label className="client-notes-field">
                <span>Notas para BIBE (opcional)</span>
                <textarea
                  maxLength={500}
                  rows={4}
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  placeholder="Contanos si queres agregar alguna aclaracion."
                />
              </label>

              {formError ? <p className="client-form-error">{formError}</p> : null}

              <button
                className="client-primary-action"
                type="button"
                disabled={createMutation.isPending}
                onClick={handleCreateAppointment}
              >
                {createMutation.isPending ? "Solicitando..." : "Solicitar turno"}
                <ArrowRight aria-hidden="true" size={18} />
              </button>
            </div>
          ) : null}
        </aside>
      </div>
    </section>
  );
}

function ServiceOption({
  onSelect,
  selected,
  service,
}: {
  onSelect: () => void;
  selected: boolean;
  service: ServiceCatalogItem;
}) {
  return (
    <button
      className={`client-service-option ${selected ? "is-selected" : ""}`}
      type="button"
      onClick={onSelect}
    >
      <span>
        <Sparkles aria-hidden="true" size={20} />
      </span>
      <strong>{service.name}</strong>
      <p>{service.description || "Tratamiento disponible para solicitar turno."}</p>
      <small>
        <Clock aria-hidden="true" size={14} />
        {service.durationMinutes} minutos
      </small>
    </button>
  );
}

function ProfessionalOption({
  onSelect,
  professional,
  selected,
}: {
  onSelect: () => void;
  professional: Professional;
  selected: boolean;
}) {
  return (
    <button
      className={`client-professional-option ${selected ? "is-selected" : ""}`}
      type="button"
      onClick={onSelect}
    >
      <span>
        <UserRoundCheck aria-hidden="true" size={18} />
      </span>
      <strong>{professional.fullName}</strong>
      <small>{professional.email}</small>
    </button>
  );
}

function DayAvailability({
  day,
  onSelectSlot,
  selectedSlot,
  slots,
}: {
  day: DayModel;
  onSelectSlot: (slot: AvailabilitySlot) => void;
  selectedSlot: AvailabilitySlot | null;
  slots: AvailabilitySlot[];
}) {
  return (
    <section className="client-day-card">
      <div className="client-day-heading">
        <span>{day.shortLabel}</span>
        <strong>{day.label}</strong>
      </div>

      {slots.length === 0 ? (
        <p className="client-day-empty">Sin horarios.</p>
      ) : (
        <div className="client-slot-list">
          {slots.map((slot) => {
            const selected = selectedSlot?.startDateTime === slot.startDateTime;

            return (
              <button
                className={`client-slot-button ${selected ? "is-selected" : ""}`}
                key={slot.startDateTime}
                type="button"
                onClick={() => onSelectSlot(slot)}
              >
                <strong>{formatTime(slot.startDateTime)}</strong>
                <span>{formatTime(slot.endDateTime)}</span>
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}
