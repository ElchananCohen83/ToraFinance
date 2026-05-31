"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Edit, Eye, Plus, Search, Trash2 } from "lucide-react";
import { AppSidebar } from "@/components/app-sidebar";
import { AvrechSummary, MaritalStatus, PersonStatus, deleteAvrech, getAvrechim } from "@/lib/api/avrechim";

const statusLabels: Record<PersonStatus, string> = {
  ACTIVE: "פעיל",
  INACTIVE: "לא פעיל",
  SUSPENDED: "מושהה"
};

const maritalStatusLabels: Record<MaritalStatus, string> = {
  SINGLE: "רווק",
  MARRIED: "נשוי",
  WIDOWED: "אלמן",
  DIVORCED: "גרוש"
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("he-IL").format(new Date(value));
}

export function AvrechimListClient() {
  const [avrechim, setAvrechim] = useState<AvrechSummary[]>([]);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<PersonStatus | "">("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, pageSize: 10, total: 0, totalPages: 1 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    getAvrechim({ q: query, status, page, pageSize: pagination.pageSize }, controller.signal)
      .then((result) => {
        setAvrechim(result.data);
        setPagination(result.pagination);
        setError(null);
      })
      .catch((reason: unknown) => {
        if (!controller.signal.aborted) {
          setError(reason instanceof Error ? reason.message : "טעינת האברכים נכשלה");
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      });

    return () => controller.abort();
  }, [query, status, page, pagination.pageSize]);

  async function handleDelete(id: string) {
    const confirmed = window.confirm("להפוך את האברך ללא פעיל?");
    if (!confirmed) {
      return;
    }

    try {
      await deleteAvrech(id);
      setAvrechim((current) => current.map((avrech) => (avrech.id === id ? { ...avrech, status: "INACTIVE" } : avrech)));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "מחיקת האברך נכשלה");
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
                <p className="text-sm font-semibold text-moss">ניהול אברכים</p>
                <h1 className="mt-1 text-2xl font-bold text-ink md:text-3xl">רשימת אברכים</h1>
              </div>
              <Link className="flex h-10 items-center gap-2 rounded-md bg-moss px-4 text-sm font-bold text-white hover:bg-ink" href="/avrechim/new">
                <Plus className="h-4 w-4" />
                אברך חדש
              </Link>
            </div>
          </header>

          <div className="space-y-4 px-4 py-6 md:px-8">
            <div className="flex flex-col gap-3 rounded-lg border border-stone/80 bg-white p-4 shadow-soft md:flex-row">
              <label className="flex h-10 min-w-72 flex-1 items-center gap-2 rounded-md border border-stone bg-white px-3">
                <Search className="h-4 w-4 text-ink/45" />
                <input
                  className="w-full border-0 bg-transparent text-sm outline-none"
                  placeholder="חיפוש לפי שם, תעודת זהות או טלפון"
                  value={query}
                  onChange={(event) => {
                    setIsLoading(true);
                    setPage(1);
                    setQuery(event.target.value);
                  }}
                />
              </label>
              <select
                className="h-10 rounded-md border border-stone bg-white px-3 text-sm outline-none"
                value={status}
                onChange={(event) => {
                  setIsLoading(true);
                  setPage(1);
                  setStatus(event.target.value as PersonStatus | "");
                }}
              >
                <option value="">כל הסטטוסים</option>
                <option value="ACTIVE">פעיל</option>
                <option value="INACTIVE">לא פעיל</option>
                <option value="SUSPENDED">מושהה</option>
              </select>
            </div>

            {error ? <div className="rounded-md border border-danger/30 bg-danger/10 px-4 py-3 text-sm font-semibold text-danger">{error}</div> : null}

            <div className="rounded-lg border border-stone/80 bg-white shadow-soft">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1040px] border-collapse text-right">
                  <thead className="bg-linen/70 text-sm text-ink/60">
                    <tr>
                      <th className="px-5 py-3 font-bold">שם</th>
                      <th className="px-5 py-3 font-bold">תעודת זהות</th>
                      <th className="px-5 py-3 font-bold">טלפון</th>
                      <th className="px-5 py-3 font-bold">מצב משפחתי</th>
                      <th className="px-5 py-3 font-bold">מספר ילדים</th>
                      <th className="px-5 py-3 font-bold">סטטוס</th>
                      <th className="px-5 py-3 font-bold">תאריך הצטרפות</th>
                      <th className="px-5 py-3 font-bold">פעולות</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ? (
                      <tr>
                        <td className="px-5 py-8 text-center text-sm text-ink/55" colSpan={8}>
                          טוען אברכים...
                        </td>
                      </tr>
                    ) : avrechim.length === 0 ? (
                      <tr>
                        <td className="px-5 py-8 text-center text-sm text-ink/55" colSpan={8}>
                          לא נמצאו אברכים
                        </td>
                      </tr>
                    ) : (
                      avrechim.map((avrech) => (
                        <tr key={avrech.id} className="border-t border-stone/55">
                          <td className="px-5 py-4 font-semibold text-ink">
                            {avrech.firstName} {avrech.lastName}
                          </td>
                          <td className="px-5 py-4 text-sm text-ink/62">{avrech.nationalId}</td>
                          <td className="px-5 py-4 text-sm text-ink/62">{avrech.phone ?? "-"}</td>
                          <td className="px-5 py-4 text-sm text-ink/62">{maritalStatusLabels[avrech.maritalStatus]}</td>
                          <td className="px-5 py-4 text-sm text-ink/62">{avrech.childrenCount}</td>
                          <td className="px-5 py-4">
                            <span className="inline-flex rounded-md bg-moss/10 px-2.5 py-1 text-xs font-bold text-moss">
                              {statusLabels[avrech.status]}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-sm text-ink/62">{formatDate(avrech.joinedAt)}</td>
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2">
                              <Link className="grid h-9 w-9 place-items-center rounded-md border border-stone text-ink hover:border-moss hover:text-moss" href={`/avrechim/${avrech.id}`} title="צפייה">
                                <Eye className="h-4 w-4" />
                              </Link>
                              <Link className="grid h-9 w-9 place-items-center rounded-md border border-stone text-ink hover:border-moss hover:text-moss" href={`/avrechim/${avrech.id}/edit`} title="עריכה">
                                <Edit className="h-4 w-4" />
                              </Link>
                              <button className="grid h-9 w-9 place-items-center rounded-md border border-stone text-danger hover:border-danger" onClick={() => handleDelete(avrech.id)} title="הפוך ללא פעיל">
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
