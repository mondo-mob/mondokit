import { z } from "zod";
import { configurationProvider } from "@mondokit/gcp-core";
import { gaeJsBigQueryConfigurationSchema } from "@mondokit/gcp-bigquery";
import { gaeJsStorageConfigurationSchema } from "@mondokit/gcp-storage";

const libraryConfig = gaeJsBigQueryConfigurationSchema.merge(gaeJsStorageConfigurationSchema);

export const coreBackupConfigSchema = libraryConfig.extend({
  firestoreBackup: z
    .object({
      enabled: z.boolean().optional(),
      bucket: z.string().optional(),
      folderFormat: z.string().optional(),
      queue: z.string().optional(),
      taskPrefix: z.string().optional(),
      taskService: z.string().optional(),
      timeZone: z.string().optional(),
    })
    .optional(),
});

export type CoreBackupConfiguration = z.infer<typeof coreBackupConfigSchema>;

export const getCoreBackupConfiguration = () => configurationProvider.get<CoreBackupConfiguration>();
