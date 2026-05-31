"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppSidebar } from "@/components/app-sidebar";
import { AvrechPayload, createAvrech } from "@/lib/api/avrechim";
import { AvrechForm } from "../avrech-form";

export function NewAvrechClient() {
  const router = useRouter();

  async function handleSubmit(payload: AvrechPayload) {
    const avrech = await createAvrech(payload);
    router.push(`/avrechim/${avrech.id}?created=1`);
  }

  return (
    <main className="min-h-screen">
      <div className="flex min-h-screen">
        <AppSidebar />
        <section className="flex min-w-0 flex-1 flex-col">
          <header className="border-b border-stone/80 bg-paper/90 px-4 py-5 md:px-8">
            <p className="text-sm font-semibold text-moss">ניהול אברכים</p>
            <h1 className="mt-1 text-2xl font-bold text-ink md:text-3xl">אברך חדש</h1>
          </header>
          <div className="space-y-4 px-4 py-6 md:px-8">
            <Link className="text-sm font-bold text-moss hover:text-ink" href="/avrechim">
              חזרה לרשימה
            </Link>
            <AvrechForm submitLabel="יצירת אברך" onSubmit={handleSubmit} />
          </div>
        </section>
      </div>
    </main>
  );
}
