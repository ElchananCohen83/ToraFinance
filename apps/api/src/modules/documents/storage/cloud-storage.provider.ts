import { Injectable, NotImplementedException } from "@nestjs/common";
import { FileStorageProvider } from "./file-storage-provider.interface";

@Injectable()
export class CloudStorageProvider implements FileStorageProvider {
  readonly name = "cloud";

  resolveStorageKey(fileUrl: string) {
    return fileUrl.trim();
  }

  getPublicUrl(storageKey: string) {
    return storageKey;
  }

  async deleteObject(): Promise<void> {
    throw new NotImplementedException("Cloud document storage is not configured yet");
  }
}

