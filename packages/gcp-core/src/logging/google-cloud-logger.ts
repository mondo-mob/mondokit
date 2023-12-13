import * as BunyanLogger from "bunyan";
import { LoggingBunyan } from "@google-cloud/logging-bunyan";
import { simpleConsoleWriter } from "@mondokit/core";
import { runningOnGcp } from "../util/environment.js";

/**
 * Creates a Bunyan logger that falls back to console when not running on GCP
 */
export const googleCloudLogger = (): BunyanLogger =>
  BunyanLogger.createLogger({
    name: "service",
    level: "info",
    streams: runningOnGcp()
      ? [new LoggingBunyan().stream("info")]
      : [
          {
            type: "raw",
            stream: simpleConsoleWriter,
          },
        ],
  });
