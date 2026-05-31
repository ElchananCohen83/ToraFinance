"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowDownUp, ChevronLeft, ChevronRight, Edit, Eye, Plus, Search, Trash2 } from "lucide-react";
import { AppSidebar } from "@/components/app-sidebar";
import {
  DonationStatus,
  DonationSummary,
  PaymentMethod,
  deleteDonation,
  donationNumber,
  getDonations
} from "@/lib/api/donations";

const statusLabels: Record<DonationStatus, string> = {
  PLEDGED: "התחייבות",
  PAID: "שולמה",
  FAILED: "נכשלה",
  CANCELLED: "בוטלה"
};

const paymentMethodLabels: Record<PaymentMethod, string> = {
  CASH: "מזומן",
  CREDIT_CARD: "כרטיס אשראי",
  BANK_TRANSFER: "העברה בנקאית",
  CHECK: "צ'ק",
  STANDING_ORDER: "הוראת קבע"
};

function formatCurrency(amount: string | number, currency: string) {
  return new Intl.NumberFormat("he-IL", {
    style: "currency",
    currency,
    maximumFractionDigits: 2
  }).format(Number(amount));
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("he-IL").format(new Date(value));
}

export function DonationsListClient() {
  const [donations, setDonations] = useState<DonationSummary[]>([]);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<DonationStatus | "">("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | "">("");
  const [sortBy, setSortBy] = useState<"createdAt" | "amount" | "status" | "paymentMethod" | "donorName">("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, pageSize: 10, total: 0, totalPages: 1 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    getDonations({ q: query, status, paymentMethod, sortBy, sortOrder, page, pageSize: pagination.pageSize }, controller.signal)
      .then((result) => {
        setDonations(result.data);
        setPagination(result.pagination);
        setError(null);
      })
      .catch((reason: unknown) => {
        if (!controller.signal.aborted) {
          setError(reason instanceof Error ? reason.message : "טעינת התרומות נכשלה");
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      });

    return () => controller.abort();
  }, [query, status, paymentMethod, sortBy, sortOrder, page, pagination.pageSize]);

  async function handleDelete(id: string) {
    const confirmed = window.confirm("לבטל את התרומה?");
    if (!confirmed) {
      return;
    }

    try {
      await deleteDonation(id);
      setDonations((current) => current.map((donation) => (donation.id === id ? { ...donation, status: "CANCELLED" } : donation)));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "מחיקת התרומה נכשלה");
    }
  }

  function resetPageAndLoad() {
    setIsLoading(true);
    setPage(1);
  }

  const firstResult = pagination.total === 0 ? 0 : Math.min((pagination.page - 1) * pagination.pageSize + 1, pagination.total);
  const lastResult = Math.min(pagination.page * pagination.pageSize, pagination.total);

  return (
    <main className="min-h-screen">
      <div className="flex min-h-screen">
        <AppSidebar />

        <section className="flex min-w-0 flex-1 flex-col">
          <header className="border-b border-stone/80 bg-paper/90 px-4 py-5 md:px-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-semibold text-moss">ניהול תרומות</p>
                <h1 className="mt-1 text-2xl font-bold text-ink md:text-3xl">רשימת תרומות</h1>
              </div>
              <Link className="flex h-10 items-center gap-2 rounded-md bg-moss px-4 text-sm font-bold text-white hover:bg-ink" href="/donations/new">
                <Plus className="h-4 w-4" />
                תרומה חדשה
              </Link>
            </div>
          </header>

          <div className="space-y-4 px-4 py-6 md:px-8">
            <div className="grid gap-3 rounded-lg border border-stone/80 bg-white p-4 shadow-soft md:grid-cols-[1fr_160px_190px_190px_130px]">
              <label className="flex h-10 min-w-64 items-center gap-2 rounded-md border border-stone bg-white px-3">
                <Search className="h-4 w-4 text-ink/45" />
                <input
                  className="w-full border-0 bg-transparent text-sm outline-none"
                  placeholder="חיפוש לפי תורם, מזהה או הערה"
                  value={query}
                  onChange={(event) => {
                    resetPageAndLoad();
                    setQuery(event.target.value);
                  }}
                />
              </label>

              <select
                className="h-10 rounded-md border border-stone bg-white px-3 text-sm outline-none"
                value={status}
                onChange={(event) => {
                  resetPageAndLoad();
                  setStatus(event.target.value as DonationStatus | "");
                }}
              >
                <option value="">כל הסטטוסים</option>
                <option value="PLEDGED">התחייבות</option>
                <option value="PAID">שולמה</option>
                <option value="FAILED">נכשלה</option>
                <option value="CANCELLED">בוטלה</option>
              </select>

              <select
                className="h-10 rounded-md border border-stone bg-white px-3 text-sm outline-none"
                value={paymentMethod}
                onChange={(event) => {
                  resetPageAndLoad();
                  setPaymentMethod(event.target.value as PaymentMethod | "");
                }}
              >
                <option value="">כל אמצעי התשלום</option>
                <option value="CASH">מזומן</option>
                <option value="CREDIT_CARD">כרטיס אשראי</option>
                <option value="BANK_TRANSFER">העברה בנקאית</option>
                <option value="CHECK">צ&apos;ק</option>
                <option value="STANDING_ORDER">הוראת קבע</option>
              </select>

              <select
                className="h-10 rounded-md border border-stone bg-white px-3 text-sm outline-none"
                value={sortBy}
                onChange={(event) => {
                  resetPageAndLoad();
                  setSortBy(event.target.value as typeof sortBy);
                }}
              >
                <option value="createdAt">תאריך יצירה</option>
                <option value="amount">סכום</option>
                <option value="donorName">שם תורם</option>
                <option value="status">סטטוס</option>
                <option value="paymentMethod">אמצעי תשלום</option>
              </select>

              <button
                className="flex h-10 items-center justify-center gap-2 rounded-md border border-stone px-3 text-sm font-bold text-ink hover:border-moss hover:text-moss"
                onClick={() => {
                  setIsLoading(true);
                  setSortOrder((current) => (current === "asc" ? "desc" : "asc"));
                }}
              >
                <ArrowDownUp className="h-4 w-4" />
                {sortOrder === "asc" ? "עולה" : "יורד"}
              </button>
            </div>

            {error ? <div className="rounded-md border border-danger/30 bg-danger/10 px-4 py-3 text-sm font-semibold text-danger">{error}</div> : null}

            <div className="rounded-lg border border-stone/80 bg-white shadow-soft">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1040px] border-collapse text-right">
                  <thead className="bg-linen/70 text-sm text-ink/60">
                    <tr>
                      <th className="px-5 py-3 font-bold">מספר תרומה</th>
                      <th className="px-5 py-3 font-bold">שם תורם</th>
                      <th className="px-5 py-3 font-bold">סכום</th>
                      <th className="px-5 py-3 font-bold">אמצעי תשלום</th>
                      <th className="px-5 py-3 font-bold">סטטוס</th>
                      <th className="px-5 py-3 font-bold">תאריך יצירה</th>
                      <th className="px-5 py-3 font-bold">פעולות</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ? (
                      <tr>
                        <td className="px-5 py-8 text-center text-sm text-ink/55" colSpan={7}>
                          טוען תרומות...
                        </td>
                      </tr>
                    ) : donations.length === 0 ? (
                      <tr>
                        <td className="px-5 py-8 text-center text-sm text-ink/55" colSpan={7}>
                          לא נמצאו תרומות
                        </td>
                      </tr>
                    ) : (
                      donations.map((donation) => (
                        <tr key={donation.id} className="border-t border-stone/55">
                          <td className="px-5 py-4 font-semibold text-ink">{donationNumber(donation.id)}</td>
                          <td className="px-5 py-4 text-sm text-ink/70">{donation.donor.fullName}</td>
                          <td className="px-5 py-4 font-bold text-ink">{formatCurrency(donation.amount, donation.currency)}</td>
                          <td className="px-5 py-4 text-sm text-ink/62">{paymentMethodLabels[donation.paymentMethod]}</td>
                          <td className="px-5 py-4">
                            <span className="inline-flex rounded-md bg-moss/10 px-2.5 py-1 text-xs font-bold text-moss">
                              {statusLabels[donation.status]}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-sm text-ink/62">{formatDate(donation.createdAt)}</td>
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2">
                              <Link className="grid h-9 w-9 place-items-center rounded-md border border-stone text-ink hover:border-moss hover:text-moss" href={`/donations/${donation.id}`} title="צפייה">
                                <Eye className="h-4 w-4" />
                              </Link>
                              <Link className="grid h-9 w-9 place-items-center rounded-md border border-stone text-ink hover:border-moss hover:text-moss" href={`/donations/${donation.id}/edit`} title="עריכה">
                                <Edit className="h-4 w-4" />
                              </Link>
                              <button className="grid h-9 w-9 place-items-center rounded-md border border-stone text-danger hover:border-danger" onClick={() => handleDelete(donation.id)} title="ביטול תרומה">
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div className="flex flex-col gap-3 border-t border-stone/70 px-4 py-3 text-sm text-ink/60 md:flex-row md:items-center md:justify-between">
                <span>{pagination.total === 0 ? "אין תוצאות" : `מציג ${firstResult}-${lastResult} מתוך ${pagination.total}`}</span>
                <div className="flex items-center gap-2">
                  <button
                    className="grid h-9 w-9 place-items-center rounded-md border border-stone text-ink disabled:cursor-not-allowed disabled:opacity-40"
                    disabled={isLoading || pagination.page <= 1}
                    onClick={() => {
                      setIsLoading(true);
                      setPage((current) => Math.max(1, current - 1));
                    }}
                    title="העמוד הקודם"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                  <span className="min-w-20 text-center font-semibold text-ink">
                    {pagination.page} / {pagination.totalPages}
                  </span>
                  <button
                    className="grid h-9 w-9 place-items-center rounded-md border border-stone text-ink disabled:cursor-not-allowed disabled:opacity-40"
                    disabled={isLoading || pagination.page >= pagination.totalPages}
                    onClick={() => {
                      setIsLoading(true);
                      setPage((current) => Math.min(pagination.totalPages, current + 1));
                    }}
                    title="העמוד הבא"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
