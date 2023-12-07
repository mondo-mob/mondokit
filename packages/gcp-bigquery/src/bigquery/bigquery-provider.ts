import { BigQuery, BigQueryOptions } from "@google-cloud/bigquery";
import { Provider } from "@mondokit/gcp-core";
import { connectBigQuery } from "./connect.js";

export class BigQueryProvider extends Provider<BigQuery> {
  init(bigQueryOrSettings?: BigQuery | BigQueryOptions): void {
    if (bigQueryOrSettings instanceof BigQuery) {
      this.set(bigQueryOrSettings);
    } else {
      this.set(connectBigQuery({ bigQueryOptions: bigQueryOrSettings }));
    }
  }
}

export const bigQueryProvider = new BigQueryProvider(
  undefined,
  "No BigQuery instance found. Please initialise bigQueryProvider."
);
