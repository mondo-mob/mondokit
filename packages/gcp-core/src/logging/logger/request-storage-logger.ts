import { Logger } from "./logger.js";
import { ProxyLogger } from "./proxy-logger.js";
import { loggingRequestStorage } from "../logging-request-storage.js";
import { defaultLogger } from "../logging.js";

const requestStorageLoggerOrDefault = (): Logger => {
  return loggingRequestStorage.getWithDefault(defaultLogger);
};

export class RequestStorageLogger extends ProxyLogger {
  constructor(name?: string) {
    super(requestStorageLoggerOrDefault, name);
  }
}
