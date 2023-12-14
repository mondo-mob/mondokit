import { gcpCoreConfigurationSchema } from "@mondokit/gcp-core";
import { z } from "zod";

export const gcpDatastoreConfigurationSchema = gcpCoreConfigurationSchema.extend({
  datastoreProjectId: z.string().optional(),
  datastoreApiEndpoint: z.string().optional(),
});

export type GcpDatastoreConfiguration = z.infer<typeof gcpDatastoreConfigurationSchema>;
