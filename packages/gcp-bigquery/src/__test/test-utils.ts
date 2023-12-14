import { configurationProvider, zodValidator } from "@mondokit/gcp-core";
import { GcpBigQueryConfiguration, gcpBigQueryConfigurationSchema } from "../configuration/index.js";

export const initTestConfig = async (config?: Partial<GcpBigQueryConfiguration>): Promise<GcpBigQueryConfiguration> => {
  process.env.MONDOKIT_PROJECT = "bigquery-tests";
  process.env.MONDOKIT_CONFIG_OVERRIDES = JSON.stringify({
    ...config,
  });
  await configurationProvider.init({ validator: zodValidator(gcpBigQueryConfigurationSchema) });
  return configurationProvider.get<GcpBigQueryConfiguration>();
};
