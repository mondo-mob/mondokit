import { gcpCoreConfigurationSchema } from "@mondokit/gcp-core";
import { z } from "zod";

export const gcpFirestoreConfigurationSchema = gcpCoreConfigurationSchema.extend({
  firestoreProjectId: z.string().optional(),
  firestoreHost: z.string().optional(),
  firestorePort: z.number().optional(),
});

export type GcpFirestoreConfiguration = z.infer<typeof gcpFirestoreConfigurationSchema>;
