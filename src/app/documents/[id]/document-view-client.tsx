"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Download, ExternalLink, FileText } from "lucide-react";
import { AppSidebar } from "@/components/app-sidebar";
import { DocumentDetails, DocumentOwnerType, getDocument } from "@/lib/api/documents";

const ownerTypeLabels: Record<DocumentOwnerType, string> = {
  AVRECH: "אברך",
  DONOR: "תורם",
  DONATION: "תרומה",
  SCHOLARSHIP: "מלגה",
  USER: "משתמש"
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("he-IL", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
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

function relatedEntityHref(document: DocumentDetails) {
  if (document.ownerType === "AVRECH" && document.avrechId) {
    return `/avrechim/${document.avrechId}`;
  }

  if (document.ownerType === "DONATION" && document.donationId) {
    return `/donations/${document.donationId}`;
  }

  if (document.ownerType === "SCHOLARSHIP" && document.scholarshipId) {
    return `/scholarships/${document.scholarshipId}`;
  }

  return null;
}

function Detail({ label, value }: { label: string; value: string | number | null | undefined }) {
  return (
    <div className="rounded-lg border border-stone/70 bg-linen/35 px-4 py-3">
      <p className="text-xs font-bold text-ink/50">{label}</p>
      <p className="mt-1 text-sm font-semibold text-ink">{value ?? "לא צוין"}</p>
    </div>
  );
}

export function DocumentViewClient({ id }: { id: string }) {
  const [document, setDocument] = useState<DocumentDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    getDocument(id, controller.signal)
      .then((result) => {
        setDocument(result);
        setError(null);
      })
      .catch((reason: unknown) => {
        if (!controller.signal.aborted) {
          setError(reason instanceof Error ? reason.message : "טעינת המסמך נכשלה");
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      });

    return () => controller.abort();
  }, [id]);

  const href = document ? relatedEntityHref(document) : null;

  return (
    <main className="min-h-screen">
      <div className="flex min-h-screen">
        <AppSidebar />

        <section className="flex min-w-0 flex-1 flex-col">
          <header className="border-b border-stone/80 bg-paper/90 px-4 py-5 md:px-8">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-semibold text-moss">ניהול מסמכים</p>
                <h1 className="mt-1 text-2xl font-bold text-ink md:text-3xl">פרטי מסמך</h1>
              </div>
              <Link className="text-sm font-bold text-moss hover:text-ink" href="/documents">
                חזרה לרשימה
              </Link>
            </div>
          </header>

          <div className="space-y-4 px-4 py-6 md:px-8">
            {isLoading ? <div className="rounded-lg border border-stone/80 bg-white p-6 text-sm text-ink/60 shadow-soft">טוען מסמך...</div> : null}
            {error ? <div className="rounded-md border border-danger/30 bg-danger/10 px-4 py-3 text-sm font-semibold text-danger">{error}</div> : null}

            {document ? (
              <>
                <section className="rounded-lg border border-stone/80 bg-white p-5 shadow-soft">
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="flex items-start gap-3">
                      <div className="grid h-12 w-12 place-items-center rounded-lg bg-moss/10 text-moss">
                        <FileText className="h-6 w-6" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-ink">{document.fileName}</h2>
                        <p className="mt-1 text-sm text-ink/60">{document.title}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <a className="flex h-10 items-center gap-2 rounded-md border border-stone px-4 text-sm font-bold text-ink hover:border-moss hover:text-moss" href={document.fileUrl} target="_blank" rel="noreferrer">
                        <ExternalLink className="h-4 w-4" />
                        תצוגה מקדימה
                      </a>
                      <a className="flex h-10 items-center gap-2 rounded-md bg-moss px-4 text-sm font-bold text-white hover:bg-ink" href={document.fileUrl} download>
                        <Download className="h-4 w-4" />
                        הורדה
                      </a>
                    </div>
                  </div>
                </section>

                <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                  <Detail label="סוג בעלים" value={ownerTypeLabels[document.ownerType]} />
                  <Detail label="ישות קשורה" value={document.relatedEntity?.label ?? "לא משויך"} />
                  <Detail label="סוג קובץ" value={document.mimeType} />
                  <Detail label="גודל" value={formatSize(document.size)} />
                  <Detail label="תאריך יצירה" value={formatDate(document.createdAt)} />
                  <Detail label="תאריך עדכון" value={formatDate(document.updatedAt)} />
                  <Detail label="מזהה מסמך" value={document.id} />
                  <Detail label="Storage Key" value={document.storageKey} />
                </section>

                <section className="rounded-lg border border-stone/80 bg-white p-5 shadow-soft">
                  <h2 className="text-lg font-bold text-ink">קישור עסקי</h2>
                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    <Detail label="אברך" value={document.avrech ? `${document.avrech.firstName} ${document.avrech.lastName}` : null} />
                    <Detail label="תורם" value={document.donor?.fullName} />
                    <Detail label="תרומה" value={document.donation ? `${document.donation.currency} ${Number(document.donation.amount).toLocaleString("he-IL")}` : null} />
                    <Detail label="מלגה" value={document.scholarship ? `${document.scholarship.month}/${document.scholarship.year}` : null} />
                  </div>

                  {href ? (
                    <Link className="mt-4 inline-flex h-10 items-center rounded-md border border-stone px-4 text-sm font-bold text-ink hover:border-moss hover:text-moss" href={href}>
                      מעבר לישות המקושרת
                    </Link>
                  ) : null}
                </section>
              </>
            ) : null}
          </div>
        </section>
      </div>
    </main>
  );
}

