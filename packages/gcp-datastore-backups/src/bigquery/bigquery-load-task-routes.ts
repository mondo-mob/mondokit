import { Router } from "express";
import { asyncHandler } from "@mondokit/gcp-core";
import { bigQueryDatastoreImportServiceProvider } from "./bigquery-datastore-import.service.js";
import { validateRequest } from "../util/types.js";
import { bigQueryLoadRequestSchema } from "./bigquery-load-request.js";

export const TASK_BIGQUERY_LOAD_KIND = "/backups/bigquery-load-kind";

export const bigQueryImportTaskRoutes = (router = Router()): Router => {
  router.post(
    TASK_BIGQUERY_LOAD_KIND,
    asyncHandler(async (req, res) => {
      const options = validateRequest(bigQueryLoadRequestSchema, req.body);
      const result = await bigQueryDatastoreImportServiceProvider
        .get()
        .importKind(options.gcsObjectPath, options.targetDataset, options.targetTable);
      res.send(result);
    })
  );

  return router;
};
