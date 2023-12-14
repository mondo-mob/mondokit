import { Storage, StorageOptions } from "@google-cloud/storage";
import { configurationProvider, gcpCoreConfigurationSchema, zodValidator } from "@mondokit/gcp-core";
import { GcpStorageConfiguration, gcpStorageConfigurationSchema } from "../configuration/index.js";

export const initTestConfig = async (config?: Partial<GcpStorageConfiguration>): Promise<GcpStorageConfiguration> => {
  const schema = gcpCoreConfigurationSchema.merge(gcpStorageConfigurationSchema);
  process.env.GAEJS_PROJECT = "storage-tests";
  process.env.GAEJS_CONFIG_OVERRIDES = JSON.stringify({
    storage: {
      emulatorHost: "http://127.0.0.1:9199",
    },
    ...config,
  });
  await configurationProvider.init({ validator: zodValidator<GcpStorageConfiguration>(schema) });
  return configurationProvider.get<GcpStorageConfiguration>();
};

export const connectEmulatorStorage = (settings?: StorageOptions): Storage => {
  return new Storage({
    projectId: "storage-tests",
    apiEndpoint: "localhost:9199",
    credentials: { client_email: "test@example.com", private_key: "{}" },
    ...settings,
  });
};
