import { apiRequest } from "../../../shared/api/httpClient";
import { type PageResponse } from "../../../shared/types/page";

export type AppointmentStatus =
  | "PENDING"
  | "CONFIRMED"
  | "REJECTED"
  | "CANCELED_BY_CLIENT"
  | "CANCELED_BY_ADMIN"
  | "COMPLETED"
  | "NO_SHOW";

export type Appointment = {
  id: number;
  clientId: number;
  clientName: string;
  professionalId: number;
  professionalName: string;
  serviceId: number;
  serviceName: string;
  startDateTime: string;
  endDateTime: string;
  status: AppointmentStatus;
  notes?: string | null;
  cancelReason?: string | null;
  rejectionReason?: string | null;
  createdByRole: "ADMIN" | "CLIENT";
  confirmedAt?: string | null;
  canceledAt?: string | null;
  completedAt?: string | null;
  noShowAt?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AppointmentSearchParams = {
  from?: string;
  to?: string;
  page?: number;
  size?: number;
  sort?: string;
};

export function getAppointments(params: AppointmentSearchParams = {}) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) {
      searchParams.set(key, String(value));
    }
  });

  const query = searchParams.toString();
  return apiRequest<PageResponse<Appointment>>(
    `/api/appointments${query ? `?${query}` : ""}`,
  );
}
