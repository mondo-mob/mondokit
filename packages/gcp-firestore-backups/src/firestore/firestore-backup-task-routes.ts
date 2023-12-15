import { asyncHandler, createLogger } from "@mondokit/gcp-core";
import { Router } from "express";
import { bigQueryFirestoreImportServiceProvider, bigQueryImportTaskRoutes } from "../bigquery/index.js";
import { validateRequest } from "../util/types.js";
import { firestoreExportCheckRequestSchema } from "./firestore-export-check-request.js";
import { firestoreExportServiceProvider } from "./firestore-export.service.js";
import { TASK_FIRESTORE_EXPORT_CHECK } from "./route-paths.js";

export const firestoreBackupTaskRoutes = (router = Router()): Router => {
  const logger = createLogger("firestoreBackupTaskRoutes");

  router.post(
    TASK_FIRESTORE_EXPORT_CHECK,
    asyncHandler(async (req, res) => {
      const payload = validateRequest(firestoreExportCheckRequestSchema, req.body);
      const backupOperation = await firestoreExportServiceProvider.get().updateOperation(payload.backupOperationId);

      if (!backupOperation.done) {
        await firestoreExportServiceProvider.get().queueUpdateExportStatus(payload);
        return res.send(`Firestore export ${backupOperation.id} hasn't finished yet, will check again later`);
      }

      logger.info("Firestore export complete");
      if (backupOperation.type === "EXPORT_TO_BIGQUERY") {
        await bigQueryFirestoreImportServiceProvider.get().queueImportFromBackup(backupOperation);
        return res.send("Firestore export complete. BigQuery load queued...");
      }
      return res.send("Firestore export complete");
    }),
  );

  bigQueryImportTaskRoutes(router);

  return router;
};
