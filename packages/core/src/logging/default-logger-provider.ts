import * as BunyanLogger from "bunyan";
import { Provider } from "../util/provider.js";
import { Logger } from "./logger/logger.js";

export const defaultLoggerProvider = new Provider<Logger>(
  BunyanLogger.createLogger({
    name: "service",
    level: "info",
  }),
  "No default logger instance found. Please initialise defaultLoggerProvider.",
);
