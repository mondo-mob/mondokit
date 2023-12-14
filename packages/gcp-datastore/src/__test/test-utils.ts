import { Datastore, DatastoreOptions } from "@google-cloud/datastore";
import { configurationProvider, zodValidator } from "@mondokit/gcp-core";
import { GcpDatastoreConfiguration, gcpDatastoreConfigurationSchema } from "../configuration/index.js";

// NOTE: This will only work for code that does not inspect the process on initialisation
export const withEnvVars = (vars: Record<string, string | undefined>, testFn: () => Promise<unknown>) => {
  return () => {
    const originalEnv = process.env;
    process.env = {
      ...originalEnv,
      ...vars,
    };
    return testFn().finally(() => {
      process.env = originalEnv;
    });
  };
};

export interface RepositoryItem {
  id: string;
  name: string;
}

export const initTestConfig = async (config: Record<string, unknown> = {}): Promise<GcpDatastoreConfiguration> => {
  await configurationProvider.init({
    validator: zodValidator(gcpDatastoreConfigurationSchema),
    projectId: "datastore-tests",
    overrides: config,
  });
  return configurationProvider.get<GcpDatastoreConfiguration>();
};

export const initEmulatorConfig = async (
  config?: Partial<GcpDatastoreConfiguration>,
): Promise<GcpDatastoreConfiguration> => {
  return initTestConfig({
    datastoreProjectId: "datastore-tests",
    datastoreApiEndpoint: "localhost:8081",
    ...config,
  });
};

export const connectDatastoreEmulator = (settings?: DatastoreOptions): Datastore => {
  return new Datastore({
    projectId: "datastore-tests",
    apiEndpoint: "localhost:8081",
    credentials: { client_email: "test@example.com", private_key: "{}" },
    ...settings,
  });
};

export const deleteKind = async (datastore: Datastore, kind: string): Promise<void> => {
  const [results] = await datastore.createQuery(kind).limit(100).run();

  const keys = results.map((result) => result[Datastore.KEY]);
  await datastore.delete(keys);

  if (results.length === 100) {
    await deleteKind(datastore, kind);
  }
};

export const deleteKinds = async (datastore: Datastore, ...kinds: string[]): Promise<void> => {
  for (const kind of kinds) {
    await deleteKind(datastore, kind);
  }
};
