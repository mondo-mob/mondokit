import { Router } from "express";
import { datastoreExportServiceProvider } from "./datastore-export.service.js";
import { validateRequest } from "../util/types.js";
import { datastoreExportRequestSchema } from "./datastore-export-request.js";

export const datastoreBackupCronRoutes = (router = Router()): Router => {
  router.get("/backups/datastore", async (req, res) => {
    const options = validateRequest(datastoreExportRequestSchema, req.query);
    const datastoreExportService = datastoreExportServiceProvider.get();
    const backupOperation = await datastoreExportService.startExport(options);
    await datastoreExportService.queueUpdateExportStatus({ backupOperationId: backupOperation.id });
    return res.send(`Backup operation ${backupOperation.id} started`);
  });

  return router;
};
