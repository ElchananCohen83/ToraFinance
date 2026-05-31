"use client";

import {
  AlertTriangle,
  Archive,
  BadgeCheck,
  Banknote,
  Bell,
  CalendarDays,
  ChartNoAxesCombined,
  ChevronDown,
  CircleDollarSign,
  Download,
  FileText,
  Filter,
  Gauge,
  HandCoins,
  Landmark,
  LockKeyhole,
  Mail,
  MessageCircle,
  MoreHorizontal,
  Plus,
  ReceiptText,
  Search,
  ShieldCheck,
  Sparkles,
  Upload,
  UserRound,
  UsersRound,
  WalletCards
} from "lucide-react";
import { clsx } from "clsx";
import { useEffect, useMemo, useState } from "react";
import {
  DashboardActionItem,
  DashboardMetric,
  DashboardModuleItem,
  DashboardNavItem,
  DashboardScholarshipRow,
  DashboardSummary,
  getDashboardSummary
} from "@/lib/api/dashboard";

type IconComponent = React.ComponentType<{ className?: string }>;

const iconMap: Record<string, IconComponent> = {
  alerts: AlertTriangle,
  banknote: Banknote,
  documents: Archive,
  donations: CircleDollarSign,
  donor: UserRound,
  file: FileText,
  gauge: Gauge,
  landmark: Landmark,
  mail: Mail,
  message: MessageCircle,
  permissions: LockKeyhole,
  receipts: ReceiptText,
  reports: ChartNoAxesCombined,
  review: BadgeCheck,
  scholarships: HandCoins,
  shield: ShieldCheck,
  upload: Upload,
  users: UsersRound,
  wallet: WalletCards
};

function getIcon(icon: string) {
  return iconMap[icon] ?? FileText;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("he-IL", {
    style: "currency",
    currency: "ILS",
    maximumFractionDigits: 0
  }).format(value);
}

function formatMetricValue(metric: DashboardMetric) {
  return metric.unit === "ILS" ? formatCurrency(metric.value) : new Intl.NumberFormat("he-IL").format(metric.value);
}

function translateScholarshipStatus(status: DashboardScholarshipRow["status"]) {
  const labels: Record<DashboardScholarshipRow["status"], string> = {
    APPROVED: "מוכן להעברה",
    DRAFT: "טיוטה",
    LOCKED: "נעול",
    PAID: "שולם",
    REQUIRES_REVIEW: "נדרשת בדיקה"
  };

  return labels[status];
}

function MetricCard({ metric }: { metric: DashboardMetric }) {
  return (
    <div className="rounded-lg border border-stone/80 bg-white p-5 shadow-soft">
      <div className="flex items-start justify-between gap-4">
        <p className="text-sm font-semibold text-ink/65">{metric.label}</p>
        <span
          className={clsx(
            "h-2.5 w-2.5 rounded-full",
            metric.tone === "green" && "bg-leaf",
            metric.tone === "gold" && "bg-gold",
            metric.tone === "red" && "bg-danger",
            metric.tone === "neutral" && "bg-ink/45"
          )}
        />
      </div>
      <strong className="mt-4 block text-3xl font-bold tracking-normal text-ink">{formatMetricValue(metric)}</strong>
      <span className="mt-2 block text-sm text-ink/55">{metric.delta}</span>
    </div>
  );
}

function IconButton({
  label,
  children,
  variant = "ghost"
}: {
  label: string;
  children: React.ReactNode;
  variant?: "ghost" | "primary";
}) {
  return (
    <button
      className={clsx(
        "grid h-10 w-10 place-items-center rounded-md border transition",
        variant === "primary"
          ? "border-moss bg-moss text-white hover:bg-ink"
          : "border-stone bg-white text-ink hover:border-moss hover:text-moss"
      )}
      aria-label={label}
      title={label}
    >
      {children}
    </button>
  );
}

function LoadingState() {
  return (
    <div className="grid min-h-screen place-items-center bg-paper px-4">
      <div className="w-full max-w-md rounded-lg border border-stone bg-white p-6 text-center shadow-soft">
        <Gauge className="mx-auto h-8 w-8 animate-pulse text-moss" />
        <h1 className="mt-4 text-xl font-bold text-ink">טוען נתוני דשבורד</h1>
        <p className="mt-2 text-sm text-ink/58">מתחבר לשרת ה־API ומביא נתונים עדכניים מה־DB.</p>
      </div>
    </div>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="grid min-h-screen place-items-center bg-paper px-4">
      <div className="w-full max-w-md rounded-lg border border-danger/35 bg-white p-6 text-center shadow-soft">
        <AlertTriangle className="mx-auto h-8 w-8 text-danger" />
        <h1 className="mt-4 text-xl font-bold text-ink">לא הצלחנו לטעון את הדשבורד</h1>
        <p className="mt-2 text-sm text-ink/58">{message}</p>
        <button className="mt-5 rounded-md bg-moss px-4 py-2 text-sm font-bold text-white hover:bg-ink" onClick={onRetry}>
          נסה שוב
        </button>
      </div>
    </div>
  );
}

function Sidebar({ navItems }: { navItems: DashboardNavItem[] }) {
  return (
    <aside className="hidden w-72 shrink-0 border-l border-stone/80 bg-ink px-5 py-6 text-white lg:block">
      <div className="flex items-center gap-3">
        <div className="grid h-11 w-11 place-items-center rounded-lg bg-gold text-ink">
          <Landmark className="h-6 w-6" />
        </div>
        <div>
          <p className="text-lg font-bold">ToraFinance</p>
          <p className="text-xs text-white/62">ניהול כולל ארגוני</p>
        </div>
      </div>

      <nav className="mt-9 space-y-1">
        {navItems.map((item) => {
          const Icon = getIcon(item.icon);
          return (
            <button
              key={item.label}
              className={clsx(
                "flex h-11 w-full items-center gap-3 rounded-md px-3 text-sm font-semibold transition",
                item.active ? "bg-white text-ink" : "text-white/72 hover:bg-white/10 hover:text-white"
              )}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="mt-8 rounded-lg border border-white/14 bg-white/8 p-4">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <ShieldCheck className="h-4 w-4 text-gold" />
          מצב אבטחה
        </div>
        <p className="mt-3 text-sm leading-6 text-white/68">RBAC מוכן להרחבה, Swagger פעיל, ו־Audit Log קיים בסכמה.</p>
      </div>
    </aside>
  );
}

function TasksPanel({ tasks }: { tasks: DashboardActionItem[] }) {
  return (
    <div className="rounded-lg border border-stone/80 bg-white p-5 shadow-soft">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-ink">משימות הנהלה</h2>
        <IconButton label="העלאה">
          <Upload className="h-4 w-4" />
        </IconButton>
      </div>

      <div className="mt-5 space-y-3">
        {tasks.map((task) => {
          const Icon = getIcon(task.icon);
          return (
            <button
              key={task.id}
              className="flex w-full items-start gap-3 rounded-lg border border-stone/75 bg-paper/60 p-4 text-right transition hover:border-moss hover:bg-white"
            >
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-moss/10 text-moss">
                <Icon className="h-5 w-5" />
              </span>
              <span>
                <span className="block text-sm font-bold text-ink">{task.title}</span>
                <span className="mt-1 block text-sm text-ink/58">{task.detail}</span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function CommunicationPanel({ items }: { items: DashboardActionItem[] }) {
  return (
    <div className="rounded-lg border border-stone/80 bg-white p-5 shadow-soft">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-ink">ערוצי תקשורת</h2>
        <Sparkles className="h-5 w-5 text-gold" />
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
        {items.map((item) => {
          const Icon = getIcon(item.icon);
          return (
            <button
              key={item.id}
              className="flex items-center gap-3 rounded-lg border border-stone/75 bg-paper/60 p-4 text-right hover:border-moss"
            >
              <Icon className="h-5 w-5 text-moss" />
              <span>
                <span className="block text-sm font-bold">{item.title}</span>
                <span className="block text-sm text-ink/55">{item.detail}</span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ModulesPanel({ modules }: { modules: DashboardModuleItem[] }) {
  return (
    <div className="rounded-lg border border-stone/80 bg-white p-5 shadow-soft">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-lg font-bold text-ink">מודולים פעילים</h2>
          <p className="mt-1 text-sm text-ink/55">נתונים חיים מה־API לפי המודלים הקיימים</p>
        </div>
        <button className="flex h-9 items-center gap-2 self-start rounded-md border border-stone bg-paper px-3 text-sm font-semibold text-ink hover:border-moss">
          <CalendarDays className="h-4 w-4" />
          פעילות חודשית
        </button>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {modules.map((module) => {
          const Icon = getIcon(module.icon);
          return (
            <div key={module.id} className="rounded-lg border border-stone/75 bg-paper/55 p-4">
              <Icon className="h-5 w-5 text-moss" />
              <p className="mt-3 text-sm font-bold text-ink">{module.label}</p>
              <p className="mt-1 text-sm text-ink/55">{module.value}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function DashboardContent({ dashboard }: { dashboard: DashboardSummary }) {
  const cycleLabel = useMemo(() => {
    return new Intl.DateTimeFormat("he-IL", { month: "long", year: "numeric" }).format(new Date(dashboard.generatedAt));
  }, [dashboard.generatedAt]);

  return (
    <main className="min-h-screen">
      <div className="flex min-h-screen">
        <Sidebar navItems={dashboard.navItems} />

        <section className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-20 border-b border-stone/80 bg-paper/90 px-4 py-4 backdrop-blur md:px-8">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <p className="text-sm font-semibold text-moss">כולל אברכים המרכזי</p>
                <h1 className="mt-1 text-2xl font-bold text-ink md:text-3xl">דשבורד ניהול ותזרים</h1>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="flex h-10 min-w-64 items-center gap-2 rounded-md border border-stone bg-white px-3">
                  <Search className="h-4 w-4 text-ink/48" />
                  <input
                    className="w-full border-0 bg-transparent text-sm outline-none placeholder:text-ink/40"
                    placeholder="חיפוש אברך, תורם, קבלה או מסמך"
                  />
                </div>
                <IconButton label="סינון">
                  <Filter className="h-4 w-4" />
                </IconButton>
                <IconButton label="התראות">
                  <Bell className="h-4 w-4" />
                </IconButton>
                <button className="flex h-10 items-center gap-2 rounded-md bg-moss px-4 text-sm font-bold text-white transition hover:bg-ink">
                  <Plus className="h-4 w-4" />
                  פעולה חדשה
                </button>
              </div>
            </div>
          </header>

          <div className="space-y-6 px-4 py-6 md:px-8">
            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {dashboard.metrics.map((metric) => (
                <MetricCard key={metric.label} metric={metric} />
              ))}
            </section>

            <section className="grid gap-6 xl:grid-cols-[minmax(0,1.55fr)_minmax(340px,0.8fr)]">
              <div className="rounded-lg border border-stone/80 bg-white shadow-soft">
                <div className="flex flex-col gap-3 border-b border-stone/70 p-5 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-ink">מחזור מלגות חודשי</h2>
                    <p className="mt-1 text-sm text-ink/55">חישוב זכאות, נוכחות וסטטוס תשלום מתוך ה־DB</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="flex h-9 items-center gap-2 rounded-md border border-stone bg-paper px-3 text-sm font-semibold text-ink hover:border-moss">
                      {cycleLabel}
                      <ChevronDown className="h-4 w-4" />
                    </button>
                    <IconButton label="ייצוא">
                      <Download className="h-4 w-4" />
                    </IconButton>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full min-w-[680px] border-collapse text-right">
                    <thead className="bg-linen/70 text-sm text-ink/60">
                      <tr>
                        <th className="px-5 py-3 font-bold">אברך</th>
                        <th className="px-5 py-3 font-bold">מסלול</th>
                        <th className="px-5 py-3 font-bold">נוכחות</th>
                        <th className="px-5 py-3 font-bold">סכום</th>
                        <th className="px-5 py-3 font-bold">סטטוס</th>
                        <th className="px-5 py-3 font-bold"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {dashboard.scholarshipRows.length === 0 ? (
                        <tr>
                          <td className="px-5 py-8 text-center text-sm text-ink/55" colSpan={6}>
                            אין מלגות להצגה כרגע
                          </td>
                        </tr>
                      ) : (
                        dashboard.scholarshipRows.map((row) => (
                          <tr key={row.id} className="border-t border-stone/55">
                            <td className="px-5 py-4 font-semibold text-ink">{row.name}</td>
                            <td className="px-5 py-4 text-sm text-ink/62">{row.track}</td>
                            <td className="px-5 py-4 text-sm font-semibold text-moss">{row.attendance}</td>
                            <td className="px-5 py-4 font-bold text-ink">{formatCurrency(row.amount)}</td>
                            <td className="px-5 py-4">
                              <span
                                className={clsx(
                                  "inline-flex rounded-md px-2.5 py-1 text-xs font-bold",
                                  row.status === "PAID" && "bg-leaf/12 text-moss",
                                  row.status === "REQUIRES_REVIEW" && "bg-danger/10 text-danger",
                                  row.status !== "PAID" && row.status !== "REQUIRES_REVIEW" && "bg-gold/16 text-ink"
                                )}
                              >
                                {translateScholarshipStatus(row.status)}
                              </span>
                            </td>
                            <td className="px-5 py-4">
                              <IconButton label="פעולות">
                                <MoreHorizontal className="h-4 w-4" />
                              </IconButton>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <TasksPanel tasks={dashboard.tasks} />
            </section>

            <section className="grid gap-6 xl:grid-cols-[minmax(360px,0.85fr)_minmax(0,1.2fr)]">
              <CommunicationPanel items={dashboard.communication} />
              <ModulesPanel modules={dashboard.modules} />
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}

export function DashboardClient() {
  const [dashboard, setDashboard] = useState<DashboardSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [requestKey, setRequestKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    getDashboardSummary(controller.signal)
      .then((summary) => {
        setDashboard(summary);
        setError(null);
      })
      .catch((reason: unknown) => {
        if (controller.signal.aborted) {
          return;
        }

        setError(reason instanceof Error ? reason.message : "שגיאה לא צפויה בטעינת הדשבורד");
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      });

    return () => controller.abort();
  }, [requestKey]);

  if (error) {
    return (
      <ErrorState
        message={error}
        onRetry={() => {
          setIsLoading(true);
          setRequestKey((key) => key + 1);
        }}
      />
    );
  }

  if (isLoading || !dashboard) {
    return <LoadingState />;
  }

  return <DashboardContent dashboard={dashboard} />;
}
