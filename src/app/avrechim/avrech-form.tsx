"use client";

import { FormEvent, useMemo, useState } from "react";
import { AvrechDetails, AvrechPayload, MaritalStatus, PersonStatus } from "@/lib/api/avrechim";

type FormValues = {
  firstName: string;
  lastName: string;
  nationalId: string;
  phone: string;
  address: string;
  maritalStatus: MaritalStatus;
  childrenCount: string;
  joinedAt: string;
  status: PersonStatus;
  track: string;
  internalNotes: string;
};

type FormErrors = Partial<Record<keyof FormValues | "form", string>>;

type AvrechFormProps = {
  initialAvrech?: AvrechDetails;
  submitLabel: string;
  onSubmit: (payload: AvrechPayload) => Promise<void>;
};

const maritalStatusOptions: Array<{ value: MaritalStatus; label: string }> = [
  { value: "SINGLE", label: "רווק" },
  { value: "MARRIED", label: "נשוי" },
  { value: "WIDOWED", label: "אלמן" },
  { value: "DIVORCED", label: "גרוש" }
];

const personStatusOptions: Array<{ value: PersonStatus; label: string }> = [
  { value: "ACTIVE", label: "פעיל" },
  { value: "INACTIVE", label: "לא פעיל" },
  { value: "SUSPENDED", label: "מושהה" }
];

function toDateInput(value?: string) {
  if (!value) {
    return new Date().toISOString().slice(0, 10);
  }

  return new Date(value).toISOString().slice(0, 10);
}

function buildInitialValues(avrech?: AvrechDetails): FormValues {
  return {
    firstName: avrech?.firstName ?? "",
    lastName: avrech?.lastName ?? "",
    nationalId: avrech?.nationalId ?? "",
    phone: avrech?.phone ?? "",
    address: avrech?.address ?? "",
    maritalStatus: avrech?.maritalStatus ?? "MARRIED",
    childrenCount: String(avrech?.childrenCount ?? 0),
    joinedAt: toDateInput(avrech?.joinedAt),
    status: avrech?.status ?? "ACTIVE",
    track: avrech?.track ?? "",
    internalNotes: avrech?.internalNotes ?? ""
  };
}

function validate(values: FormValues) {
  const errors: FormErrors = {};

  if (!values.firstName.trim()) {
    errors.firstName = "יש להזין שם פרטי";
  }

  if (!values.lastName.trim()) {
    errors.lastName = "יש להזין שם משפחה";
  }

  if (!values.nationalId.trim()) {
    errors.nationalId = "יש להזין תעודת זהות";
  }

  const childrenCount = Number(values.childrenCount);
  if (!Number.isInteger(childrenCount) || childrenCount < 0) {
    errors.childrenCount = "מספר ילדים חייב להיות מספר שלם וחיובי";
  }

  if (!values.joinedAt) {
    errors.joinedAt = "יש להזין תאריך הצטרפות";
  }

  return errors;
}

function toPayload(values: FormValues): AvrechPayload {
  return {
    firstName: values.firstName.trim(),
    lastName: values.lastName.trim(),
    nationalId: values.nationalId.trim(),
    phone: values.phone.trim() || undefined,
    address: values.address.trim() || undefined,
    maritalStatus: values.maritalStatus,
    childrenCount: Number(values.childrenCount),
    joinedAt: values.joinedAt,
    status: values.status,
    track: values.track.trim() || undefined,
    internalNotes: values.internalNotes.trim() || undefined
  };
}

export function AvrechForm({ initialAvrech, submitLabel, onSubmit }: AvrechFormProps) {
  const initialValues = useMemo(() => buildInitialValues(initialAvrech), [initialAvrech]);
  const [values, setValues] = useState<FormValues>(initialValues);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

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
        form: error instanceof Error ? error.message : "שמירת האברך נכשלה"
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

      <div className="grid gap-4 md:grid-cols-2">
        <label className={labelClass}>
          שם פרטי
          <input className={inputClass} value={values.firstName} onChange={(event) => updateField("firstName", event.target.value)} />
          {errors.firstName ? <span className={errorClass}>{errors.firstName}</span> : null}
        </label>

        <label className={labelClass}>
          שם משפחה
          <input className={inputClass} value={values.lastName} onChange={(event) => updateField("lastName", event.target.value)} />
          {errors.lastName ? <span className={errorClass}>{errors.lastName}</span> : null}
        </label>

        <label className={labelClass}>
          תעודת זהות
          <input className={inputClass} value={values.nationalId} onChange={(event) => updateField("nationalId", event.target.value)} />
          {errors.nationalId ? <span className={errorClass}>{errors.nationalId}</span> : null}
        </label>

        <label className={labelClass}>
          טלפון
          <input className={inputClass} value={values.phone} onChange={(event) => updateField("phone", event.target.value)} />
        </label>

        <label className={labelClass}>
          כתובת
          <input className={inputClass} value={values.address} onChange={(event) => updateField("address", event.target.value)} />
        </label>

        <label className={labelClass}>
          מסלול / שיעור
          <input className={inputClass} value={values.track} onChange={(event) => updateField("track", event.target.value)} />
        </label>

        <label className={labelClass}>
          מצב משפחתי
          <select className={inputClass} value={values.maritalStatus} onChange={(event) => updateField("maritalStatus", event.target.value as MaritalStatus)}>
            {maritalStatusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className={labelClass}>
          מספר ילדים
          <input
            className={inputClass}
            min="0"
            type="number"
            value={values.childrenCount}
            onChange={(event) => updateField("childrenCount", event.target.value)}
          />
          {errors.childrenCount ? <span className={errorClass}>{errors.childrenCount}</span> : null}
        </label>

        <label className={labelClass}>
          תאריך הצטרפות
          <input className={inputClass} type="date" value={values.joinedAt} onChange={(event) => updateField("joinedAt", event.target.value)} />
          {errors.joinedAt ? <span className={errorClass}>{errors.joinedAt}</span> : null}
        </label>

        <label className={labelClass}>
          סטטוס
          <select className={inputClass} value={values.status} onChange={(event) => updateField("status", event.target.value as PersonStatus)}>
            {personStatusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className={`${labelClass} mt-4 block`}>
        הערות פנימיות
        <textarea
          className="mt-1 min-h-28 w-full rounded-md border border-stone bg-white px-3 py-2 text-sm outline-none focus:border-moss"
          value={values.internalNotes}
          onChange={(event) => updateField("internalNotes", event.target.value)}
        />
      </label>

      <div className="mt-6 flex justify-end">
        <button className="rounded-md bg-moss px-5 py-2 text-sm font-bold text-white hover:bg-ink disabled:cursor-not-allowed disabled:opacity-60" disabled={isSubmitting}>
          {isSubmitting ? "שומר..." : submitLabel}
        </button>
      </div>
    </form>
  );
}
