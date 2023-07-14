import { AuthUser } from "../auth/auth-user.js";
import { userRequestStorageProvider } from "../auth/user-request-storage-provider.js";
import { createLogger } from "../logging/logging.js";
import { runWithRequestStorage } from "../request-storage/request-storage.js";
import { Bootstrapper } from "./bootstrapper.js";

const logger = createLogger("bootstrap-service");

export const bootstrap = async (bootstrappers: Bootstrapper[], { user }: BoostrapOptions = {}) => {
  logger.info(`Bootstrap started with ${bootstrappers.length} bootstrappers ...`);

  await runWithRequestStorage(async () => {
    if (user) {
      logger.info(`Bootstrappers running as user with id: ${user.id}`);
      userRequestStorageProvider.get().set(user);
    }
    for (const bootstrapper of bootstrappers) {
      await bootstrapper();
    }
  });

  logger.info("Bootstrap finished");
};

interface BoostrapOptions {
  /**
   * Run bootstrappers as the specified user so all downstream code will operate under that user's context.
   */
  user?: AuthUser;
}
