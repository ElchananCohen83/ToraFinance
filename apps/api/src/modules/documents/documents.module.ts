import { Module } from "@nestjs/common";
import { PrismaModule } from "../../prisma/prisma.module";
import { DocumentsController } from "./documents.controller";
import { DocumentsService } from "./documents.service";
import { FILE_STORAGE_PROVIDER } from "./storage/file-storage-provider.interface";
import { LocalStorageProvider } from "./storage/local-storage.provider";

@Module({
  imports: [PrismaModule],
  controllers: [DocumentsController],
  providers: [
    DocumentsService,
    LocalStorageProvider,
    {
      provide: FILE_STORAGE_PROVIDER,
      useExisting: LocalStorageProvider
    }
  ]
})
export class DocumentsModule {}

