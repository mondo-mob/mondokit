import { Router } from "express";
import { asyncHandler, createLogger } from "@mondokit/gcp-core";
import { bigQueryDatastoreImportServiceProvider, bigQueryImportTaskRoutes } from "../bigquery/index.js";
import { datastoreExportCheckRequestSchema } from "./datastore-export-check-request.js";
import { datastoreExportServiceProvider } from "./datastore-export.service.js";
import { validateRequest } from "../util/types.js";

export const TASK_DATASTORE_EXPORT_CHECK = "/backups/datastore-export-check";

export const datastoreBackupTaskRoutes = (router = Router()): Router => {
  const logger = createLogger("datastoreBackupTaskRoutes");

  router.post(
    TASK_DATASTORE_EXPORT_CHECK,
    asyncHandler(async (req, res) => {
      const payload = validateRequest(datastoreExportCheckRequestSchema, req.body);
      const backupOperation = await datastoreExportServiceProvider.get().updateOperation(payload.backupOperationId);

      if (!backupOperation.done) {
        await datastoreExportServiceProvider.get().queueUpdateExportStatus(payload);
        return res.send(`Datastore export ${backupOperation.id} hasn't finished yet, will check again later`);
      }

      logger.info("Datastore export complete");
      if (backupOperation.type === "EXPORT_TO_BIGQUERY") {
        await bigQueryDatastoreImportServiceProvider.get().queueImportFromBackup(backupOperation);
        return res.send("Datastore export complete. BigQuery load queued...");
      }
      return res.send("Datastore export complete");
    })
  );

  bigQueryImportTaskRoutes(router);

  return router;
};
