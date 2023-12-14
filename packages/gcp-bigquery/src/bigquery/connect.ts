import { BigQuery, BigQueryOptions } from "@google-cloud/bigquery";
import { configurationProvider, createLogger } from "@mondokit/gcp-core";
import { GcpBigQueryConfiguration } from "../configuration/index.js";

export interface BigQueryConnectOptions {
  configuration?: GcpBigQueryConfiguration;
  bigQueryOptions?: BigQueryOptions;
}

export const connectBigQuery = (options?: BigQueryConnectOptions): BigQuery => {
  const logger = createLogger("connectBigQuery");
  const configuration = options?.configuration || configurationProvider.get<GcpBigQueryConfiguration>();

  logger.info("Initialising BigQuery");
  const bigQueryOptions: BigQueryOptions = {
    projectId: configuration.bigQuery?.projectId || configuration.projectId,
    ...options?.bigQueryOptions,
  };

  return new BigQuery(bigQueryOptions);
};
