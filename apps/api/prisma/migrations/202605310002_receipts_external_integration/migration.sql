ALTER TABLE "Receipt" ADD COLUMN "donorId" TEXT;
ALTER TABLE "Receipt" ADD COLUMN "receiptDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "Receipt" ADD COLUMN "amount" DECIMAL(12,2) NOT NULL DEFAULT 0;
ALTER TABLE "Receipt" ADD COLUMN "accountingSystem" TEXT NOT NULL DEFAULT 'UNKNOWN';
ALTER TABLE "Receipt" ADD COLUMN "externalReceiptId" TEXT;
ALTER TABLE "Receipt" ADD COLUMN "notes" TEXT;

UPDATE "Receipt"
SET
  "donorId" = "Donation"."donorId",
  "amount" = "Donation"."amount",
  "receiptDate" = COALESCE("Receipt"."issuedAt", "Receipt"."createdAt")
FROM "Donation"
WHERE "Receipt"."donationId" = "Donation"."id";

ALTER TABLE "Receipt" ALTER COLUMN "donorId" SET NOT NULL;

CREATE INDEX "Receipt_donorId_idx" ON "Receipt"("donorId");
CREATE INDEX "Receipt_status_idx" ON "Receipt"("status");
CREATE INDEX "Receipt_accountingSystem_idx" ON "Receipt"("accountingSystem");
CREATE INDEX "Receipt_receiptDate_idx" ON "Receipt"("receiptDate");

ALTER TABLE "Receipt" ADD CONSTRAINT "Receipt_donorId_fkey" FOREIGN KEY ("donorId") REFERENCES "Donor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
