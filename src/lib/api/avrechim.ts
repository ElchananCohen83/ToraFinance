export type MaritalStatus = "SINGLE" | "MARRIED" | "WIDOWED" | "DIVORCED";
export type PersonStatus = "ACTIVE" | "INACTIVE" | "SUSPENDED";

export type AvrechSummary = {
  id: string;
  firstName: string;
  lastName: string;
  nationalId: string;
  phone: string | null;
  address: string | null;
  maritalStatus: MaritalStatus;
  childrenCount: number;
  joinedAt: string;
  status: PersonStatus;
  track: string | null;
  internalNotes: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: {
    attendanceRecords: number;
    documents: number;
    scholarships: number;
  };
};

export type AvrechDetails = AvrechSummary & {
  attendanceRecords: Array<{
    id: string;
    date: string;
    present: boolean;
    notes: string | null;
  }>;
  documents: Array<{
    id: string;
    title: string;
    fileName: string;
    mimeType: string;
    visibleToPortal: boolean;
    createdAt: string;
  }>;
  scholarships: Array<{
    id: string;
    month: number;
    year: number;
    finalAmount: string | number;
    status: string;
  }>;
};

export type AvrechPayload = {
  firstName: string;
  lastName: string;
  nationalId: string;
  phone?: string;
  address?: string;
  maritalStatus: MaritalStatus;
  childrenCount?: number;
  joinedAt: string;
  status?: PersonStatus;
  track?: string;
  internalNotes?: string;
};

export type AvrechimListParams = {
  q?: string;
  status?: PersonStatus | "";
  page?: number;
  pageSize?: number;
};

export type PaginatedAvrechim = {
  data: AvrechSummary[];
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
    const message = Array.isArray(errorBody?.message)
      ? errorBody.message.join(", ")
      : errorBody?.message ?? "הפעולה נכשלה";
    throw new Error(message);
  }

  return response.json() as Promise<T>;
}

export function getAvrechim(params?: AvrechimListParams, signal?: AbortSignal) {
  const search = new URLSearchParams();

  if (params?.q) {
    search.set("q", params.q);
  }

  if (params?.status) {
    search.set("status", params.status);
  }

  if (params?.page) {
    search.set("page", String(params.page));
  }

  if (params?.pageSize) {
    search.set("pageSize", String(params.pageSize));
  }

  const query = search.toString();
  return request<PaginatedAvrechim>(`/api/avrechim${query ? `?${query}` : ""}`, { signal });
}

export function getAvrech(id: string, signal?: AbortSignal) {
  return request<AvrechDetails>(`/api/avrechim/${id}`, { signal });
}

export function createAvrech(payload: AvrechPayload) {
  return request<AvrechSummary>("/api/avrechim", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function updateAvrech(id: string, payload: Partial<AvrechPayload>) {
  return request<AvrechSummary>(`/api/avrechim/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload)
  });
}

export function deleteAvrech(id: string) {
  return request<AvrechSummary>(`/api/avrechim/${id}`, {
    method: "DELETE"
  });
}
