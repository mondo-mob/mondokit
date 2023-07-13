import { Firestore, v1 as firestoreV1 } from "@google-cloud/firestore";
import { ENV_VAR_RUNTIME_ENVIRONMENT } from "@mondomob/gae-js-core";
import { withEnvVars } from "@mondomob/gae-js-core/dist/__test/test-utils";
import { connectFirestore, connectFirestoreAdmin } from "./connect";
import { initEmulatorConfig, initTestConfig } from "../__test/test-utils";

jest.mock("@google-cloud/firestore", () => ({
  Firestore: jest.fn(),
  v1: {
    FirestoreAdminClient: jest.fn(),
  },
}));

describe("connect", () => {
  describe("connectFirestore", () => {
    it(
      "connects to default project when running on gcp",
      withEnvVars({ [ENV_VAR_RUNTIME_ENVIRONMENT]: "appengine" }, async () => {
        await initTestConfig();

        connectFirestore();

        expect(Firestore).toHaveBeenLastCalledWith({ projectId: undefined });
      })
    );

    it("connects to app projectId if not running on gcp", async () => {
      await initTestConfig();

      connectFirestore();

      expect(Firestore).toHaveBeenLastCalledWith({ projectId: "firestore-tests" });
    });

    it("will connect to firestore projectId if provided", async () => {
      await initTestConfig({ firestoreProjectId: "firestore-project-override" });

      connectFirestore();

      expect(Firestore).toHaveBeenLastCalledWith({ projectId: "firestore-project-override" });
    });

    it("will connect to emulator with dummy credentials if host provided", async () => {
      await initEmulatorConfig();

      connectFirestore();

      expect(Firestore).toHaveBeenLastCalledWith({
        projectId: "firestore-tests",
        host: "0.0.0.0",
        port: 9000,
        ssl: false,
        credentials: {
          client_email: "firestore@example.com",
          private_key: "{}",
        },
      });
    });

    it("will connect will custom properties", async () => {
      await initTestConfig({ firestoreProjectId: "firestore-project-override" });

      connectFirestore({
        firestoreSettings: {
          projectId: "custom-project",
          ignoreUndefinedProperties: true,
        },
      });

      expect(Firestore).toHaveBeenLastCalledWith({
        projectId: "custom-project",
        ignoreUndefinedProperties: true,
      });
    });
  });

  describe("connectFirestoreAdmin", () => {
    it(
      "connects to default project when running on gcp",
      withEnvVars({ [ENV_VAR_RUNTIME_ENVIRONMENT]: "appengine" }, async () => {
        await initTestConfig();

        connectFirestoreAdmin();

        expect(firestoreV1.FirestoreAdminClient).toHaveBeenLastCalledWith({ projectId: undefined });
      })
    );

    it("connects to app projectId if not running on gcp", async () => {
      await initTestConfig();

      connectFirestoreAdmin();

      expect(firestoreV1.FirestoreAdminClient).toHaveBeenLastCalledWith({ projectId: "firestore-tests" });
    });

    it("will connect to firestore projectId if provided", async () => {
      await initTestConfig({ firestoreProjectId: "firestore-project-override" });

      connectFirestoreAdmin();

      expect(firestoreV1.FirestoreAdminClient).toHaveBeenLastCalledWith({ projectId: "firestore-project-override" });
    });

    it("will connect with custom properties", async () => {
      await initTestConfig({ firestoreProjectId: "firestore-project-override" });

      connectFirestoreAdmin({
        clientOptions: {
          projectId: "custom-project",
          ignoreUndefinedProperties: true,
        },
      });

      expect(firestoreV1.FirestoreAdminClient).toHaveBeenLastCalledWith({
        projectId: "custom-project",
        ignoreUndefinedProperties: true,
      });
    });
  });
});
