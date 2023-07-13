import { gaeRequestLogger } from "./gae-request-logger.js";
import { requestAsyncStorage } from "./request-async-storage.js";

export const gaeJsApp = [gaeRequestLogger, requestAsyncStorage];
