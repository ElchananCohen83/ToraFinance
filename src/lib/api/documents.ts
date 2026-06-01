export type DocumentOwnerType = "AVRECH" | "DONOR" | "DONATION" | "SCHOLARSHIP" | "USER";

export type RelatedEntity = {
  type: DocumentOwnerType;
  id: string;
  label: string;
} | null;

export type DocumentSummary = {
  id: string;
  fileName: string;
  fileUrl: string;
  mimeType: string;
  size: number | null;
  ownerType: DocumentOwnerType;
  avrechId: string | null;
  donorId: string | null;
  donationId: string | null;
  scholarshipId: string | null;
  title: string;
  storageKey: string;
  createdAt: string;
  updatedAt: string;
  relatedEntity: RelatedEntity;
};

export type DocumentDetails = DocumentSummary & {
  avrech: {
    id: string;
    firstName: string;
    lastName: string;
    nationalId: string;
    phone: string | null;
  } | null;
  donor: {
    id: string;
    fullName: string;
    email: string | null;
    phone: string | null;
  } | null;
  donation: {
    id: string;
    amount: string | number;
    currency: string;
    paymentMethod: string;
    status: string;
    donor: {
      id: string;
      fullName: string;
    };
  } | null;
  scholarship: {
    id: string;
    month: number;
    year: number;
    finalAmount: string | number;
    status: string;
    avrech: {
      id: string;
      firstName: string;
      lastName: string;
    };
  } | null;
};

export type DocumentsListParams = {
  q?: string;
  ownerType?: DocumentOwnerType | "";
  relatedEntityId?: string;
  sortBy?: "createdAt" | "updatedAt" | "fileName" | "mimeType" | "size" | "ownerType";
  sortOrder?: "asc" | "desc";
  page?: number;
  pageSize?: number;
};

export type PaginatedDocuments = {
  data: DocumentSummary[];
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

export function getDocuments(params?: DocumentsListParams, signal?: AbortSignal) {
  const search = new URLSearchParams();

  Object.entries(params ?? {}).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      search.set(key, String(value));
    }
  });

  const query = search.toString();
  return request<PaginatedDocuments>(`/api/documents${query ? `?${query}` : ""}`, { signal });
}

export function getDocument(id: string, signal?: AbortSignal) {
  return request<DocumentDetails>(`/api/documents/${id}`, { signal });
}

