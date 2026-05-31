"use client";

import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Edit, Trash2 } from "lucide-react";
import { AppSidebar } from "@/components/app-sidebar";
import { ScholarshipDetails, ScholarshipStatus, deleteScholarship, getScholarship } from "@/lib/api/scholarships";

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

function formatDate(value?: string | null) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("he-IL").format(new Date(value));
}

function Detail({ label, value }: { label: string; value: string | number | null | undefined }) {
  return (
    <div className="rounded-lg border border-stone/75 bg-paper/55 p-4">
      <p className="text-xs font-bold text-ink/50">{label}</p>
      <p className="mt-2 text-sm font-bold text-ink">{value || "-"}</p>
    </div>
  );
}

export function ScholarshipViewClient() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [scholarship, setScholarship] = useState<ScholarshipDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    getScholarship(params.id, controller.signal)
      .then((result) => {
        setScholarship(result);
        setError(null);
      })
      .catch((reason: unknown) => {
        if (!controller.signal.aborted) {
          setError(reason instanceof Error ? reason.message : "טעינת המלגה נכשלה");
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      });

    return () => controller.abort();
  }, [params.id]);

  async function handleDelete() {
    if (!scholarship || !window.confirm("למחוק את המלגה?")) {
      return;
    }

    await deleteScholarship(scholarship.id);
    router.push("/scholarships");
  }

  return (
    <main className="min-h-screen">
      <div className="flex min-h-screen">
        <AppSidebar />
        <section className="flex min-w-0 flex-1 flex-col">
          <header className="border-b border-stone/80 bg-paper/90 px-4 py-5 md:px-8">
            <p className="text-sm font-semibold text-moss">ניהול מלגות</p>
            <h1 className="mt-1 text-2xl font-bold text-ink md:text-3xl">כרטיס מלגה</h1>
          </header>

          <div className="space-y-4 px-4 py-6 md:px-8">
            <Link className="text-sm font-bold text-moss hover:text-ink" href="/scholarships">
              חזרה לרשימה
            </Link>

            {isLoading ? <div className="rounded-lg border border-stone bg-white p-5 text-sm text-ink/60 shadow-soft">טוען מלגה...</div> : null}
            {error ? <div className="rounded-md border border-danger/30 bg-danger/10 px-4 py-3 text-sm font-semibold text-danger">{error}</div> : null}
            {searchParams.get("created") ? (
              <div className="rounded-md border border-moss/30 bg-moss/10 px-4 py-3 text-sm font-semibold text-moss">המלגה נוצרה בהצלחה</div>
            ) : null}
            {searchParams.get("updated") ? (
              <div className="rounded-md border border-moss/30 bg-moss/10 px-4 py-3 text-sm font-semibold text-moss">השינויים נשמרו בהצלחה</div>
            ) : null}

            {scholarship ? (
              <>
                <div className="rounded-lg border border-stone/80 bg-white p-5 shadow-soft">
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-ink">
                        {scholarship.avrech.firstName} {scholarship.avrech.lastName}
                      </h2>
                      <p className="mt-1 text-sm text-ink/55">
                        {scholarship.month}/{scholarship.year}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Link className="flex h-10 items-center gap-2 rounded-md border border-stone px-4 text-sm font-bold text-ink hover:border-moss hover:text-moss" href={`/scholarships/${scholarship.id}/edit`}>
                        <Edit className="h-4 w-4" />
                        עריכה
                      </Link>
                      <button className="flex h-10 items-center gap-2 rounded-md border border-danger/40 px-4 text-sm font-bold text-danger hover:bg-danger/10" onClick={handleDelete}>
                        <Trash2 className="h-4 w-4" />
                        מחיקה
                      </button>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-3 md:grid-cols-3">
                    <Detail label="סכום" value={formatCurrency(scholarship.amount)} />
                    <Detail label="סטטוס" value={statusLabels[scholarship.status]} />
                    <Detail label="עודכן" value={formatDate(scholarship.updatedAt)} />
                    <Detail label="נוכחות" value={scholarship.attendance.rate === null ? "אין נתונים" : `${scholarship.attendance.rate}%`} />
                    <Detail label="נוכח" value={`${scholarship.attendance.present}/${scholarship.attendance.total}`} />
                    <Detail label="תאריך תשלום" value={formatDate(scholarship.paidAt)} />
                  </div>

                  {scholarship.notes ? <p className="mt-5 rounded-md bg-linen/70 p-3 text-sm text-ink/70">{scholarship.notes}</p> : null}
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                  <div className="rounded-lg border border-stone/80 bg-white p-5 shadow-soft">
                    <h2 className="text-lg font-bold text-ink">פרטי אברך</h2>
                    <div className="mt-4 grid gap-3 md:grid-cols-2">
                      <Detail label="שם" value={`${scholarship.avrech.firstName} ${scholarship.avrech.lastName}`} />
                      <Detail label="תעודת זהות" value={scholarship.avrech.nationalId} />
                      <Detail label="טלפון" value={scholarship.avrech.phone} />
                      <Detail label="מסלול" value={scholarship.avrech.track} />
                    </div>
                  </div>

                  <div className="rounded-lg border border-stone/80 bg-white p-5 shadow-soft">
                    <h2 className="text-lg font-bold text-ink">נוכחות בחודש המלגה</h2>
                    {scholarship.attendance.records && scholarship.attendance.records.length > 0 ? (
                      <div className="mt-4 max-h-72 overflow-y-auto">
                        <table className="w-full text-right text-sm">
                          <thead className="text-ink/55">
                            <tr>
                              <th className="py-2">תאריך</th>
                              <th className="py-2">סטטוס</th>
                              <th className="py-2">הערה</th>
                            </tr>
                          </thead>
                          <tbody>
                            {scholarship.attendance.records.map((record) => (
                              <tr key={record.id} className="border-t border-stone/60">
                                <td className="py-2">{formatDate(record.date)}</td>
                                <td className="py-2">{record.present ? "נוכח" : "חסר"}</td>
                                <td className="py-2">{record.notes ?? "-"}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="mt-4 text-sm text-ink/55">אין נתוני נוכחות לחודש זה</p>
                    )}
                  </div>
                </div>
              </>
            ) : null}
          </div>
        </section>
      </div>
    </main>
  );
}
