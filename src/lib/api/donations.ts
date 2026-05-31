export type DonationStatus = "PLEDGED" | "PAID" | "FAILED" | "CANCELLED";
export type PaymentMethod = "CASH" | "CREDIT_CARD" | "BANK_TRANSFER" | "CHECK" | "STANDING_ORDER";

export type DonorSummary = {
  id: string;
  fullName: string;
  email: string | null;
  phone: string | null;
  country: string | null;
  city: string | null;
};

export type ReceiptSummary = {
  id: string;
  number: string;
  status: string;
  issuedAt: string | null;
  sentAt: string | null;
  fileUrl: string | null;
};

export type DonationSummary = {
  id: string;
  donorId: string;
  donor: DonorSummary;
  amount: string | number;
  currency: string;
  paymentMethod: PaymentMethod;
  status: DonationStatus;
  campaign: string | null;
  pledgeDueDate: string | null;
  paidAt: string | null;
  receipt: ReceiptSummary | null;
  createdAt: string;
  updatedAt: string;
};

export type DonationDetails = DonationSummary;

export type DonationPayload = {
  donorId: string;
  amount: number;
  currency?: string;
  paymentMethod: PaymentMethod;
  status?: DonationStatus;
  campaign?: string;
};

export type DonationsListParams = {
  q?: string;
  status?: DonationStatus | "";
  paymentMethod?: PaymentMethod | "";
  currency?: string;
  donorId?: string;
  sortBy?: "createdAt" | "amount" | "status" | "paymentMethod" | "donorName";
  sortOrder?: "asc" | "desc";
  page?: number;
  pageSize?: number;
};

export type PaginatedDonations = {
  data: DonationSummary[];
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

export function getDonations(params?: DonationsListParams, signal?: AbortSignal) {
  const search = new URLSearchParams();

  Object.entries(params ?? {}).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      search.set(key, String(value));
    }
  });

  const query = search.toString();
  return request<PaginatedDonations>(`/api/donations${query ? `?${query}` : ""}`, { signal });
}

export function getDonation(id: string, signal?: AbortSignal) {
  return request<DonationDetails>(`/api/donations/${id}`, { signal });
}

export function createDonation(payload: DonationPayload) {
  return request<DonationSummary>("/api/donations", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function updateDonation(id: string, payload: Partial<DonationPayload>) {
  return request<DonationSummary>(`/api/donations/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload)
  });
}

export function deleteDonation(id: string) {
  return request<DonationSummary>(`/api/donations/${id}`, {
    method: "DELETE"
  });
}

export function getDonors(signal?: AbortSignal) {
  return request<DonorSummary[]>("/api/donors", { signal });
}

export function donationNumber(id: string) {
  return `DON-${id.slice(-8).toUpperCase()}`;
}
