"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ExternalLink } from "lucide-react";
import { AppSidebar } from "@/components/app-sidebar";
import { ReceiptDetails, ReceiptStatus, getReceipt, receiptDonationNumber } from "@/lib/api/receipts";

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

export function ReceiptViewClient() {
  const params = useParams<{ id: string }>();
  const [receipt, setReceipt] = useState<ReceiptDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    getReceipt(params.id, controller.signal)
      .then((result) => {
        setReceipt(result);
        setError(null);
      })
      .catch((reason: unknown) => {
        if (!controller.signal.aborted) {
          setError(reason instanceof Error ? reason.message : "טעינת הקבלה נכשלה");
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      });

    return () => controller.abort();
  }, [params.id]);

  return (
    <main className="min-h-screen">
      <div className="flex min-h-screen">
        <AppSidebar />
        <section className="flex min-w-0 flex-1 flex-col">
          <header className="border-b border-stone/80 bg-paper/90 px-4 py-5 md:px-8">
            <p className="text-sm font-semibold text-moss">קבלות מסונכרנות</p>
            <h1 className="mt-1 text-2xl font-bold text-ink md:text-3xl">כרטיס קבלה</h1>
          </header>

          <div className="space-y-4 px-4 py-6 md:px-8">
            <Link className="text-sm font-bold text-moss hover:text-ink" href="/receipts">
              חזרה לרשימה
            </Link>

            {isLoading ? <div className="rounded-lg border border-stone bg-white p-5 text-sm text-ink/60 shadow-soft">טוען קבלה...</div> : null}
            {error ? <div className="rounded-md border border-danger/30 bg-danger/10 px-4 py-3 text-sm font-semibold text-danger">{error}</div> : null}

            {receipt ? (
              <>
                <div className="rounded-lg border border-stone/80 bg-white p-5 shadow-soft">
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-ink">{receipt.receiptNumber}</h2>
                      <p className="mt-1 text-sm text-ink/55">
                        {accountingSystemLabels[receipt.accountingSystem] ?? receipt.accountingSystem}
                        {receipt.externalReceiptId ? ` · ${receipt.externalReceiptId}` : ""}
                      </p>
                    </div>
                    {receipt.pdfUrl ? (
                      <a className="flex h-10 items-center gap-2 rounded-md border border-stone px-4 text-sm font-bold text-ink hover:border-moss hover:text-moss" href={receipt.pdfUrl} rel="noreferrer" target="_blank">
                        <ExternalLink className="h-4 w-4" />
                        פתיחת PDF
                      </a>
                    ) : null}
                  </div>

                  <div className="mt-5 grid gap-3 md:grid-cols-3">
                    <Detail label="סכום" value={formatCurrency(receipt.amount, receipt.donation.currency)} />
                    <Detail label="סטטוס" value={statusLabels[receipt.status]} />
                    <Detail label="תאריך קבלה" value={formatDate(receipt.receiptDate)} />
                    <Detail label="מערכת חשבונות" value={accountingSystemLabels[receipt.accountingSystem] ?? receipt.accountingSystem} />
                    <Detail label="מזהה חיצוני" value={receipt.externalReceiptId} />
                    <Detail label="תאריך קליטה" value={formatDate(receipt.createdAt)} />
                  </div>

                  {receipt.notes ? <p className="mt-5 rounded-md bg-linen/70 p-3 text-sm text-ink/70">{receipt.notes}</p> : null}
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                  <div className="rounded-lg border border-stone/80 bg-white p-5 shadow-soft">
                    <h2 className="text-lg font-bold text-ink">תורם קשור</h2>
                    <div className="mt-4 grid gap-3 md:grid-cols-2">
                      <Detail label="שם" value={receipt.donor.fullName} />
                      <Detail label="אימייל" value={receipt.donor.email} />
                      <Detail label="טלפון" value={receipt.donor.phone} />
                      <Detail label="עיר" value={receipt.donor.city} />
                    </div>
                  </div>

                  <div className="rounded-lg border border-stone/80 bg-white p-5 shadow-soft">
                    <h2 className="text-lg font-bold text-ink">תרומה קשורה</h2>
                    <div className="mt-4 grid gap-3 md:grid-cols-2">
                      <Detail label="מספר תרומה" value={receiptDonationNumber(receipt.donationId)} />
                      <Detail label="סכום תרומה" value={formatCurrency(receipt.donation.amount, receipt.donation.currency)} />
                      <Detail label="סטטוס תרומה" value={receipt.donation.status} />
                      <Detail label="תאריך תרומה" value={formatDate(receipt.donation.createdAt)} />
                    </div>
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
