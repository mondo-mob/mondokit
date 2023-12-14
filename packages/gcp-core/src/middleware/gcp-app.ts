import { requestAsyncStorage } from "@mondokit/core";
import { gcpRequestLogger } from "./gcp-request-logger.js";

export const gcpApp = [gcpRequestLogger, requestAsyncStorage];
