import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Edit3, Plus, Power, PowerOff, X } from "lucide-react";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { ApiError } from "../../../shared/api/httpClient";
import { formatCurrency } from "../../../shared/utils/format";
import {
  createService,
  getServices,
  setServiceActive,
  updateService,
  type ServiceCatalogItem,
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

  const servicesQuery = useQuery({
    queryKey: ["services"],
    queryFn: getServices,
  });

  const services = servicesQuery.data ?? [];
  const activeCount = useMemo(
    () => services.filter((service) => service.active).length,
    [services],
  );

  const form = useForm<ServiceFormValues>({
    defaultValues: emptyValues,
  });

  const saveMutation = useMutation({
    mutationFn: (payload: ServicePayload) =>
      editingService
        ? updateService(editingService.id, payload)
        : createService(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["services"] });
      closeForm();
    },
    onError: (error) => {
      setFormError(
        error instanceof ApiError
          ? error.message
          : "No se pudo guardar el servicio.",
      );
    },
  });

  const statusMutation = useMutation({
    mutationFn: ({ active, id }: { active: boolean; id: number }) =>
      setServiceActive(id, active),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["services"] }),
  });

  function openCreateForm() {
    setEditingService(null);
    setFormError(null);
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
    setIsFormOpen(true);
  }

  function closeForm() {
    setEditingService(null);
    setFormError(null);
    form.reset(emptyValues);
    setIsFormOpen(false);
  }

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
        <SummaryCard label="Inactivos" value={services.length - activeCount} />
      </div>

      {isFormOpen ? (
        <article className="admin-card catalog-form-card">
          <div className="card-heading">
            <div>
              <p className="admin-kicker">{editingService ? "Editar" : "Crear"}</p>
              <h3>{editingService ? editingService.name : "Nuevo servicio"}</h3>
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
        </article>
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
        services.length === 0 ? (
          <CatalogState label="Todavia no hay servicios cargados." />
        ) : null}

        {services.length > 0 ? (
          <div className="catalog-table" role="table" aria-label="Servicios">
            <div className="catalog-table-head" role="row">
              <span>Servicio</span>
              <span>Duracion</span>
              <span>Precio</span>
              <span>Estado</span>
              <span>Acciones</span>
            </div>
            {services.map((service) => (
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
                    onClick={() =>
                      statusMutation.mutate({
                        id: service.id,
                        active: !service.active,
                      })
                    }
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
    </section>
  );
}

function SummaryCard({ label, value }: { label: string; value: number }) {
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
