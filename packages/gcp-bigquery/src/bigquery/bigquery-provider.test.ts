import { BigQuery } from "@google-cloud/bigquery";
import { BigQueryProvider } from "./bigquery-provider.js";
import { connectBigQuery } from "./connect.js";
import { initTestConfig } from "../__test/test-utils.js";

vi.mock("@google-cloud/bigquery");

describe("BigQueryProvider", () => {
  beforeAll(async () => {
    await initTestConfig();
  });

  it("auto inits bigquery from env config", async () => {
    const provider = new BigQueryProvider();
    provider.init();
    expect(provider.get()).toBeInstanceOf(BigQuery);
  });

  it("inits from existing instance", async () => {
    const provider = new BigQueryProvider();
    const bigQuery = connectBigQuery();
    provider.init(bigQuery);
    expect(provider.get()).toBe(bigQuery);
  });
});
