"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowDownUp, ChevronLeft, ChevronRight, Download, Eye, FileText, Search } from "lucide-react";
import { AppSidebar } from "@/components/app-sidebar";
import { DocumentOwnerType, DocumentSummary, getDocuments } from "@/lib/api/documents";

const ownerTypeLabels: Record<DocumentOwnerType, string> = {
  AVRECH: "אברך",
  DONOR: "תורם",
  DONATION: "תרומה",
  SCHOLARSHIP: "מלגה",
  USER: "משתמש"
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("he-IL").format(new Date(value));
}

function formatSize(size: number | null) {
  if (size === null || size === undefined) {
    return "לא צוין";
  }

  if (size < 1024) {
    return `${size} B`;
  }

  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} KB`;
  }

  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

export function DocumentsListClient() {
  const [documents, setDocuments] = useState<DocumentSummary[]>([]);
  const [query, setQuery] = useState("");
  const [ownerType, setOwnerType] = useState<DocumentOwnerType | "">("");
  const [relatedEntityId, setRelatedEntityId] = useState("");
  const [sortBy, setSortBy] = useState<"createdAt" | "updatedAt" | "fileName" | "mimeType" | "size" | "ownerType">("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, pageSize: 10, total: 0, totalPages: 1 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    getDocuments({ q: query, ownerType, relatedEntityId, sortBy, sortOrder, page, pageSize: pagination.pageSize }, controller.signal)
      .then((result) => {
        setDocuments(result.data);
        setPagination(result.pagination);
        setError(null);
      })
      .catch((reason: unknown) => {
        if (!controller.signal.aborted) {
          setError(reason instanceof Error ? reason.message : "טעינת המסמכים נכשלה");
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      });

    return () => controller.abort();
  }, [query, ownerType, relatedEntityId, sortBy, sortOrder, page, pagination.pageSize]);

  function resetPage() {
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
              <p className="text-sm font-semibold text-moss">ניהול מסמכים</p>
              <h1 className="mt-1 text-2xl font-bold text-ink md:text-3xl">רשימת מסמכים</h1>
            </div>
          </header>

          <div className="space-y-4 px-4 py-6 md:px-8">
            <div className="grid gap-3 rounded-lg border border-stone/80 bg-white p-4 shadow-soft md:grid-cols-[1fr_150px_190px_170px_130px]">
              <label className="flex h-10 min-w-64 items-center gap-2 rounded-md border border-stone bg-white px-3">
                <Search className="h-4 w-4 text-ink/45" />
                <input
                  className="w-full border-0 bg-transparent text-sm outline-none"
                  placeholder="חיפוש לפי שם קובץ, סוג או ישות קשורה"
                  value={query}
                  onChange={(event) => {
                    resetPage();
                    setQuery(event.target.value);
                  }}
                />
              </label>

              <select
                className="h-10 rounded-md border border-stone bg-white px-3 text-sm outline-none"
                value={ownerType}
                onChange={(event) => {
                  resetPage();
                  setOwnerType(event.target.value as DocumentOwnerType | "");
                }}
              >
                <option value="">כל הבעלים</option>
                <option value="AVRECH">אברך</option>
                <option value="DONOR">תורם</option>
                <option value="DONATION">תרומה</option>
                <option value="SCHOLARSHIP">מלגה</option>
              </select>

              <input
                className="h-10 rounded-md border border-stone bg-white px-3 text-sm outline-none"
                placeholder="מזהה ישות קשורה"
                value={relatedEntityId}
                onChange={(event) => {
                  resetPage();
                  setRelatedEntityId(event.target.value);
                }}
              />

              <select
                className="h-10 rounded-md border border-stone bg-white px-3 text-sm outline-none"
                value={sortBy}
                onChange={(event) => {
                  resetPage();
                  setSortBy(event.target.value as typeof sortBy);
                }}
              >
                <option value="createdAt">תאריך יצירה</option>
                <option value="updatedAt">תאריך עדכון</option>
                <option value="fileName">שם קובץ</option>
                <option value="mimeType">סוג קובץ</option>
                <option value="size">גודל</option>
                <option value="ownerType">בעלים</option>
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
                <table className="w-full min-w-[980px] border-collapse text-right">
                  <thead className="bg-linen/70 text-sm text-ink/60">
                    <tr>
                      <th className="px-5 py-3 font-bold">שם קובץ</th>
                      <th className="px-5 py-3 font-bold">בעלים</th>
                      <th className="px-5 py-3 font-bold">ישות קשורה</th>
                      <th className="px-5 py-3 font-bold">סוג קובץ</th>
                      <th className="px-5 py-3 font-bold">גודל</th>
                      <th className="px-5 py-3 font-bold">תאריך יצירה</th>
                      <th className="px-5 py-3 font-bold">פעולות</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ? (
                      <tr>
                        <td className="px-5 py-8 text-center text-sm text-ink/55" colSpan={7}>
                          טוען מסמכים...
                        </td>
                      </tr>
                    ) : documents.length === 0 ? (
                      <tr>
                        <td className="px-5 py-8 text-center text-sm text-ink/55" colSpan={7}>
                          לא נמצאו מסמכים
                        </td>
                      </tr>
                    ) : (
                      documents.map((document) => (
                        <tr key={document.id} className="border-t border-stone/55">
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4 text-moss" />
                              <span className="font-semibold text-ink">{document.fileName}</span>
                            </div>
                          </td>
                          <td className="px-5 py-4 text-sm text-ink/70">{ownerTypeLabels[document.ownerType]}</td>
                          <td className="px-5 py-4 text-sm text-ink/62">{document.relatedEntity?.label ?? "לא משויך"}</td>
                          <td className="px-5 py-4 text-sm text-ink/62">{document.mimeType}</td>
                          <td className="px-5 py-4 text-sm text-ink/62">{formatSize(document.size)}</td>
                          <td className="px-5 py-4 text-sm text-ink/62">{formatDate(document.createdAt)}</td>
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2">
                              <Link className="grid h-9 w-9 place-items-center rounded-md border border-stone text-ink hover:border-moss hover:text-moss" href={`/documents/${document.id}`} title="צפייה">
                                <Eye className="h-4 w-4" />
                              </Link>
                              <a className="grid h-9 w-9 place-items-center rounded-md border border-stone text-ink hover:border-moss hover:text-moss" href={document.fileUrl} target="_blank" rel="noreferrer" title="הורדה">
                                <Download className="h-4 w-4" />
                              </a>
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
                    disabled={pagination.page <= 1 || isLoading}
                    onClick={() => {
                      setIsLoading(true);
                      setPage((current) => Math.max(1, current - 1));
                    }}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                  <span className="min-w-24 text-center">
                    עמוד {pagination.page} מתוך {pagination.totalPages}
                  </span>
                  <button
                    className="grid h-9 w-9 place-items-center rounded-md border border-stone text-ink disabled:cursor-not-allowed disabled:opacity-40"
                    disabled={pagination.page >= pagination.totalPages || isLoading}
                    onClick={() => {
                      setIsLoading(true);
                      setPage((current) => Math.min(pagination.totalPages, current + 1));
                    }}
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
