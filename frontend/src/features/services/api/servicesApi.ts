import { apiRequest } from "../../../shared/api/httpClient";

export type ServiceCatalogItem = {
  id: number;
  name: string;
  description: string | null;
  durationMinutes: number;
  price: number;
  active: boolean;
};

export type ServicePayload = {
  name: string;
  description?: string;
  durationMinutes: number;
  price: number;
};

export type ServiceSearchParams = {
  professionalId?: number;
};

export type ServiceProfessionalAssignmentMode =
  | "ALL_PROFESSIONALS"
  | "SELECTED_PROFESSIONALS";

export type ServiceProfessionalsAssignment = {
  serviceId: number;
  mode: ServiceProfessionalAssignmentMode;
  professionals: Array<{
    id: number;
    fullName: string;
    active: boolean;
    serviceAssignmentMode: string;
  }>;
};

export type ServiceProfessionalsAssignmentPayload = {
  mode: ServiceProfessionalAssignmentMode;
  professionalIds: number[];
};

export function getServices(params: ServiceSearchParams = {}) {
  const searchParams = new URLSearchParams();

  if (params.professionalId !== undefined) {
    searchParams.set("professionalId", String(params.professionalId));
  }

  const query = searchParams.toString();
  return apiRequest<ServiceCatalogItem[]>(`/api/services${query ? `?${query}` : ""}`);
}

export function createService(payload: ServicePayload) {
  return apiRequest<ServiceCatalogItem>("/api/services", {
    method: "POST",
    body: payload,
  });
}

export function updateService(id: number, payload: ServicePayload) {
  return apiRequest<ServiceCatalogItem>(`/api/services/${id}`, {
    method: "PUT",
    body: payload,
  });
}

export function setServiceActive(id: number, active: boolean) {
  return apiRequest<ServiceCatalogItem>(
    `/api/services/${id}/${active ? "activate" : "deactivate"}`,
    {
      method: "PATCH",
    },
  );
}

export function getServiceProfessionalsAssignment(id: number) {
  return apiRequest<ServiceProfessionalsAssignment>(
    `/api/services/${id}/professionals`,
  );
}

export function updateServiceProfessionalsAssignment(
  id: number,
  payload: ServiceProfessionalsAssignmentPayload,
) {
  return apiRequest<ServiceProfessionalsAssignment>(
    `/api/services/${id}/professionals`,
    {
      method: "PUT",
      body: payload,
    },
  );
}
