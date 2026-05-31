"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { AvrechSummary } from "@/lib/api/avrechim";
import { ScholarshipDetails, ScholarshipPayload, ScholarshipStatus, getAvrechimOptions } from "@/lib/api/scholarships";

type FormValues = {
  avrechId: string;
  month: string;
  year: string;
  amount: string;
  status: ScholarshipStatus;
  notes: string;
};

type FormErrors = Partial<Record<keyof FormValues | "form" | "avrechim", string>>;

type ScholarshipFormProps = {
  initialScholarship?: ScholarshipDetails;
  submitLabel: string;
  onSubmit: (payload: ScholarshipPayload) => Promise<void>;
};

const statusOptions: Array<{ value: ScholarshipStatus; label: string }> = [
  { value: "DRAFT", label: "טיוטה" },
  { value: "APPROVED", label: "מאושרת" },
  { value: "PAID", label: "שולמה" },
  { value: "LOCKED", label: "נעולה" },
  { value: "REQUIRES_REVIEW", label: "דורשת בדיקה" }
];

function buildInitialValues(scholarship?: ScholarshipDetails): FormValues {
  const now = new Date();

  return {
    avrechId: scholarship?.avrechId ?? "",
    month: String(scholarship?.month ?? now.getMonth() + 1),
    year: String(scholarship?.year ?? now.getFullYear()),
    amount: scholarship ? String(scholarship.amount) : "",
    status: scholarship?.status ?? "DRAFT",
    notes: scholarship?.notes ?? ""
  };
}

function validate(values: FormValues, isEdit: boolean) {
  const errors: FormErrors = {};
  const amount = Number(values.amount);
  const month = Number(values.month);
  const year = Number(values.year);

  if (!isEdit && !values.avrechId) {
    errors.avrechId = "יש לבחור אברך";
  }

  if (!Number.isInteger(month) || month < 1 || month > 12) {
    errors.month = "חודש חייב להיות בין 1 ל-12";
  }

  if (!Number.isInteger(year) || year < 2000) {
    errors.year = "שנה אינה תקינה";
  }

  if (!Number.isFinite(amount) || amount < 0) {
    errors.amount = "סכום חייב להיות מספר חיובי";
  }

  return errors;
}

function toPayload(values: FormValues): ScholarshipPayload {
  return {
    avrechId: values.avrechId,
    month: Number(values.month),
    year: Number(values.year),
    amount: Number(values.amount),
    status: values.status,
    notes: values.notes.trim() || undefined
  };
}

export function ScholarshipForm({ initialScholarship, submitLabel, onSubmit }: ScholarshipFormProps) {
  const isEdit = Boolean(initialScholarship);
  const initialValues = useMemo(() => buildInitialValues(initialScholarship), [initialScholarship]);
  const [values, setValues] = useState<FormValues>(initialValues);
  const [avrechim, setAvrechim] = useState<AvrechSummary[]>([]);
  const [isLoadingAvrechim, setIsLoadingAvrechim] = useState(!isEdit);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isEdit) {
      return;
    }

    const controller = new AbortController();

    getAvrechimOptions(controller.signal)
      .then((result) => {
        setAvrechim(result);
        setErrors((current) => ({ ...current, avrechim: undefined }));
      })
      .catch((reason: unknown) => {
        if (!controller.signal.aborted) {
          setErrors((current) => ({
            ...current,
            avrechim: reason instanceof Error ? reason.message : "טעינת האברכים נכשלה"
          }));
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsLoadingAvrechim(false);
        }
      });

    return () => controller.abort();
  }, [isEdit]);

  function updateField<Key extends keyof FormValues>(field: Key, value: FormValues[Key]) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined, form: undefined }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validate(values, isEdit);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);

    try {
      await onSubmit(toPayload(values));
    } catch (error) {
      setErrors({
        form: error instanceof Error ? error.message : "שמירת המלגה נכשלה"
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

      {errors.avrechim ? (
        <div className="mb-4 rounded-md border border-danger/30 bg-danger/10 px-3 py-2 text-sm font-semibold text-danger">
          {errors.avrechim}
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        {isEdit ? (
          <div className={labelClass}>
            אברך
            <div className="mt-1 flex h-10 items-center rounded-md border border-stone bg-linen/50 px-3 text-sm text-ink/70">
              {initialScholarship?.avrech.firstName} {initialScholarship?.avrech.lastName}
            </div>
          </div>
        ) : (
          <label className={labelClass}>
            אברך
            <select className={inputClass} disabled={isLoadingAvrechim} value={values.avrechId} onChange={(event) => updateField("avrechId", event.target.value)}>
              <option value="">{isLoadingAvrechim ? "טוען אברכים..." : "בחר אברך"}</option>
              {avrechim.map((avrech) => (
                <option key={avrech.id} value={avrech.id}>
                  {avrech.firstName} {avrech.lastName}
                </option>
              ))}
            </select>
            {errors.avrechId ? <span className={errorClass}>{errors.avrechId}</span> : null}
          </label>
        )}

        <label className={labelClass}>
          חודש
          <select className={inputClass} disabled={isEdit} value={values.month} onChange={(event) => updateField("month", event.target.value)}>
            {Array.from({ length: 12 }, (_, index) => index + 1).map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
          {errors.month ? <span className={errorClass}>{errors.month}</span> : null}
        </label>

        <label className={labelClass}>
          שנה
          <input className={inputClass} disabled={isEdit} min="2000" type="number" value={values.year} onChange={(event) => updateField("year", event.target.value)} />
          {errors.year ? <span className={errorClass}>{errors.year}</span> : null}
        </label>

        <label className={labelClass}>
          סכום
          <input className={inputClass} min="0" step="0.01" type="number" value={values.amount} onChange={(event) => updateField("amount", event.target.value)} />
          {errors.amount ? <span className={errorClass}>{errors.amount}</span> : null}
        </label>

        <label className={labelClass}>
          סטטוס
          <select className={inputClass} value={values.status} onChange={(event) => updateField("status", event.target.value as ScholarshipStatus)}>
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
          value={values.notes}
          onChange={(event) => updateField("notes", event.target.value)}
        />
      </label>

      <div className="mt-6 flex justify-end">
        <button className="rounded-md bg-moss px-5 py-2 text-sm font-bold text-white hover:bg-ink disabled:cursor-not-allowed disabled:opacity-60" disabled={isSubmitting || isLoadingAvrechim}>
          {isSubmitting ? "שומר..." : submitLabel}
        </button>
      </div>
    </form>
  );
}
