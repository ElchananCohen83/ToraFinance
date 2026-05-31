"use client";

import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Edit, Trash2 } from "lucide-react";
import { AppSidebar } from "@/components/app-sidebar";
import { AvrechDetails, PersonStatus, deleteAvrech, getAvrech } from "@/lib/api/avrechim";

const statusLabels: Record<PersonStatus, string> = {
  ACTIVE: "פעיל",
  INACTIVE: "לא פעיל",
  SUSPENDED: "מושהה"
};

const maritalLabels: Record<string, string> = {
  DIVORCED: "גרוש",
  MARRIED: "נשוי",
  SINGLE: "רווק",
  WIDOWED: "אלמן"
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("he-IL").format(new Date(value));
}

function formatCurrency(value: string | number) {
  return new Intl.NumberFormat("he-IL", {
    style: "currency",
    currency: "ILS",
    maximumFractionDigits: 0
  }).format(Number(value));
}

function Detail({ label, value }: { label: string; value: string | number | null | undefined }) {
  return (
    <div className="rounded-lg border border-stone/75 bg-paper/55 p-4">
      <p className="text-xs font-bold text-ink/50">{label}</p>
      <p className="mt-2 text-sm font-bold text-ink">{value || "-"}</p>
    </div>
  );
}

export function AvrechViewClient() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [avrech, setAvrech] = useState<AvrechDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    getAvrech(params.id, controller.signal)
      .then((result) => {
        setAvrech(result);
        setError(null);
      })
      .catch((reason: unknown) => {
        if (!controller.signal.aborted) {
          setError(reason instanceof Error ? reason.message : "טעינת האברך נכשלה");
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
    if (!avrech || !window.confirm("להפוך את האברך ללא פעיל?")) {
      return;
    }

    await deleteAvrech(avrech.id);
    router.push("/avrechim");
  }

  return (
    <main className="min-h-screen">
      <div className="flex min-h-screen">
        <AppSidebar />
        <section className="flex min-w-0 flex-1 flex-col">
          <header className="border-b border-stone/80 bg-paper/90 px-4 py-5 md:px-8">
            <p className="text-sm font-semibold text-moss">ניהול אברכים</p>
            <h1 className="mt-1 text-2xl font-bold text-ink md:text-3xl">כרטיס אברך</h1>
          </header>

          <div className="space-y-4 px-4 py-6 md:px-8">
            <Link className="text-sm font-bold text-moss hover:text-ink" href="/avrechim">
              חזרה לרשימה
            </Link>

            {isLoading ? <div className="rounded-lg border border-stone bg-white p-5 text-sm text-ink/60 shadow-soft">טוען כרטיס...</div> : null}
            {error ? <div className="rounded-md border border-danger/30 bg-danger/10 px-4 py-3 text-sm font-semibold text-danger">{error}</div> : null}
            {searchParams.get("created") ? (
              <div className="rounded-md border border-moss/30 bg-moss/10 px-4 py-3 text-sm font-semibold text-moss">האברך נוצר בהצלחה</div>
            ) : null}
            {searchParams.get("updated") ? (
              <div className="rounded-md border border-moss/30 bg-moss/10 px-4 py-3 text-sm font-semibold text-moss">השינויים נשמרו בהצלחה</div>
            ) : null}

            {avrech ? (
              <>
                <div className="rounded-lg border border-stone/80 bg-white p-5 shadow-soft">
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-ink">
                        {avrech.firstName} {avrech.lastName}
                      </h2>
                      <p className="mt-1 text-sm text-ink/55">תעודת זהות {avrech.nationalId}</p>
                    </div>
                    <div className="flex gap-2">
                      <Link className="flex h-10 items-center gap-2 rounded-md border border-stone px-4 text-sm font-bold text-ink hover:border-moss hover:text-moss" href={`/avrechim/${avrech.id}/edit`}>
                        <Edit className="h-4 w-4" />
                        עריכה
                      </Link>
                      <button className="flex h-10 items-center gap-2 rounded-md border border-danger/40 px-4 text-sm font-bold text-danger hover:bg-danger/10" onClick={handleDelete}>
                        <Trash2 className="h-4 w-4" />
                        הפוך ללא פעיל
                      </button>
                    </div>
                  </div>
                  <div className="mt-5 grid gap-3 md:grid-cols-3">
                    <Detail label="סטטוס" value={statusLabels[avrech.status]} />
                    <Detail label="מסלול" value={avrech.track} />
                    <Detail label="תאריך הצטרפות" value={formatDate(avrech.joinedAt)} />
                    <Detail label="טלפון" value={avrech.phone} />
                    <Detail label="כתובת" value={avrech.address} />
                    <Detail label="מצב משפחתי" value={maritalLabels[avrech.maritalStatus]} />
                    <Detail label="מספר ילדים" value={avrech.childrenCount} />
                    <Detail label="מסמכים" value={avrech.documents.length} />
                    <Detail label="מלגות" value={avrech.scholarships.length} />
                  </div>
                  {avrech.internalNotes ? <p className="mt-5 rounded-md bg-linen/70 p-3 text-sm text-ink/70">{avrech.internalNotes}</p> : null}
                </div>

                <div className="rounded-lg border border-stone/80 bg-white p-5 shadow-soft">
                  <h2 className="text-lg font-bold text-ink">מלגות אחרונות</h2>
                  <div className="mt-4 overflow-x-auto">
                    <table className="w-full min-w-[520px] text-right text-sm">
                      <thead className="text-ink/55">
                        <tr>
                          <th className="py-2">חודש</th>
                          <th className="py-2">סכום</th>
                          <th className="py-2">סטטוס</th>
                        </tr>
                      </thead>
                      <tbody>
                        {avrech.scholarships.length === 0 ? (
                          <tr>
                            <td className="py-4 text-ink/55" colSpan={3}>
                              אין מלגות להצגה
                            </td>
                          </tr>
                        ) : (
                          avrech.scholarships.map((scholarship) => (
                            <tr key={scholarship.id} className="border-t border-stone/60">
                              <td className="py-3">
                                {scholarship.month}/{scholarship.year}
                              </td>
                              <td className="py-3">{formatCurrency(scholarship.finalAmount)}</td>
                              <td className="py-3">{scholarship.status}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
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
