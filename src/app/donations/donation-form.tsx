"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  DonationDetails,
  DonationPayload,
  DonationStatus,
  DonorSummary,
  PaymentMethod,
  getDonors
} from "@/lib/api/donations";

type FormValues = {
  donorId: string;
  amount: string;
  currency: string;
  paymentMethod: PaymentMethod;
  status: DonationStatus;
  campaign: string;
};

type FormErrors = Partial<Record<keyof FormValues | "form" | "donors", string>>;

type DonationFormProps = {
  initialDonation?: DonationDetails;
  submitLabel: string;
  onSubmit: (payload: DonationPayload) => Promise<void>;
};

const paymentMethodOptions: Array<{ value: PaymentMethod; label: string }> = [
  { value: "CASH", label: "מזומן" },
  { value: "CREDIT_CARD", label: "כרטיס אשראי" },
  { value: "BANK_TRANSFER", label: "העברה בנקאית" },
  { value: "CHECK", label: "צ'ק" },
  { value: "STANDING_ORDER", label: "הוראת קבע" }
];

const statusOptions: Array<{ value: DonationStatus; label: string }> = [
  { value: "PLEDGED", label: "התחייבות" },
  { value: "PAID", label: "שולמה" },
  { value: "FAILED", label: "נכשלה" },
  { value: "CANCELLED", label: "בוטלה" }
];

function buildInitialValues(donation?: DonationDetails): FormValues {
  return {
    donorId: donation?.donorId ?? "",
    amount: donation ? String(donation.amount) : "",
    currency: donation?.currency ?? "ILS",
    paymentMethod: donation?.paymentMethod ?? "BANK_TRANSFER",
    status: donation?.status ?? "PLEDGED",
    campaign: donation?.campaign ?? ""
  };
}

function validate(values: FormValues) {
  const errors: FormErrors = {};
  const amount = Number(values.amount);

  if (!values.donorId) {
    errors.donorId = "יש לבחור תורם";
  }

  if (!Number.isFinite(amount) || amount <= 0) {
    errors.amount = "סכום התרומה חייב להיות גדול מאפס";
  }

  if (!values.currency.trim()) {
    errors.currency = "יש להזין מטבע";
  }

  return errors;
}

function toPayload(values: FormValues): DonationPayload {
  return {
    donorId: values.donorId,
    amount: Number(values.amount),
    currency: values.currency.trim().toUpperCase(),
    paymentMethod: values.paymentMethod,
    status: values.status,
    campaign: values.campaign.trim() || undefined
  };
}

export function DonationForm({ initialDonation, submitLabel, onSubmit }: DonationFormProps) {
  const initialValues = useMemo(() => buildInitialValues(initialDonation), [initialDonation]);
  const [values, setValues] = useState<FormValues>(initialValues);
  const [donors, setDonors] = useState<DonorSummary[]>([]);
  const [isLoadingDonors, setIsLoadingDonors] = useState(true);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    getDonors(controller.signal)
      .then((result) => {
        setDonors(result);
        setErrors((current) => ({ ...current, donors: undefined }));
      })
      .catch((reason: unknown) => {
        if (!controller.signal.aborted) {
          setErrors((current) => ({
            ...current,
            donors: reason instanceof Error ? reason.message : "טעינת התורמים נכשלה"
          }));
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsLoadingDonors(false);
        }
      });

    return () => controller.abort();
  }, []);

  function updateField<Key extends keyof FormValues>(field: Key, value: FormValues[Key]) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined, form: undefined }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validate(values);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);

    try {
      await onSubmit(toPayload(values));
    } catch (error) {
      setErrors({
        form: error instanceof Error ? error.message : "שמירת התרומה נכשלה"
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  const inputClass = "mt-1 h-10 w-full rounded-md border border-stone bg-white px-3 text-sm outline-none focus:border-moss";
  const labelClass = "text-sm font-bold text-ink";
  const errorClass = "mt-1 text-xs font-semibold text-danger";

  return (
    <form className="rounded-lg border border-stone/80 bg-white p-5 shadow-soft" onSubmit={handleSubmit}>
      {errors.form ? (
        <div className="mb-4 rounded-md border border-danger/30 bg-danger/10 px-3 py-2 text-sm font-semibold text-danger">
          {errors.form}
        </div>
      ) : null}

      {errors.donors ? (
        <div className="mb-4 rounded-md border border-danger/30 bg-danger/10 px-3 py-2 text-sm font-semibold text-danger">
          {errors.donors}
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <label className={labelClass}>
          תורם
          <select
            className={inputClass}
            disabled={isLoadingDonors}
            value={values.donorId}
            onChange={(event) => updateField("donorId", event.target.value)}
          >
            <option value="">{isLoadingDonors ? "טוען תורמים..." : "בחר תורם"}</option>
            {donors.map((donor) => (
              <option key={donor.id} value={donor.id}>
                {donor.fullName}
              </option>
            ))}
          </select>
          {errors.donorId ? <span className={errorClass}>{errors.donorId}</span> : null}
        </label>

        <label className={labelClass}>
          סכום
          <input className={inputClass} min="0.01" step="0.01" type="number" value={values.amount} onChange={(event) => updateField("amount", event.target.value)} />
          {errors.amount ? <span className={errorClass}>{errors.amount}</span> : null}
        </label>

        <label className={labelClass}>
          מטבע
          <input className={inputClass} maxLength={3} value={values.currency} onChange={(event) => updateField("currency", event.target.value)} />
          {errors.currency ? <span className={errorClass}>{errors.currency}</span> : null}
        </label>

        <label className={labelClass}>
          אמצעי תשלום
          <select className={inputClass} value={values.paymentMethod} onChange={(event) => updateField("paymentMethod", event.target.value as PaymentMethod)}>
            {paymentMethodOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className={labelClass}>
          סטטוס
          <select className={inputClass} value={values.status} onChange={(event) => updateField("status", event.target.value as DonationStatus)}>
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className={`${labelClass} mt-4 block`}>
        הערות
        <textarea
          className="mt-1 min-h-28 w-full rounded-md border border-stone bg-white px-3 py-2 text-sm outline-none focus:border-moss"
          value={values.campaign}
          onChange={(event) => updateField("campaign", event.target.value)}
        />
      </label>

      <div className="mt-6 flex justify-end">
        <button className="rounded-md bg-moss px-5 py-2 text-sm font-bold text-white hover:bg-ink disabled:cursor-not-allowed disabled:opacity-60" disabled={isSubmitting || isLoadingDonors}>
          {isSubmitting ? "שומר..." : submitLabel}
        </button>
      </div>
    </form>
  );
}
