import { Storage, StorageOptions } from "@google-cloud/storage";
import { Provider } from "@mondokit/gcp-core";
import { connectStorage } from "./connect.js";

class StorageProvider extends Provider<Storage> {
  init(storageOrOptions?: Storage | StorageOptions): void {
    if (storageOrOptions instanceof Storage) {
      this.set(storageOrOptions);
    } else {
      this.set(connectStorage({ storageOptions: storageOrOptions }));
    }
  }
}

export const storageProvider = new StorageProvider(
  undefined,
  "No Storage instance found. Please initialise storageProvider."
);
