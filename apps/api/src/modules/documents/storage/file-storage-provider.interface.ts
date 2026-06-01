export const FILE_STORAGE_PROVIDER = Symbol("FILE_STORAGE_PROVIDER");

export interface FileStorageProvider {
  readonly name: string;
  resolveStorageKey(fileUrl: string): string;
  getPublicUrl(storageKey: string): string;
  deleteObject(storageKey: string): Promise<void>;
}

