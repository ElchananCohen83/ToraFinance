import { Module } from "@nestjs/common";
import { ReceiptsController } from "./receipts.controller";
import { ReceiptsService } from "./receipts.service";
import { ReceiptSyncService } from "./integrations/receipt-sync.service";

@Module({
  controllers: [ReceiptsController],
  providers: [ReceiptsService, ReceiptSyncService],
  exports: [ReceiptsService, ReceiptSyncService]
})
export class ReceiptsModule {}
