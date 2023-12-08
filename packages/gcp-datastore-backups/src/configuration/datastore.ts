import { z } from "zod";
import { configurationProvider } from "@mondokit/gcp-core";
import { gaeJsDatastoreConfigurationSchema } from "@mondokit/gcp-datastore";
import { coreBackupConfigSchema } from "./core.js";

export const gaeJsDatastoreBackupConfigSchema = gaeJsDatastoreConfigurationSchema.merge(coreBackupConfigSchema);

export type GaeJsDatastoreBackupConfiguration = z.infer<typeof gaeJsDatastoreBackupConfigSchema>;

export const getDatastoreBackupConfiguration = () => configurationProvider.get<GaeJsDatastoreBackupConfiguration>();
