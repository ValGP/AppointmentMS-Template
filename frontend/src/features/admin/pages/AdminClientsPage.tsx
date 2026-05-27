import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Edit3, Plus, Power, PowerOff, X } from "lucide-react";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { ApiError } from "../../../shared/api/httpClient";
import {
  createClient,
  getClients,
  setClientActive,
  updateClient,
  type Client,
  type ClientPayload,
} from "../../clients/api/clientsApi";

type ClientFormValues = {
  fullName: string;
  email: string;
  phone: string;
  password: string;
};

const emptyValues: ClientFormValues = {
  fullName: "",
  email: "",
  phone: "",
  password: "",
};

export function AdminClientsPage() {
  const queryClient = useQueryClient();
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const clientsQuery = useQuery({
    queryKey: ["clients"],
    queryFn: getClients,
  });

  const clients = clientsQuery.data ?? [];
  const activeCount = useMemo(
    () => clients.filter((client) => client.active).length,
    [clients],
  );

  const form = useForm<ClientFormValues>({
    defaultValues: emptyValues,
  });

  const saveMutation = useMutation({
    mutationFn: (payload: ClientPayload) =>
      editingClient ? updateClient(editingClient.id, payload) : createClient(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["clients"] });
      closeForm();
    },
    onError: (error) => {
      setFormError(
        error instanceof ApiError
          ? error.message
          : "No se pudo guardar el cliente.",
      );
    },
  });

  const statusMutation = useMutation({
    mutationFn: ({ active, id }: { active: boolean; id: number }) =>
      setClientActive(id, active),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["clients"] }),
  });

  function openCreateForm() {
    setEditingClient(null);
    setFormError(null);
    form.reset(emptyValues);
    setIsFormOpen(true);
  }

  function openEditForm(client: Client) {
    setEditingClient(client);
    setFormError(null);
    form.reset({
      fullName: client.fullName,
      email: client.email,
      phone: client.phone ?? "",
      password: "",
    });
    setIsFormOpen(true);
  }

  function closeForm() {
    setEditingClient(null);
    setFormError(null);
    form.reset(emptyValues);
    setIsFormOpen(false);
  }

  function onSubmit(values: ClientFormValues) {
    setFormError(null);
    saveMutation.mutate({
      fullName: values.fullName.trim(),
      email: values.email.trim(),
      phone: values.phone.trim() || undefined,
      password: values.password.trim() || undefined,
    });
  }

  return (
    <section className="catalog-page">
      <div className="catalog-header">
        <div>
          <p className="admin-kicker">Catalogos</p>
          <h2>Clientes</h2>
          <p>
            Gestiona las personas que pueden pedir turnos y mantener su cuenta
            activa.
          </p>
        </div>
        <button className="admin-primary-button" type="button" onClick={openCreateForm}>
          <Plus aria-hidden="true" size={16} />
          Nuevo cliente
        </button>
      </div>

      <div className="catalog-summary-grid">
        <SummaryCard label="Clientes" value={clients.length} />
        <SummaryCard label="Activos" value={activeCount} />
        <SummaryCard label="Inactivos" value={clients.length - activeCount} />
      </div>

      {isFormOpen ? (
        <article className="admin-card catalog-form-card">
          <div className="card-heading">
            <div>
              <p className="admin-kicker">{editingClient ? "Editar" : "Crear"}</p>
              <h3>{editingClient ? editingClient.fullName : "Nuevo cliente"}</h3>
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

            <label>
              {editingClient ? "Nueva password" : "Password"}
              <input
                type="password"
                autoComplete="new-password"
                {...form.register("password", {
                  required: editingClient ? false : "Ingresa una password.",
                  validate: (value) => {
                    if (!value && editingClient) {
                      return true;
                    }
                    if (value.length < 8) {
                      return "Minimo 8 caracteres.";
                    }
                    if (value.length > 100) {
                      return "Maximo 100 caracteres.";
                    }
                    return true;
                  },
                })}
              />
              <FieldError message={form.formState.errors.password?.message} />
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
                {saveMutation.isPending ? "Guardando..." : "Guardar cliente"}
              </button>
            </div>
          </form>
        </article>
      ) : null}

      <article className="admin-card catalog-list-card">
        <div className="card-heading">
          <div>
            <p className="admin-kicker">Listado</p>
            <h3>Clientes cargados</h3>
          </div>
        </div>

        {clientsQuery.isLoading ? <CatalogState label="Cargando clientes..." /> : null}
        {clientsQuery.isError ? (
          <CatalogState label="No se pudieron cargar los clientes." />
        ) : null}
        {!clientsQuery.isLoading && !clientsQuery.isError && clients.length === 0 ? (
          <CatalogState label="Todavia no hay clientes cargados." />
        ) : null}

        {clients.length > 0 ? (
          <div className="catalog-table clients-table" role="table" aria-label="Clientes">
            <div className="catalog-table-head" role="row">
              <span>Cliente</span>
              <span>Email</span>
              <span>Telefono</span>
              <span>Alta</span>
              <span>Estado</span>
              <span>Acciones</span>
            </div>
            {clients.map((client) => (
              <div className="catalog-row" role="row" key={client.id}>
                <div className="catalog-main-cell">
                  <strong>{client.fullName}</strong>
                  <span>ID #{client.id}</span>
                </div>
                <span>{client.email}</span>
                <span>{client.phone || "Sin telefono"}</span>
                <span>{formatCreatedAt(client.createdAt)}</span>
                <span
                  className={`status-badge tone-${
                    client.active ? "success" : "muted"
                  }`}
                >
                  {client.active ? "Activo" : "Inactivo"}
                </span>
                <div className="catalog-actions">
                  <button
                    className="icon-button"
                    type="button"
                    onClick={() => openEditForm(client)}
                    aria-label={`Editar ${client.fullName}`}
                  >
                    <Edit3 aria-hidden="true" size={16} />
                  </button>
                  <button
                    className="icon-button"
                    type="button"
                    disabled={statusMutation.isPending}
                    onClick={() =>
                      statusMutation.mutate({
                        id: client.id,
                        active: !client.active,
                      })
                    }
                    aria-label={
                      client.active
                        ? `Desactivar ${client.fullName}`
                        : `Activar ${client.fullName}`
                    }
                  >
                    {client.active ? (
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

function formatCreatedAt(value: string) {
  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
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
