import { Storage, StorageOptions } from "@google-cloud/storage";
import { configurationProvider, createLogger } from "@mondokit/gcp-core";
import { GaeJsStorageConfiguration } from "../configuration/index.js";

export interface StorageConnectOptions {
  configuration?: GaeJsStorageConfiguration;
  storageOptions?: StorageOptions;
}

export const connectStorage = (options?: StorageConnectOptions): Storage => {
  const logger = createLogger("connectStorage");
  const { storage: configuration } = options?.configuration || configurationProvider.get<GaeJsStorageConfiguration>();

  logger.info("Initialising Storage");
  const storageSettings: StorageOptions = {
    projectId: configuration?.projectId || undefined,
    apiEndpoint: configuration?.apiEndpoint || undefined,
    ...options?.storageOptions,
  };

  if (configuration?.serviceAccountKey) {
    logger.info(`Using custom storage service account from config`);
    storageSettings.credentials = JSON.parse(configuration.serviceAccountKey);
  }

  const emulatorHost = configuration?.emulatorHost;
  if (emulatorHost) {
    logger.info(`Using storage emulator: ${emulatorHost}`);
    process.env.STORAGE_EMULATOR_HOST = emulatorHost;
  }

  return new Storage(storageSettings);
};
