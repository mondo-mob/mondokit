import { SecretManagerServiceClient } from "@google-cloud/secret-manager";
import { SecretsClient } from "./secrets.client.js";
import { BadRequestError } from "../../error/bad-request-error.js";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore jest.extended is not declaring this correctly in current version
import { SpyInstance } from "vitest";

const RESOLVED_SECRET = "-secret-";

describe("SecretsClient", () => {
  let secretsClient: SecretsClient;
  let accessSecretVersionSpy: SpyInstance;

  beforeEach(() => {
    accessSecretVersionSpy = vi.spyOn(SecretManagerServiceClient.prototype, "accessSecretVersion");
    secretsClient = new SecretsClient("my-project-id");
  });

  describe("fetchSecret", () => {
    it("fetches secret and returns the result", async () => {
      accessSecretVersionSpy.mockImplementationOnce(() =>
        Promise.resolve([
          {
            payload: {
              data: RESOLVED_SECRET,
            },
          },
        ])
      );

      const result = await secretsClient.fetchSecret("MY_SECRET");

      expect(result).toBe(RESOLVED_SECRET);
      expect(accessSecretVersionSpy).toHaveBeenCalledWith({
        name: "projects/my-project-id/secrets/MY_SECRET/versions/latest",
      });
    });

    it("fetches secret and throws an exception when it does not exist", async () => {
      accessSecretVersionSpy.mockImplementationOnce(() =>
        Promise.resolve([
          {
            payload: {},
          },
        ])
      );

      await expect(secretsClient.fetchSecret("MY_SECRET")).rejects.toEqual(
        new BadRequestError("Cannot find secret: MY_SECRET")
      );
    });
  });
});
