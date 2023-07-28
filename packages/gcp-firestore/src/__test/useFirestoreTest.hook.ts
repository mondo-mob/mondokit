import { GaeJsFirestoreConfiguration } from "../configuration/schema.js";
import { deleteCollections, initEmulatorConfig } from "./test-utils.js";
import { firestoreProvider } from "../firestore/firestore-provider.js";
import { connectFirestore } from "../firestore/connect.js";

export interface FirestoreTestOptions {
  config?: Partial<GaeJsFirestoreConfiguration>;
  clearCollections?: string[];
  clearBefore?: boolean;
  clearAfter?: boolean;
}

export const useFirestoreTest = ({
  config: configOverrides,
  clearCollections = [],
  clearBefore = true,
  clearAfter = false,
}: FirestoreTestOptions = {}) => {
  beforeAll(async () => {
    await initEmulatorConfig(configOverrides);
    firestoreProvider.init();
    firestoreProvider.set(connectFirestore());
  });

  beforeEach(async () => {
    if (clearBefore) {
      await deleteCollections(clearCollections);
    }
  });

  afterEach(async () => {
    if (clearAfter) {
      await deleteCollections(clearCollections);
    }
  });
};
