export type ReceiptStatus = "DRAFT" | "ISSUED" | "SENT" | "CANCELLED";
export type AccountingSystem = "PRIORITY" | "HASHAVSHEVET" | "SAP_BUSINESS_ONE" | "RIVHIT" | "OTHER" | string;

export type ReceiptDonor = {
  id: string;
  fullName: string;
  email: string | null;
  phone: string | null;
  country: string | null;
  city: string | null;
};

export type ReceiptDonation = {
  id: string;
  amount: string | number;
  currency: string;
  paymentMethod: string;
  status: string;
  createdAt: string;
  donor: ReceiptDonor;
};

export type ReceiptSummary = {
  id: string;
  donationId: string;
  donorId: string;
  receiptNumber: string;
  receiptDate: string;
  amount: number;
  status: ReceiptStatus;
  accountingSystem: AccountingSystem;
  externalReceiptId: string | null;
  pdfUrl: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  donor: ReceiptDonor;
  donation: ReceiptDonation;
};

export type ReceiptDetails = ReceiptSummary;

export type ReceiptsListParams = {
  q?: string;
  status?: ReceiptStatus | "";
  accountingSystem?: string;
  donorId?: string;
  donationId?: string;
  sortBy?: "receiptDate" | "createdAt" | "amount" | "status" | "accountingSystem" | "receiptNumber" | "donorName";
  sortOrder?: "asc" | "desc";
  page?: number;
  pageSize?: number;
};

export type PaginatedReceipts = {
  data: ReceiptSummary[];
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

export function getReceipts(params?: ReceiptsListParams, signal?: AbortSignal) {
  const search = new URLSearchParams();

  Object.entries(params ?? {}).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      search.set(key, String(value));
    }
  });

  const query = search.toString();
  return request<PaginatedReceipts>(`/api/receipts${query ? `?${query}` : ""}`, { signal });
}

export function getReceipt(id: string, signal?: AbortSignal) {
  return request<ReceiptDetails>(`/api/receipts/${id}`, { signal });
}

export function receiptDonationNumber(id: string) {
  return `DON-${id.slice(-8).toUpperCase()}`;
}
