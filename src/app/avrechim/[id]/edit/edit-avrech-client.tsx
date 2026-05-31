"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { AvrechDetails, AvrechPayload, getAvrech, updateAvrech } from "@/lib/api/avrechim";
import { AvrechForm } from "../../avrech-form";

export function EditAvrechClient() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
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

  async function handleSubmit(payload: AvrechPayload) {
    const updated = await updateAvrech(params.id, payload);
    router.push(`/avrechim/${updated.id}?updated=1`);
  }

  return (
    <main className="min-h-screen">
      <div className="flex min-h-screen">
        <AppSidebar />
        <section className="flex min-w-0 flex-1 flex-col">
          <header className="border-b border-stone/80 bg-paper/90 px-4 py-5 md:px-8">
            <p className="text-sm font-semibold text-moss">ניהול אברכים</p>
            <h1 className="mt-1 text-2xl font-bold text-ink md:text-3xl">עריכת אברך</h1>
          </header>
          <div className="space-y-4 px-4 py-6 md:px-8">
            <Link className="text-sm font-bold text-moss hover:text-ink" href={`/avrechim/${params.id}`}>
              חזרה לכרטיס
            </Link>
            {isLoading ? <div className="rounded-lg border border-stone bg-white p-5 text-sm text-ink/60 shadow-soft">טוען טופס...</div> : null}
            {error ? <div className="rounded-md border border-danger/30 bg-danger/10 px-4 py-3 text-sm font-semibold text-danger">{error}</div> : null}
            {avrech ? <AvrechForm initialAvrech={avrech} submitLabel="שמירת שינויים" onSubmit={handleSubmit} /> : null}
          </div>
        </section>
      </div>
    </main>
  );
}
