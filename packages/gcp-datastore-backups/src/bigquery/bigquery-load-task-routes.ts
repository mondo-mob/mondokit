import { asyncHandler } from "@mondokit/gcp-core";
import { Router } from "express";
import { validateRequest } from "../util/types.js";
import { bigQueryDatastoreImportServiceProvider } from "./bigquery-datastore-import.service.js";
import { bigQueryLoadRequestSchema } from "./bigquery-load-request.js";
import { TASK_BIGQUERY_LOAD_KIND } from "./route-paths.js";

export const bigQueryImportTaskRoutes = (router = Router()): Router => {
  router.post(
    TASK_BIGQUERY_LOAD_KIND,
    asyncHandler(async (req, res) => {
      const options = validateRequest(bigQueryLoadRequestSchema, req.body);
      const result = await bigQueryDatastoreImportServiceProvider
        .get()
        .importKind(options.gcsObjectPath, options.targetDataset, options.targetTable);
      res.send(result);
    }),
  );

  return router;
};
