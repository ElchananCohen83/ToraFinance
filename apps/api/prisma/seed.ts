import { PrismaClient, DonationStatus, MaritalStatus, PaymentMethod, ScholarshipStatus } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const avrech = await prisma.avrech.upsert({
    where: { nationalId: "123456789" },
    update: {},
    create: {
      firstName: "דוד",
      lastName: "לוי",
      nationalId: "123456789",
      phone: "050-1234567",
      address: "רחוב הרב קוק 12, ירושלים",
      maritalStatus: MaritalStatus.MARRIED,
      childrenCount: 4,
      joinedAt: new Date("2023-09-01"),
      track: "בוקר עיון",
      internalNotes: "דוגמת נתונים ראשונית"
    }
  });

  const donor = await prisma.donor.upsert({
    where: { id: "seed-donor-main" },
    update: {},
    create: {
      id: "seed-donor-main",
      fullName: "משפחת רוזנבלום",
      email: "donor@example.com",
      phone: "052-7654321",
      country: "ישראל",
      city: "בני ברק",
      isRecurring: true
    }
  });

  await prisma.donation.create({
    data: {
      donorId: donor.id,
      amount: 1800,
      paymentMethod: PaymentMethod.BANK_TRANSFER,
      status: DonationStatus.PAID,
      campaign: "תמיכה חודשית",
      paidAt: new Date()
    }
  });

  await prisma.scholarship.upsert({
    where: {
      avrechId_month_year: {
        avrechId: avrech.id,
        month: 5,
        year: 2026
      }
    },
    update: {},
    create: {
      avrechId: avrech.id,
      month: 5,
      year: 2026,
      baseAmount: 2200,
      bonusAmount: 200,
      deduction: 0,
      finalAmount: 2400,
      status: ScholarshipStatus.APPROVED
    }
  });
}

main()
  .finally(async () => {
    await prisma.$disconnect();
  });
