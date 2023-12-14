import {
  configurationProvider,
  GcpCoreConfiguration,
  gcpCoreConfigurationSchema,
  zodValidator,
} from "@mondokit/gcp-core";

export const initTestConfig = async (config?: Partial<GcpCoreConfiguration>): Promise<GcpCoreConfiguration> => {
  process.env.GAEJS_PROJECT = "tasks-tests";
  process.env.GAEJS_CONFIG_OVERRIDES = JSON.stringify({
    host: "http://127.0.0.1",
    location: "local",
    ...config,
  });
  await configurationProvider.init({ validator: zodValidator<GcpCoreConfiguration>(gcpCoreConfigurationSchema) });
  return configurationProvider.get<GcpCoreConfiguration>();
};

/**
 * Waits until the provided function returns truthy or the timeout is exceeded.
 * @param condition function that returns whether condition is true or not
 * @param timeout the maximum time to wait for the condition to be satisfied
 */
export const waitUntil = async (condition: () => boolean, timeout = 5000): Promise<string> => {
  return new Promise((resolve, reject) => {
    const interval = setInterval(() => {
      if (!condition()) return;
      clearInterval(interval);
      resolve("OK");
    }, 50);

    setTimeout(() => {
      clearInterval(interval);
      reject("Condition not satisfied in time");
    }, timeout);
  });
};
