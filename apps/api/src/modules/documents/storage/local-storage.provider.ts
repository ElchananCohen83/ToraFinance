import { Injectable } from "@nestjs/common";
import { FileStorageProvider } from "./file-storage-provider.interface";

@Injectable()
export class LocalStorageProvider implements FileStorageProvider {
  readonly name = "local";

  resolveStorageKey(fileUrl: string) {
    return fileUrl.trim();
  }

  getPublicUrl(storageKey: string) {
    return storageKey;
  }

  async deleteObject() {
    // Metadata deletion is handled in PostgreSQL. Local binary cleanup can be added when uploads are wired in.
  }
}

