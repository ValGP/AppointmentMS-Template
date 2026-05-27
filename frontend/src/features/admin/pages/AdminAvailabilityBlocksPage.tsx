import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Edit3, Plus, Power, PowerOff, X } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { ApiError } from "../../../shared/api/httpClient";
import { formatShortDateTime } from "../../../shared/utils/date";
import {
  createAvailabilityBlock,
  getAvailabilityBlocks,
  setAvailabilityBlockActive,
  updateAvailabilityBlock,
  type AvailabilityBlock,
  type AvailabilityBlockPayload,
  type AvailabilityBlockType,
} from "../../availability-blocks/api/availabilityBlocksApi";
import { getProfessionals } from "../../professionals/api/professionalsApi";

const blockTypes: Array<{ label: string; value: AvailabilityBlockType }> = [
  { label: "Vacaciones", value: "VACATION" },
  { label: "Licencia medica", value: "SICK_LEAVE" },
  { label: "Feriado", value: "HOLIDAY" },
  { label: "Bloqueo manual", value: "MANUAL_BLOCK" },
  { label: "Otro", value: "OTHER" },
];

const blockTypeLabels = Object.fromEntries(
  blockTypes.map((type) => [type.value, type.label]),
);

type AvailabilityBlockFormValues = {
  professionalId: number;
  startDateTime: string;
  endDateTime: string;
  reason: string;
  type: AvailabilityBlockType;
};

function toInputDateTime(value: string) {
  return value.slice(0, 16);
}

export function AdminAvailabilityBlocksPage() {
  const queryClient = useQueryClient();
  const [editingItem, setEditingItem] = useState<AvailabilityBlock | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const blocksQuery = useQuery({
    queryKey: ["availability-blocks"],
    queryFn: getAvailabilityBlocks,
  });
  const professionalsQuery = useQuery({
    queryKey: ["professionals"],
    queryFn: getProfessionals,
  });

  const blocks = blocksQuery.data ?? [];
  const professionals = professionalsQuery.data ?? [];

  const form = useForm<AvailabilityBlockFormValues>({
    defaultValues: {
      professionalId: 0,
      startDateTime: "",
      endDateTime: "",
      reason: "",
      type: "MANUAL_BLOCK",
    },
  });

  const saveMutation = useMutation({
    mutationFn: (payload: AvailabilityBlockPayload) =>
      editingItem
        ? updateAvailabilityBlock(editingItem.id, payload)
        : createAvailabilityBlock(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["availability-blocks"] });
      closeForm();
    },
    onError: (error) =>
      setFormError(
        error instanceof ApiError
          ? error.message
          : "No se pudo guardar el bloqueo.",
      ),
  });

  const statusMutation = useMutation({
    mutationFn: ({ active, id }: { active: boolean; id: number }) =>
      setAvailabilityBlockActive(id, active),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["availability-blocks"] }),
  });

  function openCreateForm() {
    setEditingItem(null);
    setFormError(null);
    form.reset({
      professionalId: professionals[0]?.id ?? 0,
      startDateTime: "",
      endDateTime: "",
      reason: "",
      type: "MANUAL_BLOCK",
    });
    setIsFormOpen(true);
  }

  function openEditForm(item: AvailabilityBlock) {
    setEditingItem(item);
    setFormError(null);
    form.reset({
      professionalId: item.professionalId,
      startDateTime: toInputDateTime(item.startDateTime),
      endDateTime: toInputDateTime(item.endDateTime),
      reason: item.reason ?? "",
      type: item.type,
    });
    setIsFormOpen(true);
  }

  function closeForm() {
    setEditingItem(null);
    setFormError(null);
    setIsFormOpen(false);
  }

  function onSubmit(values: AvailabilityBlockFormValues) {
    setFormError(null);
    saveMutation.mutate({
      professionalId: Number(values.professionalId),
      startDateTime: values.startDateTime,
      endDateTime: values.endDateTime,
      reason: values.reason.trim() || undefined,
      type: values.type,
    });
  }

  return (
    <section className="catalog-page">
      <div className="catalog-header">
        <div>
          <p className="admin-kicker">Agenda</p>
          <h2>Bloqueos</h2>
          <p>Registra vacaciones, licencias, feriados o bloqueos manuales.</p>
        </div>
        <button
          className="admin-primary-button"
          type="button"
          onClick={openCreateForm}
          disabled={professionals.length === 0}
        >
          <Plus aria-hidden="true" size={16} />
          Nuevo bloqueo
        </button>
      </div>

      {isFormOpen ? (
        <article className="admin-card catalog-form-card">
          <div className="card-heading">
            <div>
              <p className="admin-kicker">{editingItem ? "Editar" : "Crear"}</p>
              <h3>{editingItem ? "Editar bloqueo" : "Nuevo bloqueo"}</h3>
            </div>
            <button className="icon-button" type="button" onClick={closeForm} aria-label="Cerrar formulario">
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
              Tipo
              <select {...form.register("type")}>
                {blockTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Inicio
              <input
                type="datetime-local"
                {...form.register("startDateTime", {
                  required: "Ingresa inicio.",
                })}
              />
              <FieldError message={form.formState.errors.startDateTime?.message} />
            </label>

            <label>
              Fin
              <input
                type="datetime-local"
                {...form.register("endDateTime", {
                  required: "Ingresa fin.",
                })}
              />
              <FieldError message={form.formState.errors.endDateTime?.message} />
            </label>

            <label className="form-span-2">
              Motivo
              <textarea
                rows={3}
                {...form.register("reason", {
                  maxLength: {
                    value: 300,
                    message: "Maximo 300 caracteres.",
                  },
                })}
              />
              <FieldError message={form.formState.errors.reason?.message} />
            </label>

            {formError ? <div className="admin-form-error">{formError}</div> : null}

            <div className="form-actions">
              <button className="admin-soft-button" type="button" onClick={closeForm}>
                Cancelar
              </button>
              <button className="admin-primary-button" type="submit" disabled={saveMutation.isPending}>
                {saveMutation.isPending ? "Guardando..." : "Guardar bloqueo"}
              </button>
            </div>
          </form>
        </article>
      ) : null}

      <article className="admin-card catalog-list-card">
        <div className="card-heading">
          <div>
            <p className="admin-kicker">Listado</p>
            <h3>Bloqueos cargados</h3>
          </div>
        </div>

        {blocksQuery.isLoading ? <CatalogState label="Cargando bloqueos..." /> : null}
        {blocksQuery.isError ? <CatalogState label="No se pudieron cargar los bloqueos." /> : null}
        {!blocksQuery.isLoading && !blocksQuery.isError && blocks.length === 0 ? (
          <CatalogState label="Todavia no hay bloqueos cargados." />
        ) : null}

        {blocks.length > 0 ? (
          <div className="catalog-table availability-blocks-table">
            <div className="catalog-table-head">
              <span>Profesional</span>
              <span>Tipo</span>
              <span>Inicio</span>
              <span>Fin</span>
              <span>Estado</span>
              <span>Acciones</span>
            </div>
            {blocks.map((item) => (
              <div className="catalog-row" key={item.id}>
                <div className="catalog-main-cell">
                  <strong>{item.professionalName}</strong>
                  <span>{item.reason || "Sin motivo"}</span>
                </div>
                <span>{blockTypeLabels[item.type]}</span>
                <span>{formatShortDateTime(item.startDateTime)}</span>
                <span>{formatShortDateTime(item.endDateTime)}</span>
                <span className={`status-badge tone-${item.active ? "success" : "muted"}`}>
                  {item.active ? "Activo" : "Inactivo"}
                </span>
                <div className="catalog-actions">
                  <button className="icon-button" type="button" onClick={() => openEditForm(item)} aria-label={`Editar bloqueo ${item.id}`}>
                    <Edit3 aria-hidden="true" size={16} />
                  </button>
                  <button
                    className="icon-button"
                    type="button"
                    disabled={statusMutation.isPending}
                    onClick={() => statusMutation.mutate({ id: item.id, active: !item.active })}
                    aria-label={item.active ? `Desactivar bloqueo ${item.id}` : `Activar bloqueo ${item.id}`}
                  >
                    {item.active ? <PowerOff aria-hidden="true" size={16} /> : <Power aria-hidden="true" size={16} />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </article>
    </section>
  );
}

function FieldError({ message }: { message?: string }) {
  return message ? <span className="field-error">{message}</span> : null;
}

function CatalogState({ label }: { label: string }) {
  return <div className="dashboard-state">{label}</div>;
}
