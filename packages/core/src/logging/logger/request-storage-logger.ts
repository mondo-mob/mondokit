import { Logger } from "./logger.js";
import { ProxyLogger } from "./proxy-logger.js";
import { loggingRequestStorage } from "../logging-request-storage.js";
import { defaultLoggerProvider } from "../default-logger-provider.js";

const requestStorageLoggerOrDefault = (): Logger => {
  return loggingRequestStorage.getWithDefault(defaultLoggerProvider.get());
};

export class RequestStorageLogger extends ProxyLogger {
  constructor(name?: string) {
    super(requestStorageLoggerOrDefault, name);
  }
}
