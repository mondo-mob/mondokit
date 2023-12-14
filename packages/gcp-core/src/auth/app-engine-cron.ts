import { requestTimeoutMinutes } from "@mondokit/core";
import { verifyCron } from "./verify-cron.js";

/**
 * Util middleware to apply to GAE cron endpoints:
 * a) Verifies the request is a genuine App Engine Cron request
 * b) Extends the nodejs request timeout to 10 minutes
 *
 * @example Apply to all /crons endpoints
 * app.use("/crons", appEngineCron);
 * app.post("/crons/poll-status", (req, res) => {...});
 */
export const appEngineCron = [verifyCron, requestTimeoutMinutes(10)];
