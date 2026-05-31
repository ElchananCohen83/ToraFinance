"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowDownUp, ChevronLeft, ChevronRight, Eye, Search } from "lucide-react";
import { AppSidebar } from "@/components/app-sidebar";
import { ReceiptStatus, ReceiptSummary, getReceipts, receiptDonationNumber } from "@/lib/api/receipts";

const statusLabels: Record<ReceiptStatus, string> = {
  DRAFT: "טיוטה",
  ISSUED: "הונפקה",
  SENT: "נשלחה",
  CANCELLED: "בוטלה"
};

const accountingSystemLabels: Record<string, string> = {
  PRIORITY: "Priority",
  HASHAVSHEVET: "חשבשבת",
  SAP_BUSINESS_ONE: "SAP Business One",
  RIVHIT: "ריווחית",
  OTHER: "מערכת אחרת",
  UNKNOWN: "לא ידוע"
};

function formatCurrency(amount: string | number, currency = "ILS") {
  return new Intl.NumberFormat("he-IL", {
    style: "currency",
    currency,
    maximumFractionDigits: 2
  }).format(Number(amount));
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("he-IL").format(new Date(value));
}

export function ReceiptsListClient() {
  const [receipts, setReceipts] = useState<ReceiptSummary[]>([]);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<ReceiptStatus | "">("");
  const [accountingSystem, setAccountingSystem] = useState("");
  const [sortBy, setSortBy] = useState<"receiptDate" | "createdAt" | "amount" | "status" | "accountingSystem" | "receiptNumber" | "donorName">("receiptDate");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, pageSize: 10, total: 0, totalPages: 1 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    getReceipts({ q: query, status, accountingSystem, sortBy, sortOrder, page, pageSize: pagination.pageSize }, controller.signal)
      .then((result) => {
        setReceipts(result.data);
        setPagination(result.pagination);
        setError(null);
      })
      .catch((reason: unknown) => {
        if (!controller.signal.aborted) {
          setError(reason instanceof Error ? reason.message : "טעינת הקבלות נכשלה");
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      });

    return () => controller.abort();
  }, [query, status, accountingSystem, sortBy, sortOrder, page, pagination.pageSize]);

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
            <div>
              <p className="text-sm font-semibold text-moss">קבלות מסונכרנות</p>
              <h1 className="mt-1 text-2xl font-bold text-ink md:text-3xl">רשימת קבלות</h1>
            </div>
          </header>

          <div className="space-y-4 px-4 py-6 md:px-8">
            <div className="grid gap-3 rounded-lg border border-stone/80 bg-white p-4 shadow-soft md:grid-cols-[1fr_150px_190px_180px_130px]">
              <label className="flex h-10 min-w-64 items-center gap-2 rounded-md border border-stone bg-white px-3">
                <Search className="h-4 w-4 text-ink/45" />
                <input
                  className="w-full border-0 bg-transparent text-sm outline-none"
                  placeholder="חיפוש לפי מספר קבלה, תורם או מזהה חיצוני"
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
                  setStatus(event.target.value as ReceiptStatus | "");
                }}
              >
                <option value="">כל הסטטוסים</option>
                <option value="DRAFT">טיוטה</option>
                <option value="ISSUED">הונפקה</option>
                <option value="SENT">נשלחה</option>
                <option value="CANCELLED">בוטלה</option>
              </select>

              <select
                className="h-10 rounded-md border border-stone bg-white px-3 text-sm outline-none"
                value={accountingSystem}
                onChange={(event) => {
                  resetPageAndLoad();
                  setAccountingSystem(event.target.value);
                }}
              >
                <option value="">כל מערכות החשבונות</option>
                <option value="PRIORITY">Priority</option>
                <option value="HASHAVSHEVET">חשבשבת</option>
                <option value="SAP_BUSINESS_ONE">SAP Business One</option>
                <option value="RIVHIT">ריווחית</option>
                <option value="OTHER">מערכת אחרת</option>
              </select>

              <select
                className="h-10 rounded-md border border-stone bg-white px-3 text-sm outline-none"
                value={sortBy}
                onChange={(event) => {
                  resetPageAndLoad();
                  setSortBy(event.target.value as typeof sortBy);
                }}
              >
                <option value="receiptDate">תאריך קבלה</option>
                <option value="createdAt">תאריך קליטה</option>
                <option value="amount">סכום</option>
                <option value="receiptNumber">מספר קבלה</option>
                <option value="donorName">שם תורם</option>
                <option value="accountingSystem">מערכת</option>
                <option value="status">סטטוס</option>
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
                <table className="w-full min-w-[1080px] border-collapse text-right">
                  <thead className="bg-linen/70 text-sm text-ink/60">
                    <tr>
                      <th className="px-5 py-3 font-bold">מספר קבלה</th>
                      <th className="px-5 py-3 font-bold">תורם</th>
                      <th className="px-5 py-3 font-bold">תרומה</th>
                      <th className="px-5 py-3 font-bold">סכום</th>
                      <th className="px-5 py-3 font-bold">תאריך קבלה</th>
                      <th className="px-5 py-3 font-bold">מערכת חשבונות</th>
                      <th className="px-5 py-3 font-bold">סטטוס</th>
                      <th className="px-5 py-3 font-bold">פעולות</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ? (
                      <tr>
                        <td className="px-5 py-8 text-center text-sm text-ink/55" colSpan={8}>
                          טוען קבלות...
                        </td>
                      </tr>
                    ) : receipts.length === 0 ? (
                      <tr>
                        <td className="px-5 py-8 text-center text-sm text-ink/55" colSpan={8}>
                          לא נמצאו קבלות
                        </td>
                      </tr>
                    ) : (
                      receipts.map((receipt) => (
                        <tr key={receipt.id} className="border-t border-stone/55">
                          <td className="px-5 py-4 font-semibold text-ink">{receipt.receiptNumber}</td>
                          <td className="px-5 py-4 text-sm text-ink/70">{receipt.donor.fullName}</td>
                          <td className="px-5 py-4 text-sm text-ink/62">{receiptDonationNumber(receipt.donationId)}</td>
                          <td className="px-5 py-4 font-bold text-ink">{formatCurrency(receipt.amount, receipt.donation.currency)}</td>
                          <td className="px-5 py-4 text-sm text-ink/62">{formatDate(receipt.receiptDate)}</td>
                          <td className="px-5 py-4 text-sm text-ink/62">{accountingSystemLabels[receipt.accountingSystem] ?? receipt.accountingSystem}</td>
                          <td className="px-5 py-4">
                            <span className="inline-flex rounded-md bg-moss/10 px-2.5 py-1 text-xs font-bold text-moss">
                              {statusLabels[receipt.status]}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <Link className="grid h-9 w-9 place-items-center rounded-md border border-stone text-ink hover:border-moss hover:text-moss" href={`/receipts/${receipt.id}`} title="צפייה">
                              <Eye className="h-4 w-4" />
                            </Link>
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
