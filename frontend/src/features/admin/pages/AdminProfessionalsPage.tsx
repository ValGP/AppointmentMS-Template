import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Edit3, Plus, Power, PowerOff, X } from "lucide-react";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { ApiError } from "../../../shared/api/httpClient";
import {
  createProfessional,
  getProfessionals,
  setProfessionalActive,
  updateProfessional,
  type Professional,
  type ProfessionalPayload,
} from "../../professionals/api/professionalsApi";

type ProfessionalFormValues = {
  fullName: string;
  email: string;
  phone: string;
};

const emptyValues: ProfessionalFormValues = {
  fullName: "",
  email: "",
  phone: "",
};

export function AdminProfessionalsPage() {
  const queryClient = useQueryClient();
  const [editingProfessional, setEditingProfessional] =
    useState<Professional | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const professionalsQuery = useQuery({
    queryKey: ["professionals"],
    queryFn: getProfessionals,
  });

  const professionals = professionalsQuery.data ?? [];
  const activeCount = useMemo(
    () =>
      professionals.filter((professional) => professional.active).length,
    [professionals],
  );

  const form = useForm<ProfessionalFormValues>({
    defaultValues: emptyValues,
  });

  const saveMutation = useMutation({
    mutationFn: (payload: ProfessionalPayload) =>
      editingProfessional
        ? updateProfessional(editingProfessional.id, payload)
        : createProfessional(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["professionals"] });
      closeForm();
    },
    onError: (error) => {
      setFormError(
        error instanceof ApiError
          ? error.message
          : "No se pudo guardar el profesional.",
      );
    },
  });

  const statusMutation = useMutation({
    mutationFn: ({ active, id }: { active: boolean; id: number }) =>
      setProfessionalActive(id, active),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["professionals"] }),
  });

  function openCreateForm() {
    setEditingProfessional(null);
    setFormError(null);
    form.reset(emptyValues);
    setIsFormOpen(true);
  }

  function openEditForm(professional: Professional) {
    setEditingProfessional(professional);
    setFormError(null);
    form.reset({
      fullName: professional.fullName,
      email: professional.email,
      phone: professional.phone ?? "",
    });
    setIsFormOpen(true);
  }

  function closeForm() {
    setEditingProfessional(null);
    setFormError(null);
    form.reset(emptyValues);
    setIsFormOpen(false);
  }

  function onSubmit(values: ProfessionalFormValues) {
    setFormError(null);
    saveMutation.mutate({
      fullName: values.fullName.trim(),
      email: values.email.trim(),
      phone: values.phone.trim() || undefined,
    });
  }

  return (
    <section className="catalog-page">
      <div className="catalog-header">
        <div>
          <p className="admin-kicker">Catalogos</p>
          <h2>Profesionales</h2>
          <p>
            Administra el equipo que atiende turnos y despues recibira horarios
            y bloqueos.
          </p>
        </div>
        <button className="admin-primary-button" type="button" onClick={openCreateForm}>
          <Plus aria-hidden="true" size={16} />
          Nuevo profesional
        </button>
      </div>

      <div className="catalog-summary-grid">
        <SummaryCard label="Profesionales" value={professionals.length} />
        <SummaryCard label="Activos" value={activeCount} />
        <SummaryCard label="Inactivos" value={professionals.length - activeCount} />
      </div>

      {isFormOpen ? (
        <article className="admin-card catalog-form-card">
          <div className="card-heading">
            <div>
              <p className="admin-kicker">
                {editingProfessional ? "Editar" : "Crear"}
              </p>
              <h3>
                {editingProfessional
                  ? editingProfessional.fullName
                  : "Nuevo profesional"}
              </h3>
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
              Nombre completo
              <input
                {...form.register("fullName", {
                  required: "Ingresa el nombre.",
                  maxLength: {
                    value: 120,
                    message: "Maximo 120 caracteres.",
                  },
                })}
              />
              <FieldError message={form.formState.errors.fullName?.message} />
            </label>

            <label>
              Email
              <input
                type="email"
                {...form.register("email", {
                  required: "Ingresa el email.",
                  maxLength: {
                    value: 160,
                    message: "Maximo 160 caracteres.",
                  },
                })}
              />
              <FieldError message={form.formState.errors.email?.message} />
            </label>

            <label>
              Telefono
              <input
                {...form.register("phone", {
                  maxLength: {
                    value: 40,
                    message: "Maximo 40 caracteres.",
                  },
                })}
              />
              <FieldError message={form.formState.errors.phone?.message} />
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
                {saveMutation.isPending
                  ? "Guardando..."
                  : "Guardar profesional"}
              </button>
            </div>
          </form>
        </article>
      ) : null}

      <article className="admin-card catalog-list-card">
        <div className="card-heading">
          <div>
            <p className="admin-kicker">Listado</p>
            <h3>Profesionales cargados</h3>
          </div>
        </div>

        {professionalsQuery.isLoading ? (
          <CatalogState label="Cargando profesionales..." />
        ) : null}
        {professionalsQuery.isError ? (
          <CatalogState label="No se pudieron cargar los profesionales." />
        ) : null}
        {!professionalsQuery.isLoading &&
        !professionalsQuery.isError &&
        professionals.length === 0 ? (
          <CatalogState label="Todavia no hay profesionales cargados." />
        ) : null}

        {professionals.length > 0 ? (
          <div
            className="catalog-table professionals-table"
            role="table"
            aria-label="Profesionales"
          >
            <div className="catalog-table-head" role="row">
              <span>Profesional</span>
              <span>Email</span>
              <span>Telefono</span>
              <span>Estado</span>
              <span>Acciones</span>
            </div>
            {professionals.map((professional) => (
              <div className="catalog-row" role="row" key={professional.id}>
                <div className="catalog-main-cell">
                  <strong>{professional.fullName}</strong>
                  <span>ID #{professional.id}</span>
                </div>
                <span>{professional.email}</span>
                <span>{professional.phone || "Sin telefono"}</span>
                <span
                  className={`status-badge tone-${
                    professional.active ? "success" : "muted"
                  }`}
                >
                  {professional.active ? "Activo" : "Inactivo"}
                </span>
                <div className="catalog-actions">
                  <button
                    className="icon-button"
                    type="button"
                    onClick={() => openEditForm(professional)}
                    aria-label={`Editar ${professional.fullName}`}
                  >
                    <Edit3 aria-hidden="true" size={16} />
                  </button>
                  <button
                    className="icon-button"
                    type="button"
                    disabled={statusMutation.isPending}
                    onClick={() =>
                      statusMutation.mutate({
                        id: professional.id,
                        active: !professional.active,
                      })
                    }
                    aria-label={
                      professional.active
                        ? `Desactivar ${professional.fullName}`
                        : `Activar ${professional.fullName}`
                    }
                  >
                    {professional.active ? (
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
