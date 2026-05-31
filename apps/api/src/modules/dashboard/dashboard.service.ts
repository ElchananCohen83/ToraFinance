import { Injectable } from "@nestjs/common";
import { DonationStatus, PersonStatus, Prisma, ReceiptStatus, ScholarshipStatus } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getSummary() {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const yearStart = new Date(now.getFullYear(), 0, 1);
    const overdueCutoff = new Date(now);
    overdueCutoff.setDate(overdueCutoff.getDate() - 14);

    const [
      activeAvrechim,
      totalAvrechim,
      recurringDonors,
      totalDonors,
      monthlyDonations,
      yearlyDonations,
      monthlyScholarships,
      pendingPledges,
      pendingReceipts,
      reviewScholarships,
      missingDocuments,
      overduePledges,
      documentCount,
      auditLogCount,
      scholarshipRows,
      recentDonations
    ] = await Promise.all([
      this.prisma.avrech.count({ where: { status: PersonStatus.ACTIVE } }),
      this.prisma.avrech.count(),
      this.prisma.donor.count({ where: { isRecurring: true } }),
      this.prisma.donor.count(),
      this.prisma.donation.aggregate({
        _sum: { amount: true },
        where: {
          status: DonationStatus.PAID,
          paidAt: {
            gte: monthStart,
            lt: nextMonthStart
          }
        }
      }),
      this.prisma.donation.aggregate({
        _sum: { amount: true },
        where: {
          status: DonationStatus.PAID,
          paidAt: {
            gte: yearStart
          }
        }
      }),
      this.prisma.scholarship.aggregate({
        _sum: { finalAmount: true },
        where: {
          status: { in: [ScholarshipStatus.APPROVED, ScholarshipStatus.PAID] },
          year: now.getFullYear(),
          month: now.getMonth() + 1
        }
      }),
      this.prisma.donation.aggregate({
        _sum: { amount: true },
        where: { status: DonationStatus.PLEDGED }
      }),
      this.prisma.donation.count({
        where: {
          status: DonationStatus.PAID,
          receipt: null
        }
      }),
      this.prisma.scholarship.count({
        where: {
          status: { in: [ScholarshipStatus.DRAFT, ScholarshipStatus.REQUIRES_REVIEW] }
        }
      }),
      this.prisma.avrech.count({
        where: {
          status: PersonStatus.ACTIVE,
          documents: { none: {} }
        }
      }),
      this.prisma.donation.count({
        where: {
          status: DonationStatus.PLEDGED,
          pledgeDueDate: {
            lt: overdueCutoff
          }
        }
      }),
      this.prisma.document.count(),
      this.prisma.auditLog.count(),
      this.prisma.scholarship.findMany({
        include: {
          avrech: {
            include: {
              attendanceRecords: {
                where: {
                  date: {
                    gte: monthStart,
                    lt: nextMonthStart
                  }
                }
              }
            }
          }
        },
        orderBy: [{ year: "desc" }, { month: "desc" }, { createdAt: "desc" }],
        take: 8
      }),
      this.prisma.donation.findMany({
        include: {
          donor: true,
          receipt: true
        },
        orderBy: { createdAt: "desc" },
        take: 5
      })
    ]);

    const monthlyDonationAmount = this.toNumber(monthlyDonations._sum.amount);
    const yearlyDonationAmount = this.toNumber(yearlyDonations._sum.amount);
    const monthlyScholarshipAmount = this.toNumber(monthlyScholarships._sum.finalAmount);
    const pendingPledgeAmount = this.toNumber(pendingPledges._sum.amount);

    return {
      generatedAt: now.toISOString(),
      navItems: [
        { label: "דשבורד", icon: "gauge", active: true },
        { label: "אברכים", icon: "users" },
        { label: "מלגות", icon: "scholarships" },
        { label: "תורמים", icon: "donor" },
        { label: "תרומות", icon: "donations" },
        { label: "קבלות", icon: "receipts" },
        { label: "מסמכים", icon: "documents" },
        { label: "דוחות", icon: "reports" },
        { label: "הרשאות", icon: "permissions" }
      ],
      metrics: [
        {
          label: "תרומות החודש",
          value: monthlyDonationAmount,
          unit: "ILS",
          delta: `${recentDonations.length} תרומות אחרונות במעקב`,
          tone: "green"
        },
        {
          label: "מלגות לתשלום",
          value: monthlyScholarshipAmount,
          unit: "ILS",
          delta: `${activeAvrechim} אברכים פעילים`,
          tone: "gold"
        },
        {
          label: "התחייבויות פתוחות",
          value: pendingPledgeAmount,
          unit: "ILS",
          delta: `${overduePledges} בפיגור מעל 14 יום`,
          tone: overduePledges > 0 ? "red" : "neutral"
        },
        {
          label: "תורמים פעילים",
          value: recurringDonors,
          unit: "count",
          delta: `${totalDonors} תורמים במערכת`,
          tone: "neutral"
        }
      ],
      scholarshipRows: scholarshipRows.map((scholarship) => ({
        id: scholarship.id,
        name: `${scholarship.avrech.firstName} ${scholarship.avrech.lastName}`,
        track: scholarship.avrech.track ?? "ללא מסלול",
        amount: this.toNumber(scholarship.finalAmount),
        status: scholarship.status,
        attendance: this.formatAttendance(scholarship.avrech.attendanceRecords)
      })),
      tasks: [
        {
          id: "pending-receipts",
          title: "הפקת קבלות לתרומות ששולמו",
          detail: `${pendingReceipts} תרומות ממתינות לקבלה`,
          icon: "receipts"
        },
        {
          id: "review-scholarships",
          title: "בדיקת מחזור מלגות",
          detail: `${reviewScholarships} מלגות בטיוטה או דורשות בדיקה`,
          icon: "review"
        },
        {
          id: "missing-documents",
          title: "מסמכי אברכים חסרים",
          detail: `${missingDocuments} אברכים פעילים ללא מסמך משויך`,
          icon: "documents"
        },
        {
          id: "overdue-pledges",
          title: "תזכורות לתורמים",
          detail: `${overduePledges} התחייבויות בפיגור מעל 14 יום`,
          icon: "alerts"
        }
      ],
      modules: [
        { id: "avrechim", label: "ניהול אברכים", value: `${activeAvrechim}/${totalAvrechim} פעילים`, icon: "users" },
        { id: "scholarships", label: "מלגות ותשלומים", value: `${scholarshipRows.length} רשומות אחרונות`, icon: "banknote" },
        { id: "donations", label: "תרומות ותורמים", value: `${yearlyDonationAmount} ש"ח השנה`, icon: "wallet" },
        { id: "accounting", label: "הנהלת חשבונות", value: `${pendingPledgeAmount} ש"ח התחייבויות`, icon: "landmark" },
        { id: "documents", label: "מסמכים וקבצים", value: `${documentCount} מסמכים`, icon: "file" },
        { id: "security", label: "אבטחה והרשאות", value: `${auditLogCount} פעולות Audit`, icon: "shield" }
      ],
      communication: [
        {
          id: "email-receipts",
          title: "קבלות במייל",
          detail: `${pendingReceipts} קבלות ממתינות לשליחה`,
          icon: "mail"
        },
        {
          id: "donor-reminders",
          title: "WhatsApp לתורמים",
          detail: `${overduePledges} תזכורות מוצעות`,
          icon: "message"
        },
        {
          id: "financial-alerts",
          title: "חריגות כספיות",
          detail: `${reviewScholarships + overduePledges} פריטים דורשים בדיקה`,
          icon: "alerts"
        }
      ],
      recentActivity: recentDonations.map((donation) => ({
        id: donation.id,
        title: `תרומה מאת ${donation.donor.fullName}`,
        detail: `${this.toNumber(donation.amount)} ${donation.currency} · ${this.translateDonationStatus(donation.status)}`,
        createdAt: donation.createdAt.toISOString(),
        receiptStatus: donation.receipt?.status ?? ReceiptStatus.DRAFT
      })),
      activeAvrechim,
      activeDonors: recurringDonors,
      monthlyDonations: monthlyDonationAmount,
      monthlyScholarships: monthlyScholarshipAmount,
      pendingPledges: pendingPledgeAmount
    };
  }

  private toNumber(value: Prisma.Decimal | null | undefined) {
    return value ? Number(value) : 0;
  }

  private formatAttendance(records: { present: boolean }[]) {
    if (records.length === 0) {
      return "אין נתונים";
    }

    const present = records.filter((record) => record.present).length;
    return `${Math.round((present / records.length) * 100)}%`;
  }

  private translateDonationStatus(status: DonationStatus) {
    const labels: Record<DonationStatus, string> = {
      CANCELLED: "בוטלה",
      FAILED: "נכשלה",
      PAID: "שולמה",
      PLEDGED: "התחייבות"
    };

    return labels[status];
  }
}
