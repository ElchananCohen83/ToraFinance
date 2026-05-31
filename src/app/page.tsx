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
  FileCheck2,
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

type Metric = {
  label: string;
  value: string;
  delta: string;
  tone: "green" | "gold" | "red" | "neutral";
};

type NavItem = {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  active?: boolean;
};

const navItems: NavItem[] = [
  { label: "דשבורד", icon: Gauge, active: true },
  { label: "אברכים", icon: UsersRound },
  { label: "מלגות", icon: HandCoins },
  { label: "תורמים", icon: UserRound },
  { label: "תרומות", icon: CircleDollarSign },
  { label: "קבלות", icon: ReceiptText },
  { label: "מסמכים", icon: Archive },
  { label: "דוחות", icon: ChartNoAxesCombined },
  { label: "הרשאות", icon: LockKeyhole }
];

const metrics: Metric[] = [
  { label: "תרומות החודש", value: "₪428,750", delta: "18% מעל היעד", tone: "green" },
  { label: "מלגות לתשלום", value: "₪191,400", delta: "124 אברכים", tone: "gold" },
  { label: "התחייבויות פתוחות", value: "₪73,200", delta: "12 דורשות מעקב", tone: "red" },
  { label: "תורמים פעילים", value: "356", delta: "31 הוראות קבע חדשות", tone: "neutral" }
];

const scholarshipRows = [
  { name: "הרב דוד לוי", track: "בוקר עיון", amount: "₪2,400", status: "מוכן להעברה", attendance: "96%" },
  { name: "הרב מנחם כהן", track: "חושן משפט", amount: "₪2,100", status: "נדרשת בדיקה", attendance: "82%" },
  { name: "הרב יעקב פרידמן", track: "ערב הלכה", amount: "₪1,850", status: "שולם", attendance: "100%" },
  { name: "הרב אליהו ביטון", track: "כולל יום שלם", amount: "₪2,750", status: "מוכן להעברה", attendance: "94%" }
];

const tasks = [
  { title: "הפקת קבלות לתרומות אשראי", detail: "46 קבלות ממתינות לשליחה", icon: ReceiptText },
  { title: "נעילת חודש מלגות", detail: "מאי 2026 לאחר אישור מנהל כספים", icon: BadgeCheck },
  { title: "מסמכי בנק חסרים", detail: "7 אברכים ללא אישור חשבון תקף", icon: FileCheck2 },
  { title: "תזכורות לתורמים", detail: "18 התחייבויות בפיגור מעל 14 יום", icon: Bell }
];

const modules = [
  { label: "ניהול אברכים", value: "124 פעילים", icon: UsersRound },
  { label: "מלגות ותשלומים", value: "3 מחזורים פתוחים", icon: Banknote },
  { label: "תרומות ותורמים", value: "₪1.8M השנה", icon: WalletCards },
  { label: "הנהלת חשבונות", value: "92% התאמות בנק", icon: Landmark },
  { label: "מסמכים וקבצים", value: "1,284 קבצים", icon: FileText },
  { label: "אבטחה והרשאות", value: "5 תפקידים", icon: ShieldCheck }
];

function MetricCard({ metric }: { metric: Metric }) {
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
      <strong className="mt-4 block text-3xl font-bold tracking-normal text-ink">{metric.value}</strong>
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

export default function Home() {
  return (
    <main className="min-h-screen">
      <div className="flex min-h-screen">
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
              const Icon = item.icon;
              return (
                <button
                  key={item.label}
                  className={clsx(
                    "flex h-11 w-full items-center gap-3 rounded-md px-3 text-sm font-semibold transition",
                    item.active
                      ? "bg-white text-ink"
                      : "text-white/72 hover:bg-white/10 hover:text-white"
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
            <p className="mt-3 text-sm leading-6 text-white/68">
              RBAC פעיל, 2FA למנהלים, Audit Log מופעל לכל שינוי כספי.
            </p>
          </div>
        </aside>

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
              {metrics.map((metric) => (
                <MetricCard key={metric.label} metric={metric} />
              ))}
            </section>

            <section className="grid gap-6 xl:grid-cols-[minmax(0,1.55fr)_minmax(340px,0.8fr)]">
              <div className="rounded-lg border border-stone/80 bg-white shadow-soft">
                <div className="flex flex-col gap-3 border-b border-stone/70 p-5 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-ink">מחזור מלגות חודשי</h2>
                    <p className="mt-1 text-sm text-ink/55">חישוב זכאות, נוכחות וסטטוס תשלום לפני נעילה</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="flex h-9 items-center gap-2 rounded-md border border-stone bg-paper px-3 text-sm font-semibold text-ink hover:border-moss">
                      מאי 2026
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
                      {scholarshipRows.map((row) => (
                        <tr key={row.name} className="border-t border-stone/55">
                          <td className="px-5 py-4 font-semibold text-ink">{row.name}</td>
                          <td className="px-5 py-4 text-sm text-ink/62">{row.track}</td>
                          <td className="px-5 py-4 text-sm font-semibold text-moss">{row.attendance}</td>
                          <td className="px-5 py-4 font-bold text-ink">{row.amount}</td>
                          <td className="px-5 py-4">
                            <span
                              className={clsx(
                                "inline-flex rounded-md px-2.5 py-1 text-xs font-bold",
                                row.status === "שולם" && "bg-leaf/12 text-moss",
                                row.status === "נדרשת בדיקה" && "bg-danger/10 text-danger",
                                row.status === "מוכן להעברה" && "bg-gold/16 text-ink"
                              )}
                            >
                              {row.status}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <IconButton label="פעולות">
                              <MoreHorizontal className="h-4 w-4" />
                            </IconButton>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="rounded-lg border border-stone/80 bg-white p-5 shadow-soft">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-ink">משימות הנהלה</h2>
                  <IconButton label="העלאה">
                    <Upload className="h-4 w-4" />
                  </IconButton>
                </div>

                <div className="mt-5 space-y-3">
                  {tasks.map((task) => {
                    const Icon = task.icon;
                    return (
                      <button
                        key={task.title}
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
            </section>

            <section className="grid gap-6 xl:grid-cols-[minmax(360px,0.85fr)_minmax(0,1.2fr)]">
              <div className="rounded-lg border border-stone/80 bg-white p-5 shadow-soft">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-ink">ערוצי תקשורת</h2>
                  <Sparkles className="h-5 w-5 text-gold" />
                </div>
                <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                  <button className="flex items-center gap-3 rounded-lg border border-stone/75 bg-paper/60 p-4 text-right hover:border-moss">
                    <Mail className="h-5 w-5 text-moss" />
                    <span>
                      <span className="block text-sm font-bold">קבלות במייל</span>
                      <span className="block text-sm text-ink/55">146 שליחות אוטומטיות החודש</span>
                    </span>
                  </button>
                  <button className="flex items-center gap-3 rounded-lg border border-stone/75 bg-paper/60 p-4 text-right hover:border-moss">
                    <MessageCircle className="h-5 w-5 text-moss" />
                    <span>
                      <span className="block text-sm font-bold">WhatsApp לתורמים</span>
                      <span className="block text-sm text-ink/55">22 תזכורות מוכנות לאישור</span>
                    </span>
                  </button>
                  <button className="flex items-center gap-3 rounded-lg border border-stone/75 bg-paper/60 p-4 text-right hover:border-moss">
                    <AlertTriangle className="h-5 w-5 text-danger" />
                    <span>
                      <span className="block text-sm font-bold">חריגות כספיות</span>
                      <span className="block text-sm text-ink/55">3 תנועות דורשות בדיקה</span>
                    </span>
                  </button>
                </div>
              </div>

              <div className="rounded-lg border border-stone/80 bg-white p-5 shadow-soft">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-ink">מודולים פעילים</h2>
                    <p className="mt-1 text-sm text-ink/55">תשתית מודולרית להרחבה לפי תפקיד והרשאות</p>
                  </div>
                  <button className="flex h-9 items-center gap-2 self-start rounded-md border border-stone bg-paper px-3 text-sm font-semibold text-ink hover:border-moss">
                    <CalendarDays className="h-4 w-4" />
                    פעילות חודשית
                  </button>
                </div>
                <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {modules.map((module) => {
                    const Icon = module.icon;
                    return (
                      <div key={module.label} className="rounded-lg border border-stone/75 bg-paper/55 p-4">
                        <Icon className="h-5 w-5 text-moss" />
                        <p className="mt-3 text-sm font-bold text-ink">{module.label}</p>
                        <p className="mt-1 text-sm text-ink/55">{module.value}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}
