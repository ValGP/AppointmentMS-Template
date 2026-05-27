import { apiRequest } from "../../../shared/api/httpClient";

export type Professional = {
  id: number;
  fullName: string;
  email: string;
  phone: string | null;
  active: boolean;
};

export type ProfessionalPayload = {
  fullName: string;
  email: string;
  phone?: string;
};

export function getProfessionals() {
  return apiRequest<Professional[]>("/api/professionals");
}

export function createProfessional(payload: ProfessionalPayload) {
  return apiRequest<Professional>("/api/professionals", {
    method: "POST",
    body: payload,
  });
}

export function updateProfessional(id: number, payload: ProfessionalPayload) {
  return apiRequest<Professional>(`/api/professionals/${id}`, {
    method: "PUT",
    body: payload,
  });
}

export function setProfessionalActive(id: number, active: boolean) {
  return apiRequest<Professional>(
    `/api/professionals/${id}/${active ? "activate" : "deactivate"}`,
    {
      method: "PATCH",
    },
  );
}
