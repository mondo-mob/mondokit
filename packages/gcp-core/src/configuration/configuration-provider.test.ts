import { z } from "zod";
import { ENV_VAR_CONFIG_OVERRIDES, zodValidator } from "@mondokit/core";
import { ConfigurationProvider } from "./configuration-provider.js";
import { gcpCoreConfigurationSchema } from "./schema.js";
import { ENV_VAR_PROJECT } from "./variables.js";

const testConfigSchema = gcpCoreConfigurationSchema.extend({
  appName: z.string(),
});
type TestConfig = z.infer<typeof testConfigSchema>;

const validator = zodValidator(testConfigSchema);

describe("ConfigurationProvider", () => {
  beforeEach(() => {
    process.env[ENV_VAR_PROJECT] = "gcp-core-tests";
    process.env[ENV_VAR_CONFIG_OVERRIDES] = JSON.stringify({
      host: "localhost",
      location: "local",
      appName: "Test app",
    });
  });
  afterEach(() => {
    process.env[ENV_VAR_CONFIG_OVERRIDES] = undefined;
    process.env[ENV_VAR_PROJECT] = undefined;
  });

  it("throws if config not set", async () => {
    const provider = new ConfigurationProvider<TestConfig>();

    expect(provider.hasValue()).toBe(false);
    expect(() => provider.get()).toThrow("No value has been set on this provider");
  });

  it("throws custom message if config not set", async () => {
    const provider = new ConfigurationProvider<TestConfig>(undefined, "No Configuration has been set");

    expect(provider.hasValue()).toBe(false);
    expect(() => provider.get()).toThrow("No Configuration has been set");
  });

  it("inits config into typed provider", async () => {
    const provider = new ConfigurationProvider<TestConfig>();
    await provider.init({ validator });

    expect(provider.hasValue()).toBe(true);
    expect(provider.get()).toBeTruthy();
    expect(provider.get().projectId).toBe("gcp-core-tests");
    expect(provider.get().appName).toBe("Test app");
  });

  it("inits config into untyped provider", async () => {
    const provider = new ConfigurationProvider();
    await provider.init({ validator });

    expect(provider.hasValue()).toBe(true);
    expect(provider.get()).toBeTruthy();
    expect(provider.get().projectId).toBe("gcp-core-tests");
    expect(provider.get<TestConfig>().appName).toBe("Test app");
  });
});
