import { Router } from "express";
import { firestoreExportServiceProvider } from "./firestore-export.service.js";
import { validateRequest } from "../util/types.js";
import { firestoreExportRequestSchema } from "./firestore-export-request.js";

export const firestoreBackupCronRoutes = (router = Router()): Router => {
  router.get("/backups/firestore", async (req, res) => {
    const options = validateRequest(firestoreExportRequestSchema, req.query);
    const firestoreExportService = firestoreExportServiceProvider.get();
    const backupOperation = await firestoreExportService.startExport(options);
    await firestoreExportService.queueUpdateExportStatus({ backupOperationId: backupOperation.id });
    return res.send(`Backup operation ${backupOperation.id} started`);
  });

  return router;
};
