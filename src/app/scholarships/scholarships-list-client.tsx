"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Edit, Eye, Plus, Search, Trash2 } from "lucide-react";
import { AppSidebar } from "@/components/app-sidebar";
import { ScholarshipStatus, ScholarshipSummary, deleteScholarship, getScholarships } from "@/lib/api/scholarships";

const statusLabels: Record<ScholarshipStatus, string> = {
  DRAFT: "טיוטה",
  APPROVED: "מאושרת",
  PAID: "שולמה",
  LOCKED: "נעולה",
  REQUIRES_REVIEW: "דורשת בדיקה"
};

function formatCurrency(amount: string | number) {
  return new Intl.NumberFormat("he-IL", {
    style: "currency",
    currency: "ILS",
    maximumFractionDigits: 0
  }).format(Number(amount));
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("he-IL").format(new Date(value));
}

function attendanceLabel(scholarship: ScholarshipSummary) {
  if (scholarship.attendance.total === 0 || scholarship.attendance.rate === null) {
    return "אין נתונים";
  }

  return `${scholarship.attendance.rate}% (${scholarship.attendance.present}/${scholarship.attendance.total})`;
}

export function ScholarshipsListClient() {
  const now = new Date();
  const [scholarships, setScholarships] = useState<ScholarshipSummary[]>([]);
  const [query, setQuery] = useState("");
  const [month, setMonth] = useState<number | "">(now.getMonth() + 1);
  const [year, setYear] = useState<number | "">(now.getFullYear());
  const [status, setStatus] = useState<ScholarshipStatus | "">("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, pageSize: 10, total: 0, totalPages: 1 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    getScholarships({ q: query, month, year, status, page, pageSize: pagination.pageSize }, controller.signal)
      .then((result) => {
        setScholarships(result.data);
        setPagination(result.pagination);
        setError(null);
      })
      .catch((reason: unknown) => {
        if (!controller.signal.aborted) {
          setError(reason instanceof Error ? reason.message : "טעינת המלגות נכשלה");
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      });

    return () => controller.abort();
  }, [query, month, year, status, page, pagination.pageSize]);

  function resetPageAndLoad() {
    setIsLoading(true);
    setPage(1);
  }

  async function handleDelete(id: string) {
    if (!window.confirm("למחוק את המלגה?")) {
      return;
    }

    try {
      await deleteScholarship(id);
      setScholarships((current) => current.filter((scholarship) => scholarship.id !== id));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "מחיקת המלגה נכשלה");
    }
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
                <p className="text-sm font-semibold text-moss">ניהול מלגות</p>
                <h1 className="mt-1 text-2xl font-bold text-ink md:text-3xl">רשימת מלגות</h1>
              </div>
              <Link className="flex h-10 items-center gap-2 rounded-md bg-moss px-4 text-sm font-bold text-white hover:bg-ink" href="/scholarships/new">
                <Plus className="h-4 w-4" />
                מלגה חדשה
              </Link>
            </div>
          </header>

          <div className="space-y-4 px-4 py-6 md:px-8">
            <div className="grid gap-3 rounded-lg border border-stone/80 bg-white p-4 shadow-soft md:grid-cols-[1fr_110px_120px_170px]">
              <label className="flex h-10 min-w-64 items-center gap-2 rounded-md border border-stone bg-white px-3">
                <Search className="h-4 w-4 text-ink/45" />
                <input
                  className="w-full border-0 bg-transparent text-sm outline-none"
                  placeholder="חיפוש לפי אברך, תעודת זהות או מסלול"
                  value={query}
                  onChange={(event) => {
                    resetPageAndLoad();
                    setQuery(event.target.value);
                  }}
                />
              </label>

              <select
                className="h-10 rounded-md border border-stone bg-white px-3 text-sm outline-none"
                value={month}
                onChange={(event) => {
                  resetPageAndLoad();
                  setMonth(event.target.value ? Number(event.target.value) : "");
                }}
              >
                <option value="">כל החודשים</option>
                {Array.from({ length: 12 }, (_, index) => index + 1).map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>

              <input
                className="h-10 rounded-md border border-stone bg-white px-3 text-sm outline-none"
                min="2000"
                type="number"
                value={year}
                onChange={(event) => {
                  resetPageAndLoad();
                  setYear(event.target.value ? Number(event.target.value) : "");
                }}
              />

              <select
                className="h-10 rounded-md border border-stone bg-white px-3 text-sm outline-none"
                value={status}
                onChange={(event) => {
                  resetPageAndLoad();
                  setStatus(event.target.value as ScholarshipStatus | "");
                }}
              >
                <option value="">כל הסטטוסים</option>
                <option value="DRAFT">טיוטה</option>
                <option value="APPROVED">מאושרת</option>
                <option value="PAID">שולמה</option>
                <option value="LOCKED">נעולה</option>
                <option value="REQUIRES_REVIEW">דורשת בדיקה</option>
              </select>
            </div>

            {error ? <div className="rounded-md border border-danger/30 bg-danger/10 px-4 py-3 text-sm font-semibold text-danger">{error}</div> : null}

            <div className="rounded-lg border border-stone/80 bg-white shadow-soft">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[980px] border-collapse text-right">
                  <thead className="bg-linen/70 text-sm text-ink/60">
                    <tr>
                      <th className="px-5 py-3 font-bold">שם אברך</th>
                      <th className="px-5 py-3 font-bold">חודש</th>
                      <th className="px-5 py-3 font-bold">שנה</th>
                      <th className="px-5 py-3 font-bold">סכום</th>
                      <th className="px-5 py-3 font-bold">סטטוס</th>
                      <th className="px-5 py-3 font-bold">נוכחות</th>
                      <th className="px-5 py-3 font-bold">עודכן</th>
                      <th className="px-5 py-3 font-bold">פעולות</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ? (
                      <tr>
                        <td className="px-5 py-8 text-center text-sm text-ink/55" colSpan={8}>
                          טוען מלגות...
                        </td>
                      </tr>
                    ) : scholarships.length === 0 ? (
                      <tr>
                        <td className="px-5 py-8 text-center text-sm text-ink/55" colSpan={8}>
                          לא נמצאו מלגות
                        </td>
                      </tr>
                    ) : (
                      scholarships.map((scholarship) => (
                        <tr key={scholarship.id} className="border-t border-stone/55">
                          <td className="px-5 py-4 font-semibold text-ink">
                            {scholarship.avrech.firstName} {scholarship.avrech.lastName}
                          </td>
                          <td className="px-5 py-4 text-sm text-ink/62">{scholarship.month}</td>
                          <td className="px-5 py-4 text-sm text-ink/62">{scholarship.year}</td>
                          <td className="px-5 py-4 font-bold text-ink">{formatCurrency(scholarship.amount)}</td>
                          <td className="px-5 py-4">
                            <span className="inline-flex rounded-md bg-moss/10 px-2.5 py-1 text-xs font-bold text-moss">
                              {statusLabels[scholarship.status]}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-sm text-ink/62">{attendanceLabel(scholarship)}</td>
                          <td className="px-5 py-4 text-sm text-ink/62">{formatDate(scholarship.updatedAt)}</td>
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2">
                              <Link className="grid h-9 w-9 place-items-center rounded-md border border-stone text-ink hover:border-moss hover:text-moss" href={`/scholarships/${scholarship.id}`} title="צפייה">
                                <Eye className="h-4 w-4" />
                              </Link>
                              <Link className="grid h-9 w-9 place-items-center rounded-md border border-stone text-ink hover:border-moss hover:text-moss" href={`/scholarships/${scholarship.id}/edit`} title="עריכה">
                                <Edit className="h-4 w-4" />
                              </Link>
                              <button className="grid h-9 w-9 place-items-center rounded-md border border-stone text-danger hover:border-danger" onClick={() => handleDelete(scholarship.id)} title="מחיקה">
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
