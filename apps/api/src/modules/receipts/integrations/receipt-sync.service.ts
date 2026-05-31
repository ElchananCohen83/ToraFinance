import { Injectable, NotFoundException } from "@nestjs/common";
import { AccountingProvider } from "./accounting-provider.interface";
import { AccountingSystem, ReceiptImportDto } from "../dto/receipt-import.dto";

@Injectable()
export class ReceiptSyncService {
  private readonly providers = new Map<AccountingSystem, AccountingProvider>();

  registerProvider(provider: AccountingProvider) {
    this.providers.set(provider.system, provider);
  }

  listProviders() {
    return Array.from(this.providers.keys());
  }

  async pullReceipts(system: AccountingSystem, since?: Date): Promise<ReceiptImportDto[]> {
    const provider = this.providers.get(system);

    if (!provider) {
      throw new NotFoundException(`Accounting provider ${system} is not registered`);
    }

    return provider.syncReceipts(since);
  }
}
