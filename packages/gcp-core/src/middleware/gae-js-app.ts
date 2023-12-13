import { requestAsyncStorage } from "@mondokit/core";
import { gaeRequestLogger } from "./gae-request-logger.js";

export const gaeJsApp = [gaeRequestLogger, requestAsyncStorage];
