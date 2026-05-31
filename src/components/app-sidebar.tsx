"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Archive,
  ChartNoAxesCombined,
  CircleDollarSign,
  Gauge,
  HandCoins,
  Landmark,
  LockKeyhole,
  ReceiptText,
  ShieldCheck,
  UserRound,
  UsersRound
} from "lucide-react";
import { clsx } from "clsx";

const navItems = [
  { label: "דשבורד", href: "/", icon: Gauge },
  { label: "אברכים", href: "/avrechim", icon: UsersRound },
  { label: "מלגות", href: "/scholarships", icon: HandCoins },
  { label: "תורמים", href: "/donors", icon: UserRound },
  { label: "תרומות", href: "/donations", icon: CircleDollarSign },
  { label: "קבלות", href: "/receipts", icon: ReceiptText },
  { label: "מסמכים", href: "/documents", icon: Archive },
  { label: "דוחות", href: "/reports", icon: ChartNoAxesCombined },
  { label: "הרשאות", href: "/permissions", icon: LockKeyhole }
];

export function AppSidebar() {
  const pathname = usePathname();

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
          const Icon = item.icon;
          const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "flex h-11 w-full items-center gap-3 rounded-md px-3 text-sm font-semibold transition",
                isActive ? "bg-white text-ink" : "text-white/72 hover:bg-white/10 hover:text-white"
              )}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </Link>
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
