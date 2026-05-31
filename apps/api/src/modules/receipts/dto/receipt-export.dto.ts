import { ReceiptStatus } from "@prisma/client";
import { AccountingSystem } from "./receipt-import.dto";

export class ReceiptExportDto {
  id!: string;
  donationId!: string;
  donorId!: string;
  receiptNumber!: string;
  receiptDate!: string;
  amount!: number;
  status!: ReceiptStatus;
  accountingSystem!: AccountingSystem | string;
  externalReceiptId?: string | null;
  pdfUrl?: string | null;
  notes?: string | null;
  createdAt!: string;
  updatedAt!: string;
}
