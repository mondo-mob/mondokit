import { Firestore, Settings } from "@google-cloud/firestore";
import { FirestoreAdminClient } from "@google-cloud/firestore/types/v1/firestore_admin_client.js";
import { configurationProvider, createLogger, runningOnGcp } from "@mondokit/gcp-core";
import { GcpFirestoreConfiguration } from "../configuration/schema.js";

export interface FirestoreConnectOptions {
  configuration?: GcpFirestoreConfiguration;
  firestoreSettings?: Settings;
}

const getProjectId = (config: GcpFirestoreConfiguration): string | undefined =>
  runningOnGcp()
    ? // On GCP if you do not specify a firestoreProjectId the client will auto connect to the hosting project
      config.firestoreProjectId || undefined
    : // Outside GCP we fall back to the application project id
      config.firestoreProjectId || config.projectId;

/**
 * Connect a standard Firestore Client.
 */
export const connectFirestore = (options?: FirestoreConnectOptions): Firestore => {
  const logger = createLogger("connectFirestore");
  const config = options?.configuration || configurationProvider.get<GcpFirestoreConfiguration>();

  // If firestoreHost specified then assume connecting to an emulator
  if (config.firestoreHost) {
    const settings: Settings = {
      projectId: getProjectId(config),
      host: config.firestoreHost,
      port: config.firestorePort,
      ssl: false,
      credentials: { client_email: "firestore@example.com", private_key: "{}" },
      ...options?.firestoreSettings,
    };
    logger.info(`Connecting to firestore emulator: ${settings.projectId}@${settings.host}:${settings.port}`);
    return new Firestore(settings);
  }

  // Otherwise we connect to Firestore as per configuration
  const settings: Settings = {
    projectId: getProjectId(config),
    ...options?.firestoreSettings,
  };
  logger.info(`Connecting Firestore Client for project ${settings.projectId || "(default)"}`);
  return new Firestore(settings);
};

// The proper typings from google-gax can be flaky depending on which version gets resolved
// It's safer to extract the types from client sdk
type AdminClientOptions = ConstructorParameters<typeof FirestoreAdminClient>[0];

export interface FirestoreAdminConnectOptions {
  configuration?: GcpFirestoreConfiguration;
  clientOptions?: AdminClientOptions;
}

/**
 * Creates a Firestore Admin Client. e.g. for admin operations like imports/exports.
 * NOTE: This currently only works for real Firestore - i.e. not the emulator
 */
export const connectFirestoreAdmin = (options?: FirestoreAdminConnectOptions): FirestoreAdminClient => {
  const logger = createLogger("connectFirestoreAdmin");
  const config = options?.configuration || configurationProvider.get<GcpFirestoreConfiguration>();

  const clientOptions: AdminClientOptions = {
    projectId: getProjectId(config),
    ...options?.clientOptions,
  };
  logger.info(`Connecting Firestore Admin Client for project ${clientOptions.projectId || "(default)"}`);
  return new FirestoreAdminClient(clientOptions);
};
