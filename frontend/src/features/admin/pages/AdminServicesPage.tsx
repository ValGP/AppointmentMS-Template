import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Edit3, Plus, Power, PowerOff } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { ApiError } from "../../../shared/api/httpClient";
import { formatCurrency } from "../../../shared/utils/format";
import { AdminConfirmDialog } from "../components/AdminConfirmDialog";
import { AdminInactiveItemsModal } from "../components/AdminInactiveItemsModal";
import { AdminModal } from "../components/AdminModal";
import { AdminToast } from "../components/AdminToast";
import { useAdminToast } from "../hooks/useAdminToast";
import { getProfessionals } from "../../professionals/api/professionalsApi";
import {
  createService,
  getServiceProfessionalsAssignment,
  getServices,
  setServiceActive,
  updateService,
  updateServiceProfessionalsAssignment,
  type ServiceCatalogItem,
  type ServiceProfessionalAssignmentMode,
  type ServicePayload,
} from "../../services/api/servicesApi";

type ServiceFormValues = {
  name: string;
  description: string;
  durationMinutes: number;
  price: number;
};

const emptyValues: ServiceFormValues = {
  name: "",
  description: "",
  durationMinutes: 30,
  price: 0,
};

export function AdminServicesPage() {
  const queryClient = useQueryClient();
  const [editingService, setEditingService] = useState<ServiceCatalogItem | null>(
    null,
  );
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [assignmentMode, setAssignmentMode] =
    useState<ServiceProfessionalAssignmentMode>("ALL_PROFESSIONALS");
  const [selectedProfessionalIds, setSelectedProfessionalIds] = useState<number[]>(
    [],
  );
  const [statusTarget, setStatusTarget] = useState<ServiceCatalogItem | null>(null);
  const [isInactiveOpen, setIsInactiveOpen] = useState(false);
  const { showToast, toast } = useAdminToast();

  const servicesQuery = useQuery({
    queryKey: ["services"],
    queryFn: () => getServices(),
  });
  const professionalsQuery = useQuery({
    queryKey: ["professionals"],
    queryFn: () => getProfessionals(),
  });
  const assignmentQuery = useQuery({
    queryKey: ["service-professionals-assignment", editingService?.id],
    enabled: isFormOpen && Boolean(editingService),
    queryFn: () => getServiceProfessionalsAssignment(editingService!.id),
  });

  const services = servicesQuery.data ?? [];
  const activeServices = services.filter((service) => service.active);
  const inactiveServices = services.filter((service) => !service.active);
  const professionals = professionalsQuery.data ?? [];
  const activeProfessionals = professionals.filter(
    (professional) => professional.active,
  );
  const activeCount = useMemo(() => activeServices.length, [activeServices.length]);

  const form = useForm<ServiceFormValues>({
    defaultValues: emptyValues,
  });

  const saveMutation = useMutation({
    mutationFn: async (payload: ServicePayload) => {
      if (
        assignmentMode === "SELECTED_PROFESSIONALS" &&
        selectedProfessionalIds.length === 0
      ) {
        throw new Error("Selecciona al menos un profesional.");
      }

      const savedService = editingService
        ? await updateService(editingService.id, payload)
        : await createService(payload);

      await updateServiceProfessionalsAssignment(savedService.id, {
        mode: assignmentMode,
        professionalIds:
          assignmentMode === "SELECTED_PROFESSIONALS"
            ? selectedProfessionalIds
            : [],
      });

      return savedService;
    },
    onSuccess: async () => {
      const message = editingService
        ? "Servicio actualizado."
        : "Servicio creado.";
      await queryClient.invalidateQueries({ queryKey: ["services"] });
      await queryClient.invalidateQueries({ queryKey: ["professionals"] });
      closeForm();
      showToast(message);
    },
    onError: (error) => {
      setFormError(
        error instanceof ApiError || error instanceof Error
          ? error.message
          : "No se pudo guardar el servicio.",
      );
    },
  });

  const statusMutation = useMutation({
    mutationFn: ({ active, id }: { active: boolean; id: number }) =>
      setServiceActive(id, active),
    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({ queryKey: ["services"] });
      setStatusTarget(null);
      showToast(variables.active ? "Servicio reactivado." : "Servicio desactivado.");
    },
  });

  function openCreateForm() {
    setEditingService(null);
    setFormError(null);
    setAssignmentMode("ALL_PROFESSIONALS");
    setSelectedProfessionalIds([]);
    form.reset(emptyValues);
    setIsFormOpen(true);
  }

  function openEditForm(service: ServiceCatalogItem) {
    setEditingService(service);
    setFormError(null);
    form.reset({
      name: service.name,
      description: service.description ?? "",
      durationMinutes: service.durationMinutes,
      price: service.price,
    });
    setAssignmentMode("ALL_PROFESSIONALS");
    setSelectedProfessionalIds([]);
    setIsFormOpen(true);
  }

  function closeForm() {
    setEditingService(null);
    setFormError(null);
    setAssignmentMode("ALL_PROFESSIONALS");
    setSelectedProfessionalIds([]);
    form.reset(emptyValues);
    setIsFormOpen(false);
  }

  useEffect(() => {
    if (!assignmentQuery.data) {
      return;
    }

    setAssignmentMode(assignmentQuery.data.mode);
    setSelectedProfessionalIds(
      assignmentQuery.data.professionals.map((professional) => professional.id),
    );
  }, [assignmentQuery.data]);

  function onSubmit(values: ServiceFormValues) {
    setFormError(null);
    saveMutation.mutate({
      name: values.name.trim(),
      description: values.description.trim() || undefined,
      durationMinutes: Number(values.durationMinutes),
      price: Number(values.price),
    });
  }

  return (
    <section className="catalog-page">
      <AdminToast toast={toast} />
      <div className="catalog-header">
        <div>
          <p className="admin-kicker">Catalogos</p>
          <h2>Servicios</h2>
          <p>
            Carga y ajusta los servicios que despues se usan para turnos y
            disponibilidad.
          </p>
        </div>
        <button className="admin-primary-button" type="button" onClick={openCreateForm}>
          <Plus aria-hidden="true" size={16} />
          Nuevo servicio
        </button>
      </div>

      <div className="catalog-summary-grid">
        <SummaryCard label="Servicios totales" value={services.length} />
        <SummaryCard label="Activos" value={activeCount} />
        <SummaryCard
          label="Inactivos"
          value={inactiveServices.length}
          onClick={() => setIsInactiveOpen(true)}
        />
      </div>

      {isFormOpen ? (
        <AdminModal
          kicker={editingService ? "Editar" : "Crear"}
          title={editingService ? editingService.name : "Nuevo servicio"}
          onClose={closeForm}
        >
          <form className="admin-form-grid" onSubmit={form.handleSubmit(onSubmit)}>
            <label>
              Nombre
              <input
                {...form.register("name", {
                  required: "Ingresa el nombre.",
                  maxLength: {
                    value: 120,
                    message: "Maximo 120 caracteres.",
                  },
                })}
              />
              <FieldError message={form.formState.errors.name?.message} />
            </label>

            <label>
              Duracion en minutos
              <input
                type="number"
                min={1}
                {...form.register("durationMinutes", {
                  required: "Ingresa la duracion.",
                  min: { value: 1, message: "Debe ser mayor a 0." },
                  valueAsNumber: true,
                })}
              />
              <FieldError
                message={form.formState.errors.durationMinutes?.message}
              />
            </label>

            <label>
              Precio
              <input
                type="number"
                min={0}
                step="0.01"
                {...form.register("price", {
                  required: "Ingresa el precio.",
                  min: { value: 0, message: "No puede ser negativo." },
                  valueAsNumber: true,
                })}
              />
              <FieldError message={form.formState.errors.price?.message} />
            </label>

            <label className="form-span-2">
              Descripcion
              <textarea
                rows={3}
                {...form.register("description", {
                  maxLength: {
                    value: 500,
                    message: "Maximo 500 caracteres.",
                  },
                })}
              />
              <FieldError
                message={form.formState.errors.description?.message}
              />
            </label>

            <div className="assignment-panel form-span-2">
              <div>
                <p className="admin-kicker">Profesionales</p>
                <strong>Disponibilidad del servicio</strong>
              </div>
              <div className="segmented-control" role="group">
                <button
                  type="button"
                  className={assignmentMode === "ALL_PROFESSIONALS" ? "active" : ""}
                  onClick={() => setAssignmentMode("ALL_PROFESSIONALS")}
                >
                  Todos
                </button>
                <button
                  type="button"
                  className={
                    assignmentMode === "SELECTED_PROFESSIONALS" ? "active" : ""
                  }
                  onClick={() => setAssignmentMode("SELECTED_PROFESSIONALS")}
                >
                  Seleccionar
                </button>
              </div>
              {assignmentMode === "SELECTED_PROFESSIONALS" ? (
                <Checklist
                  emptyLabel="No hay profesionales activos para asignar."
                  items={activeProfessionals.map((professional) => ({
                    id: professional.id,
                    label: professional.fullName,
                  }))}
                  selectedIds={selectedProfessionalIds}
                  onChange={setSelectedProfessionalIds}
                />
              ) : (
                <p className="assignment-hint">
                  El servicio queda disponible para todos los profesionales activos.
                </p>
              )}
            </div>

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
                {saveMutation.isPending ? "Guardando..." : "Guardar servicio"}
              </button>
            </div>
          </form>
        </AdminModal>
      ) : null}

      <article className="admin-card catalog-list-card">
        <div className="card-heading">
          <div>
            <p className="admin-kicker">Listado</p>
            <h3>Servicios cargados</h3>
          </div>
        </div>

        {servicesQuery.isLoading ? (
          <CatalogState label="Cargando servicios..." />
        ) : null}
        {servicesQuery.isError ? (
          <CatalogState label="No se pudieron cargar los servicios." />
        ) : null}
        {!servicesQuery.isLoading &&
        !servicesQuery.isError &&
        activeServices.length === 0 ? (
          <CatalogState label="No hay servicios activos cargados." />
        ) : null}

        {activeServices.length > 0 ? (
          <div className="catalog-table" role="table" aria-label="Servicios">
            <div className="catalog-table-head" role="row">
              <span>Servicio</span>
              <span>Duracion</span>
              <span>Precio</span>
              <span>Estado</span>
              <span>Acciones</span>
            </div>
            {activeServices.map((service) => (
              <div className="catalog-row" role="row" key={service.id}>
                <div className="catalog-main-cell">
                  <strong>{service.name}</strong>
                  <span>{service.description || "Sin descripcion"}</span>
                </div>
                <span>{service.durationMinutes} min</span>
                <span>{formatCurrency(service.price)}</span>
                <span
                  className={`status-badge tone-${
                    service.active ? "success" : "muted"
                  }`}
                >
                  {service.active ? "Activo" : "Inactivo"}
                </span>
                <div className="catalog-actions">
                  <button
                    className="icon-button"
                    type="button"
                    onClick={() => openEditForm(service)}
                    aria-label={`Editar ${service.name}`}
                  >
                    <Edit3 aria-hidden="true" size={16} />
                  </button>
                  <button
                    className="icon-button"
                    type="button"
                    disabled={statusMutation.isPending}
                    onClick={() => setStatusTarget(service)}
                    aria-label={
                      service.active
                        ? `Desactivar ${service.name}`
                        : `Activar ${service.name}`
                    }
                  >
                    {service.active ? (
                      <PowerOff aria-hidden="true" size={16} />
                    ) : (
                      <Power aria-hidden="true" size={16} />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </article>
      {statusTarget ? (
        <AdminConfirmDialog
          title={statusTarget.active ? "Desactivar servicio" : "Reactivar servicio"}
          message={
            statusTarget.active
              ? `El servicio ${statusTarget.name} no podra usarse para nuevos turnos mientras este inactivo. El historial no se borra.`
              : `El servicio ${statusTarget.name} volvera a estar disponible segun sus profesionales asignados.`
          }
          confirmLabel={statusTarget.active ? "Desactivar" : "Reactivar"}
          tone={statusTarget.active ? "danger" : "primary"}
          isPending={statusMutation.isPending}
          onCancel={() => setStatusTarget(null)}
          onConfirm={() =>
            statusMutation.mutate({
              id: statusTarget.id,
              active: !statusTarget.active,
            })
          }
        />
      ) : null}
      {isInactiveOpen ? (
        <AdminInactiveItemsModal
          title="Servicios inactivos"
          emptyLabel="No hay servicios inactivos."
          items={inactiveServices.map((service) => ({
            id: service.id,
            title: service.name,
            description: service.description || `${service.durationMinutes} min`,
          }))}
          onClose={() => setIsInactiveOpen(false)}
          onReactivate={(id) => {
            const service = inactiveServices.find((item) => item.id === id);
            if (service) {
              setStatusTarget(service);
            }
          }}
        />
      ) : null}
    </section>
  );
}

function SummaryCard({
  label,
  onClick,
  value,
}: {
  label: string;
  onClick?: () => void;
  value: number;
}) {
  if (onClick) {
    return (
      <button
        className="admin-card catalog-summary-card is-action"
        type="button"
        onClick={onClick}
      >
        <span>{label}</span>
        <strong>{value}</strong>
      </button>
    );
  }

  return (
    <article className="admin-card catalog-summary-card">
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}

function FieldError({ message }: { message?: string }) {
  return message ? <span className="field-error">{message}</span> : null;
}

function CatalogState({ label }: { label: string }) {
  return <div className="dashboard-state">{label}</div>;
}

function Checklist({
  emptyLabel,
  items,
  onChange,
  selectedIds,
}: {
  emptyLabel: string;
  items: Array<{ id: number; label: string }>;
  onChange: (ids: number[]) => void;
  selectedIds: number[];
}) {
  if (items.length === 0) {
    return <p className="assignment-hint">{emptyLabel}</p>;
  }

  return (
    <div className="assignment-checklist">
      {items.map((item) => {
        const checked = selectedIds.includes(item.id);
        return (
          <label key={item.id}>
            <input
              type="checkbox"
              checked={checked}
              onChange={() =>
                onChange(
                  checked
                    ? selectedIds.filter((id) => id !== item.id)
                    : [...selectedIds, item.id],
                )
              }
            />
            <span>{item.label}</span>
          </label>
        );
      })}
    </div>
  );
}
