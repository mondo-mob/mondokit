import { Logger } from "./logger/logger.js";
import { RequestStorageLogger } from "./logger/request-storage-logger.js";

export const createLogger = (name: string): Logger => new RequestStorageLogger(name);
