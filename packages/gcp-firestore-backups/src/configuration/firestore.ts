import { z } from "zod";
import { configurationProvider } from "@mondokit/gcp-core";
import { gcpFirestoreConfigurationSchema } from "@mondokit/gcp-firestore";
import { coreBackupConfigSchema } from "./core.js";

export const firestoreBackupConfigSchema = z.object({
  ...coreBackupConfigSchema.shape,
  ...gcpFirestoreConfigurationSchema.shape,
});

export type FirestoreBackupConfiguration = z.infer<typeof firestoreBackupConfigSchema>;

export const getFirestoreBackupConfiguration = () => configurationProvider.get<FirestoreBackupConfiguration>();
