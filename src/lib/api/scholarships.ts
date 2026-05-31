import { AvrechSummary, getAvrechim } from "./avrechim";

export type ScholarshipStatus = "DRAFT" | "APPROVED" | "PAID" | "LOCKED" | "REQUIRES_REVIEW";

export type ScholarshipAttendance = {
  present: number;
  total: number;
  rate: number | null;
  records?: Array<{
    id: string;
    date: string;
    present: boolean;
    notes: string | null;
  }>;
};

export type ScholarshipSummary = {
  id: string;
  avrechId: string;
  avrech: AvrechSummary;
  month: number;
  year: number;
  amount: number;
  baseAmount: number;
  bonusAmount: number;
  deduction: number;
  finalAmount: number;
  status: ScholarshipStatus;
  paidAt: string | null;
  bankBatchId: string | null;
  notes: string | null;
  attendance: ScholarshipAttendance;
  createdAt: string;
  updatedAt: string;
};

export type ScholarshipDetails = ScholarshipSummary & {
  documents: Array<{
    id: string;
    title: string;
    fileName: string;
    mimeType: string;
    visibleToPortal: boolean;
    createdAt: string;
  }>;
};

export type ScholarshipPayload = {
  avrechId: string;
  month: number;
  year: number;
  amount: number;
  status?: ScholarshipStatus;
  notes?: string;
};

export type ScholarshipsListParams = {
  q?: string;
  month?: number | "";
  year?: number | "";
  status?: ScholarshipStatus | "";
  avrechId?: string;
  sortBy?: "updatedAt" | "amount" | "status" | "month" | "year" | "avrechName";
  sortOrder?: "asc" | "desc";
  page?: number;
  pageSize?: number;
};

export type PaginatedScholarships = {
  data: ScholarshipSummary[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      ...init?.headers
    },
    ...init
  });

  if (!response.ok) {
    const errorBody = (await response.json().catch(() => null)) as { message?: string | string[] } | null;
    const message = Array.isArray(errorBody?.message) ? errorBody.message.join(", ") : errorBody?.message ?? "הפעולה נכשלה";
    throw new Error(message);
  }

  return response.json() as Promise<T>;
}

export function getScholarships(params?: ScholarshipsListParams, signal?: AbortSignal) {
  const search = new URLSearchParams();

  Object.entries(params ?? {}).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      search.set(key, String(value));
    }
  });

  const query = search.toString();
  return request<PaginatedScholarships>(`/api/scholarships${query ? `?${query}` : ""}`, { signal });
}

export function getScholarship(id: string, signal?: AbortSignal) {
  return request<ScholarshipDetails>(`/api/scholarships/${id}`, { signal });
}

export function createScholarship(payload: ScholarshipPayload) {
  return request<ScholarshipSummary>("/api/scholarships", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function updateScholarship(id: string, payload: Partial<Pick<ScholarshipPayload, "amount" | "status" | "notes">>) {
  return request<ScholarshipSummary>(`/api/scholarships/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload)
  });
}

export function deleteScholarship(id: string) {
  return request<ScholarshipSummary>(`/api/scholarships/${id}`, {
    method: "DELETE"
  });
}

export async function getAvrechimOptions(signal?: AbortSignal) {
  const result = await getAvrechim({ page: 1, pageSize: 100, status: "ACTIVE" }, signal);
  return result.data;
}
