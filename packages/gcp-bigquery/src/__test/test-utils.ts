import { configurationProvider, zodValidator } from "@mondokit/gcp-core";
import { GcpBigQueryConfiguration, gcpBigQueryConfigurationSchema } from "../configuration/index.js";

export const initTestConfig = async (config?: Partial<GcpBigQueryConfiguration>): Promise<GcpBigQueryConfiguration> => {
  process.env.GAEJS_PROJECT = "bigquery-tests";
  process.env.GAEJS_CONFIG_OVERRIDES = JSON.stringify({
    ...config,
  });
  await configurationProvider.init({ validator: zodValidator(gcpBigQueryConfigurationSchema) });
  return configurationProvider.get<GcpBigQueryConfiguration>();
};
