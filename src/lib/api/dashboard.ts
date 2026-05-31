export type DashboardTone = "green" | "gold" | "red" | "neutral";

export type DashboardNavItem = {
  label: string;
  icon: string;
  active?: boolean;
};

export type DashboardMetric = {
  label: string;
  value: number;
  unit: "ILS" | "count";
  delta: string;
  tone: DashboardTone;
};

export type DashboardScholarshipRow = {
  id: string;
  name: string;
  track: string;
  amount: number;
  status: "DRAFT" | "APPROVED" | "PAID" | "LOCKED" | "REQUIRES_REVIEW";
  attendance: string;
};

export type DashboardActionItem = {
  id: string;
  title: string;
  detail: string;
  icon: string;
};

export type DashboardModuleItem = {
  id: string;
  label: string;
  value: string;
  icon: string;
};

export type DashboardActivityItem = {
  id: string;
  title: string;
  detail: string;
  createdAt: string;
  receiptStatus: string;
};

export type DashboardSummary = {
  generatedAt: string;
  navItems: DashboardNavItem[];
  metrics: DashboardMetric[];
  scholarshipRows: DashboardScholarshipRow[];
  tasks: DashboardActionItem[];
  modules: DashboardModuleItem[];
  communication: DashboardActionItem[];
  recentActivity: DashboardActivityItem[];
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export async function getDashboardSummary(signal?: AbortSignal): Promise<DashboardSummary> {
  const response = await fetch(`${API_BASE_URL}/api/dashboard/summary`, {
    cache: "no-store",
    signal
  });

  if (!response.ok) {
    throw new Error("לא ניתן לטעון את נתוני הדשבורד");
  }

  return response.json() as Promise<DashboardSummary>;
}
