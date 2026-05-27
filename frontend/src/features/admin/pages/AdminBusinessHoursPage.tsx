import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Edit3, Plus, Power, PowerOff, X } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { ApiError } from "../../../shared/api/httpClient";
import {
  createBusinessHours,
  getBusinessHours,
  setBusinessHoursActive,
  updateBusinessHours,
  type BusinessHours,
  type BusinessHoursPayload,
  type DayOfWeek,
} from "../../business-hours/api/businessHoursApi";
import { getProfessionals } from "../../professionals/api/professionalsApi";

const days: Array<{ label: string; value: DayOfWeek }> = [
  { label: "Lunes", value: "MONDAY" },
  { label: "Martes", value: "TUESDAY" },
  { label: "Miercoles", value: "WEDNESDAY" },
  { label: "Jueves", value: "THURSDAY" },
  { label: "Viernes", value: "FRIDAY" },
  { label: "Sabado", value: "SATURDAY" },
  { label: "Domingo", value: "SUNDAY" },
];

const dayLabels = Object.fromEntries(days.map((day) => [day.value, day.label]));

type BusinessHoursFormValues = {
  professionalId: number;
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
};

export function AdminBusinessHoursPage() {
  const queryClient = useQueryClient();
  const [editingItem, setEditingItem] = useState<BusinessHours | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const hoursQuery = useQuery({
    queryKey: ["business-hours"],
    queryFn: getBusinessHours,
  });
  const professionalsQuery = useQuery({
    queryKey: ["professionals"],
    queryFn: getProfessionals,
  });

  const hours = hoursQuery.data ?? [];
  const professionals = professionalsQuery.data ?? [];

  const form = useForm<BusinessHoursFormValues>({
    defaultValues: {
      professionalId: 0,
      dayOfWeek: "MONDAY",
      startTime: "09:00",
      endTime: "17:00",
    },
  });

  const saveMutation = useMutation({
    mutationFn: (payload: BusinessHoursPayload) =>
      editingItem
        ? updateBusinessHours(editingItem.id, payload)
        : createBusinessHours(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["business-hours"] });
      closeForm();
    },
    onError: (error) =>
      setFormError(
        error instanceof ApiError
          ? error.message
          : "No se pudo guardar el horario.",
      ),
  });

  const statusMutation = useMutation({
    mutationFn: ({ active, id }: { active: boolean; id: number }) =>
      setBusinessHoursActive(id, active),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["business-hours"] }),
  });

  function openCreateForm() {
    setEditingItem(null);
    setFormError(null);
    form.reset({
      professionalId: professionals[0]?.id ?? 0,
      dayOfWeek: "MONDAY",
      startTime: "09:00",
      endTime: "17:00",
    });
    setIsFormOpen(true);
  }

  function openEditForm(item: BusinessHours) {
    setEditingItem(item);
    setFormError(null);
    form.reset({
      professionalId: item.professionalId,
      dayOfWeek: item.dayOfWeek,
      startTime: item.startTime.slice(0, 5),
      endTime: item.endTime.slice(0, 5),
    });
    setIsFormOpen(true);
  }

  function closeForm() {
    setEditingItem(null);
    setFormError(null);
    setIsFormOpen(false);
  }

  function onSubmit(values: BusinessHoursFormValues) {
    setFormError(null);
    saveMutation.mutate({
      professionalId: Number(values.professionalId),
      dayOfWeek: values.dayOfWeek,
      startTime: values.startTime,
      endTime: values.endTime,
    });
  }

  return (
    <section className="catalog-page">
      <div className="catalog-header">
        <div>
          <p className="admin-kicker">Agenda</p>
          <h2>Horarios laborales</h2>
          <p>Define los dias y rangos en los que cada profesional atiende.</p>
        </div>
        <button
          className="admin-primary-button"
          type="button"
          onClick={openCreateForm}
          disabled={professionals.length === 0}
        >
          <Plus aria-hidden="true" size={16} />
          Nuevo horario
        </button>
      </div>

      {isFormOpen ? (
        <article className="admin-card catalog-form-card">
          <div className="card-heading">
            <div>
              <p className="admin-kicker">{editingItem ? "Editar" : "Crear"}</p>
              <h3>{editingItem ? "Editar horario" : "Nuevo horario"}</h3>
            </div>
            <button
              className="icon-button"
              type="button"
              onClick={closeForm}
              aria-label="Cerrar formulario"
            >
              <X aria-hidden="true" size={18} />
            </button>
          </div>

          <form className="admin-form-grid" onSubmit={form.handleSubmit(onSubmit)}>
            <label>
              Profesional
              <select
                {...form.register("professionalId", {
                  required: "Selecciona un profesional.",
                  valueAsNumber: true,
                  min: { value: 1, message: "Selecciona un profesional." },
                })}
              >
                <option value={0}>Seleccionar</option>
                {professionals.map((professional) => (
                  <option key={professional.id} value={professional.id}>
                    {professional.fullName}
                  </option>
                ))}
              </select>
              <FieldError message={form.formState.errors.professionalId?.message} />
            </label>

            <label>
              Dia
              <select {...form.register("dayOfWeek")}>
                {days.map((day) => (
                  <option key={day.value} value={day.value}>
                    {day.label}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Inicio
              <input type="time" {...form.register("startTime", { required: true })} />
            </label>

            <label>
              Fin
              <input type="time" {...form.register("endTime", { required: true })} />
            </label>

            {formError ? <div className="admin-form-error">{formError}</div> : null}

            <div className="form-actions">
              <button className="admin-soft-button" type="button" onClick={closeForm}>
                Cancelar
              </button>
              <button
                className="admin-primary-button"
                type="submit"
                disabled={saveMutation.isPending}
              >
                {saveMutation.isPending ? "Guardando..." : "Guardar horario"}
              </button>
            </div>
          </form>
        </article>
      ) : null}

      <article className="admin-card catalog-list-card">
        <div className="card-heading">
          <div>
            <p className="admin-kicker">Listado</p>
            <h3>Horarios cargados</h3>
          </div>
        </div>

        {hoursQuery.isLoading ? <CatalogState label="Cargando horarios..." /> : null}
        {hoursQuery.isError ? (
          <CatalogState label="No se pudieron cargar los horarios." />
        ) : null}
        {!hoursQuery.isLoading && !hoursQuery.isError && hours.length === 0 ? (
          <CatalogState label="Todavia no hay horarios cargados." />
        ) : null}

        {hours.length > 0 ? (
          <div className="catalog-table business-hours-table">
            <div className="catalog-table-head">
              <span>Profesional</span>
              <span>Dia</span>
              <span>Horario</span>
              <span>Estado</span>
              <span>Acciones</span>
            </div>
            {hours.map((item) => (
              <div className="catalog-row" key={item.id}>
                <div className="catalog-main-cell">
                  <strong>{item.professionalName}</strong>
                  <span>ID #{item.id}</span>
                </div>
                <span>{dayLabels[item.dayOfWeek]}</span>
                <span>
                  {item.startTime.slice(0, 5)} - {item.endTime.slice(0, 5)}
                </span>
                <span className={`status-badge tone-${item.active ? "success" : "muted"}`}>
                  {item.active ? "Activo" : "Inactivo"}
                </span>
                <CatalogActions
                  active={item.active}
                  disabled={statusMutation.isPending}
                  label={item.professionalName}
                  onEdit={() => openEditForm(item)}
                  onToggle={() =>
                    statusMutation.mutate({ id: item.id, active: !item.active })
                  }
                />
              </div>
            ))}
          </div>
        ) : null}
      </article>
    </section>
  );
}

function CatalogActions({
  active,
  disabled,
  label,
  onEdit,
  onToggle,
}: {
  active: boolean;
  disabled: boolean;
  label: string;
  onEdit: () => void;
  onToggle: () => void;
}) {
  return (
    <div className="catalog-actions">
      <button className="icon-button" type="button" onClick={onEdit} aria-label={`Editar ${label}`}>
        <Edit3 aria-hidden="true" size={16} />
      </button>
      <button
        className="icon-button"
        type="button"
        disabled={disabled}
        onClick={onToggle}
        aria-label={active ? `Desactivar ${label}` : `Activar ${label}`}
      >
        {active ? <PowerOff aria-hidden="true" size={16} /> : <Power aria-hidden="true" size={16} />}
      </button>
    </div>
  );
}

function FieldError({ message }: { message?: string }) {
  return message ? <span className="field-error">{message}</span> : null;
}

function CatalogState({ label }: { label: string }) {
  return <div className="dashboard-state">{label}</div>;
}
