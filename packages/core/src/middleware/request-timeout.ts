import { Handler } from "express";
import { createLogger } from "../logging/logging.js";

/**
 * Node's default request timeout is 120s. For potentially long running requests such as Tasks and Crons, this can
 * cause unexpected behaviour. A task could return a HTTP 502 after 120s even if the task is still running.
 * This could potentially cause a retry of a task before the first execution has finished.
 *
 * There may also be times where you'd like a shorter request timeout than the default.
 *
 * This middleware sets both the request and response socket timeouts to the configured value (in seconds).
 * e.g. For Task and Cron requests this should typically be 600 (10 minutes), or use {@link requestTimeoutMinutes}.
 *
 * @example Apply to all /tasks endpoints
 * app.use("/tasks", requestTimeoutSeconds(10 * 60))
 */
export const requestTimeoutSeconds = (timeoutSeconds: number): Handler => {
  const logger = createLogger("requestTimeout");

  return (req, res, next) => {
    const requestPath = req.originalUrl;
    const timeoutMs = timeoutSeconds * 1000;
    logger.info(`Setting timeouts to ${timeoutSeconds}s for request: ${requestPath}`);

    let timedOut = false;
    const onTimeout = (label: "request" | "response", error: Error) => {
      if (timedOut || res.headersSent) {
        return;
      }
      timedOut = true;
      logger.warn(`Request: ${requestPath} has exceeded configured ${label} timeout of ${timeoutSeconds}s`);
      next(error);
    };

    req.setTimeout(timeoutMs, () => onTimeout("request", new Error("Request Timeout")));
    res.setTimeout(timeoutMs, () => onTimeout("response", new Error("Service Unavailable")));
    next();
  };
};

/**
 * Convenience form of requestTimeoutSeconds to take timeout in minutes
 *
 * @example Apply timeout of 10 minutes
 * app.use("/tasks", requestTimeoutMinutes(10))
 */
export const requestTimeoutMinutes = (timeoutMinutes: number): Handler => requestTimeoutSeconds(timeoutMinutes * 60);
