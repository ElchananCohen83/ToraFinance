import { AccountingSystem, ReceiptImportDto } from "../dto/receipt-import.dto";
import { ReceiptExportDto } from "../dto/receipt-export.dto";

export interface AccountingProvider {
  readonly system: AccountingSystem;
  importReceipt(receipt: ReceiptImportDto): Promise<ReceiptExportDto>;
  exportReceipt(receipt: ReceiptExportDto): Promise<void>;
  syncReceipts(since?: Date): Promise<ReceiptImportDto[]>;
}
