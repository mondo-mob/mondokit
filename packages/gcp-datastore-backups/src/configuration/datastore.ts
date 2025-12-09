import { z } from "zod";
import { configurationProvider } from "@mondokit/gcp-core";
import { gcpDatastoreConfigurationSchema } from "@mondokit/gcp-datastore";
import { coreBackupConfigSchema } from "./core.js";

export const gcpDatastoreBackupConfigSchema = z.object({
  ...coreBackupConfigSchema.shape,
  ...gcpDatastoreConfigurationSchema.shape,
});

export type GcpDatastoreBackupConfiguration = z.infer<typeof gcpDatastoreBackupConfigSchema>;

export const getDatastoreBackupConfiguration = () => configurationProvider.get<GcpDatastoreBackupConfiguration>();
