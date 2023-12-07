import { configurationProvider, zodValidator } from "@mondokit/gcp-core";
import { GaeJsBigQueryConfiguration, gaeJsBigQueryConfigurationSchema } from "../configuration/index.js";

export const initTestConfig = async (
  config?: Partial<GaeJsBigQueryConfiguration>
): Promise<GaeJsBigQueryConfiguration> => {
  process.env.GAEJS_PROJECT = "bigquery-tests";
  process.env.GAEJS_CONFIG_OVERRIDES = JSON.stringify({
    ...config,
  });
  await configurationProvider.init({ validator: zodValidator(gaeJsBigQueryConfigurationSchema) });
  return configurationProvider.get<GaeJsBigQueryConfiguration>();
};
