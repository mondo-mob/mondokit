import { gcpCoreConfigurationSchema } from "@mondokit/gcp-core";
import { z } from "zod";

export const gcpBigQueryConfigurationSchema = gcpCoreConfigurationSchema.extend({
  bigQuery: z
    .object({
      projectId: z.string().optional(),
    })
    .optional(),
});

export type GcpBigQueryConfiguration = z.infer<typeof gcpBigQueryConfigurationSchema>;
