import assert from "assert";
import { createLogger, LazyProvider } from "@mondokit/gcp-core";
import { BigQueryImportService, connectBigQuery } from "@mondokit/gcp-bigquery";
import { connectStorage } from "@mondokit/gcp-storage";
import { BackupOperation, backupTaskServiceProvider } from "../backups/index.js";
import { BigQueryLoadRequest } from "./bigquery-load-request.js";
import { TASK_BIGQUERY_LOAD_KIND } from "./bigquery-load-task-routes.js";

class BigQueryDatastoreImportService {
  private readonly logger = createLogger(BigQueryDatastoreImportService.name);
  protected readonly bigQueryImportService: BigQueryImportService;

  constructor() {
    this.bigQueryImportService = new BigQueryImportService({
      bigQuery: connectBigQuery(),
      storage: connectStorage(),
    });
  }

  async queueImportFromBackup(backupOperation: BackupOperation): Promise<void> {
    assert.ok(backupOperation.kinds);
    assert.ok(backupOperation.outputUriPrefix);
    assert.ok(backupOperation.targetDataset);

    for (const kind of backupOperation.kinds) {
      await this.queueImportKind(backupOperation.outputUriPrefix, backupOperation.targetDataset, kind);
    }
  }

  async queueImportKind(gcsPrefix: string, targetDataset: string, kind: string): Promise<void> {
    const gcsObjectPath = `${gcsPrefix}/all_namespaces/kind_${kind}/all_namespaces_kind_${kind}.export_metadata`;
    this.logger.info(`Queue importing kind ${kind} from GCS: ${gcsObjectPath}`);

    return backupTaskServiceProvider.get().enqueue<BigQueryLoadRequest>(TASK_BIGQUERY_LOAD_KIND, {
      data: {
        gcsObjectPath,
        targetDataset,
        targetTable: kind,
      },
    });
  }

  async importKind(gcsObjectPath: string, targetDataset: string, kind: string): Promise<string> {
    return this.bigQueryImportService.importDatastoreExport(gcsObjectPath, targetDataset, kind);
  }
}

export const bigQueryDatastoreImportServiceProvider = new LazyProvider(() => new BigQueryDatastoreImportService());
