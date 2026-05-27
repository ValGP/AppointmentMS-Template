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

export function getServices() {
  return apiRequest<ServiceCatalogItem[]>("/api/services");
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
