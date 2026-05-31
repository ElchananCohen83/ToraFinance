"use client";

import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Edit, Trash2 } from "lucide-react";
import { AppSidebar } from "@/components/app-sidebar";
import { DonationDetails, DonationStatus, PaymentMethod, deleteDonation, donationNumber, getDonation } from "@/lib/api/donations";

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

export function DonationViewClient() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [donation, setDonation] = useState<DonationDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    getDonation(params.id, controller.signal)
      .then((result) => {
        setDonation(result);
        setError(null);
      })
      .catch((reason: unknown) => {
        if (!controller.signal.aborted) {
          setError(reason instanceof Error ? reason.message : "טעינת התרומה נכשלה");
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
    if (!donation || !window.confirm("לבטל את התרומה?")) {
      return;
    }

    await deleteDonation(donation.id);
    router.push("/donations");
  }

  return (
    <main className="min-h-screen">
      <div className="flex min-h-screen">
        <AppSidebar />
        <section className="flex min-w-0 flex-1 flex-col">
          <header className="border-b border-stone/80 bg-paper/90 px-4 py-5 md:px-8">
            <p className="text-sm font-semibold text-moss">ניהול תרומות</p>
            <h1 className="mt-1 text-2xl font-bold text-ink md:text-3xl">כרטיס תרומה</h1>
          </header>

          <div className="space-y-4 px-4 py-6 md:px-8">
            <Link className="text-sm font-bold text-moss hover:text-ink" href="/donations">
              חזרה לרשימה
            </Link>

            {isLoading ? <div className="rounded-lg border border-stone bg-white p-5 text-sm text-ink/60 shadow-soft">טוען תרומה...</div> : null}
            {error ? <div className="rounded-md border border-danger/30 bg-danger/10 px-4 py-3 text-sm font-semibold text-danger">{error}</div> : null}
            {searchParams.get("created") ? (
              <div className="rounded-md border border-moss/30 bg-moss/10 px-4 py-3 text-sm font-semibold text-moss">התרומה נוצרה בהצלחה</div>
            ) : null}
            {searchParams.get("updated") ? (
              <div className="rounded-md border border-moss/30 bg-moss/10 px-4 py-3 text-sm font-semibold text-moss">השינויים נשמרו בהצלחה</div>
            ) : null}

            {donation ? (
              <>
                <div className="rounded-lg border border-stone/80 bg-white p-5 shadow-soft">
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-ink">{donationNumber(donation.id)}</h2>
                      <p className="mt-1 text-sm text-ink/55">{donation.donor.fullName}</p>
                    </div>
                    <div className="flex gap-2">
                      <Link className="flex h-10 items-center gap-2 rounded-md border border-stone px-4 text-sm font-bold text-ink hover:border-moss hover:text-moss" href={`/donations/${donation.id}/edit`}>
                        <Edit className="h-4 w-4" />
                        עריכה
                      </Link>
                      <button className="flex h-10 items-center gap-2 rounded-md border border-danger/40 px-4 text-sm font-bold text-danger hover:bg-danger/10" onClick={handleDelete}>
                        <Trash2 className="h-4 w-4" />
                        ביטול תרומה
                      </button>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-3 md:grid-cols-3">
                    <Detail label="סכום" value={formatCurrency(donation.amount, donation.currency)} />
                    <Detail label="אמצעי תשלום" value={paymentMethodLabels[donation.paymentMethod]} />
                    <Detail label="סטטוס" value={statusLabels[donation.status]} />
                    <Detail label="תאריך יצירה" value={formatDate(donation.createdAt)} />
                    <Detail label="תאריך תשלום" value={formatDate(donation.paidAt)} />
                    <Detail label="מטבע" value={donation.currency} />
                  </div>

                  {donation.campaign ? <p className="mt-5 rounded-md bg-linen/70 p-3 text-sm text-ink/70">{donation.campaign}</p> : null}
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                  <div className="rounded-lg border border-stone/80 bg-white p-5 shadow-soft">
                    <h2 className="text-lg font-bold text-ink">פרטי תורם</h2>
                    <div className="mt-4 grid gap-3 md:grid-cols-2">
                      <Detail label="שם" value={donation.donor.fullName} />
                      <Detail label="אימייל" value={donation.donor.email} />
                      <Detail label="טלפון" value={donation.donor.phone} />
                      <Detail label="עיר" value={donation.donor.city} />
                    </div>
                  </div>

                  <div className="rounded-lg border border-stone/80 bg-white p-5 shadow-soft">
                    <h2 className="text-lg font-bold text-ink">קבלה קשורה</h2>
                    {donation.receipt ? (
                      <div className="mt-4 grid gap-3 md:grid-cols-2">
                        <Detail label="מספר קבלה" value={donation.receipt.number} />
                        <Detail label="סטטוס" value={donation.receipt.status} />
                        <Detail label="הונפקה" value={formatDate(donation.receipt.issuedAt)} />
                        <Detail label="נשלחה" value={formatDate(donation.receipt.sentAt)} />
                      </div>
                    ) : (
                      <p className="mt-4 text-sm text-ink/55">אין קבלה משויכת לתרומה זו</p>
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
