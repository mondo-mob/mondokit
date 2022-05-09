import { configurationProvider, iots as t, gaeJsCoreConfigurationSchema } from "@mondomob/gae-js-core";
import { GaeJsTasksConfiguration, gaeJsTasksConfigurationSchema } from "../configuration";

export const initTestConfig = async (config?: Partial<GaeJsTasksConfiguration>): Promise<GaeJsTasksConfiguration> => {
  const schema = t.intersection([gaeJsCoreConfigurationSchema, gaeJsTasksConfigurationSchema]);
  process.env.NODE_CONFIG = JSON.stringify({
    projectId: "tasks-tests",
    host: "http://localhost",
    location: "local",
    ...config,
  });
  await configurationProvider.init(schema);
  return configurationProvider.get<GaeJsTasksConfiguration>();
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