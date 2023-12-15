import { DatastoreAdminClient } from "@google-cloud/datastore";
import { createLogger, LazyProvider, validateArrayNotEmpty, validateNotNil } from "@mondokit/gcp-core";
import { connectDatastoreAdmin, newTimestampedEntity } from "@mondokit/gcp-datastore";
import assert from "assert";
import { DateTime } from "luxon";
import { nanoid } from "nanoid";
import { BackupOperation, backupTaskServiceProvider } from "../backups/index.js";
import { getDatastoreBackupConfiguration } from "../configuration/index.js";
import { backupOperationsRepository } from "./backup-operations.repository.js";
import { DatastoreExportCheckRequest } from "./datastore-export-check-request.js";
import { DatastoreExportRequest } from "./datastore-export-request.js";
import { TASK_DATASTORE_EXPORT_CHECK } from "./route-paths.js";
import { mergeExportOperation } from "./util.js";

const UPDATE_STATUS_DELAY_SECONDS = 60;
const DEFAULT_TIME_ZONE = "Australia/Sydney";
const DEFAULT_FOLDER_FORMAT = "yyyy/MM/yyyyMMdd-HHmmss";

export class DatastoreExportService {
  private readonly logger = createLogger("datastoreExportService");
  private readonly adminClient: DatastoreAdminClient;
  private readonly folderFormat: string;
  private readonly projectId: string;
  private readonly timeZone: string;
  private readonly backupBucket: string;

  constructor() {
    const { projectId, datastoreProjectId, datastoreBackup } = getDatastoreBackupConfiguration();
    this.projectId = datastoreProjectId || projectId;
    this.backupBucket = datastoreBackup?.bucket || `datastore-backup-${this.projectId}`;
    this.timeZone = datastoreBackup?.timeZone || DEFAULT_TIME_ZONE;
    this.folderFormat = datastoreBackup?.folderFormat || DEFAULT_FOLDER_FORMAT;
    this.adminClient = connectDatastoreAdmin();
  }

  async startExport(options: DatastoreExportRequest): Promise<BackupOperation> {
    if (options.type === "EXPORT_TO_BIGQUERY") {
      validateNotNil(options.targetDataset, "targetDataset must be provided for export to BigQuery");
      validateArrayNotEmpty(options.kinds, "kinds required for export to BigQuery");
    }

    const name = options.name || "datastore-export";
    const kinds = options.kinds || [];
    const outputBucket = this.formatOutputBucket(name);

    this.logger.info({ kinds, outputBucket }, `Starting datastore export: ${options.type} - ${name}`);
    const [operation] = await this.adminClient.exportEntities({
      projectId: this.projectId,
      outputUrlPrefix: outputBucket,
      entityFilter: {
        kinds,
      },
    });
    assert.ok(operation.name, "No operation name/id returned for export");

    const backupOperation = mergeExportOperation(
      {
        ...newTimestampedEntity(),
        id: nanoid(),
        operationName: operation.name,
        type: options.type,
        name,
        kinds,
        targetDataset: options.targetDataset,
      },
      {
        done: operation.done,
        metadata: operation.metadata,
        error: operation.error,
      },
    );
    await backupOperationsRepository.insert(backupOperation);

    this.logger.info(`Backup ${backupOperation.id} for operation ${backupOperation.operationName} started`);
    return backupOperation;
  }

  async updateOperation(backupId: string) {
    const backupOperation = await backupOperationsRepository.getRequired(backupId);

    this.logger.info(`Looking up details for operation ${backupOperation.operationName}`);
    const operation = await this.adminClient.checkExportEntitiesProgress(backupOperation.operationName);
    const updated = mergeExportOperation(backupOperation, {
      done: operation.done,
      metadata: operation.metadata,
      error: operation.error,
    });
    await backupOperationsRepository.save(updated);
    return updated;
  }

  async queueUpdateExportStatus(exportCheck: DatastoreExportCheckRequest): Promise<void> {
    await backupTaskServiceProvider.get().enqueue<DatastoreExportCheckRequest>(TASK_DATASTORE_EXPORT_CHECK, {
      data: exportCheck,
      inSeconds: UPDATE_STATUS_DELAY_SECONDS,
    });
  }

  private formatOutputBucket(exportName: string): string {
    const now = DateTime.local({ zone: this.timeZone });
    const folderName = now.toFormat(this.folderFormat);
    return `gs://${this.backupBucket}/${exportName}/${folderName}`;
  }
}

export const datastoreExportServiceProvider = new LazyProvider(() => new DatastoreExportService());
