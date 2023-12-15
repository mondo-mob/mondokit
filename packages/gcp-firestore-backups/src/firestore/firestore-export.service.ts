import { FirestoreAdminClient } from "@google-cloud/firestore/types/v1/firestore_admin_client.js";
import { createLogger, LazyProvider, validateArrayNotEmpty, validateNotNil } from "@mondokit/gcp-core";
import { connectFirestoreAdmin, newTimestampedEntity } from "@mondokit/gcp-firestore";
import assert from "assert";
import { DateTime } from "luxon";
import { nanoid } from "nanoid";
import { BackupOperation, backupTaskServiceProvider } from "../backups/index.js";
import { getFirestoreBackupConfiguration } from "../configuration/index.js";
import { backupOperationsRepository } from "./backup-operations.repository.js";
import { FirestoreExportCheckRequest } from "./firestore-export-check-request.js";
import { FirestoreExportRequest } from "./firestore-export-request.js";
import { TASK_FIRESTORE_EXPORT_CHECK } from "./route-paths.js";
import { mergeExportOperation } from "./util.js";

const UPDATE_STATUS_DELAY_SECONDS = 60;
const DEFAULT_TIME_ZONE = "Australia/Sydney";
const DEFAULT_FOLDER_FORMAT = "yyyy/MM/yyyyMMdd-HHmmss";

export class FirestoreExportService {
  private readonly logger = createLogger("firestoreExportService");
  private readonly adminClient: FirestoreAdminClient;
  private readonly folderFormat: string;
  private readonly projectId: string;
  private readonly timeZone: string;
  private readonly backupBucket: string;

  constructor() {
    const { projectId, firestoreProjectId, firestoreBackup } = getFirestoreBackupConfiguration();
    this.projectId = firestoreProjectId || projectId;
    this.backupBucket = firestoreBackup?.bucket || `firestore-backup-${this.projectId}`;
    this.timeZone = firestoreBackup?.timeZone || DEFAULT_TIME_ZONE;
    this.folderFormat = firestoreBackup?.folderFormat || DEFAULT_FOLDER_FORMAT;
    this.adminClient = connectFirestoreAdmin();
  }

  async startExport(options: FirestoreExportRequest): Promise<BackupOperation> {
    if (options.type === "EXPORT_TO_BIGQUERY") {
      validateNotNil(options.targetDataset, "targetDataset must be provided for export to BigQuery");
      validateArrayNotEmpty(options.collectionIds, "collectionIds required for export to BigQuery");
    }

    const name = options.name || "firestore-export";
    const collectionIds = options.collectionIds || [];
    const outputBucket = this.formatOutputBucket(name);
    const databaseName = this.adminClient.databasePath(this.projectId, "(default)");

    this.logger.info(
      { databaseName, collectionIds, outputBucket },
      `Starting firestore export: ${options.type} - ${name}`,
    );
    const [operation] = await this.adminClient.exportDocuments({
      name: databaseName,
      outputUriPrefix: outputBucket,
      collectionIds: collectionIds,
    });
    assert.ok(operation.name, "No operation name/id returned for export");

    const backupOperation = mergeExportOperation(
      {
        ...newTimestampedEntity(nanoid()),
        operationName: operation.name,
        type: options.type,
        name,
        collectionIds,
        ...(options.targetDataset ? { targetDataset: options.targetDataset } : undefined),
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
    const operation = await this.adminClient.checkExportDocumentsProgress(backupOperation.operationName);
    const updated = mergeExportOperation(backupOperation, {
      done: operation.done,
      metadata: operation.metadata,
      error: operation.error,
    });
    await backupOperationsRepository.save(updated);
    return updated;
  }

  async queueUpdateExportStatus(exportCheck: FirestoreExportCheckRequest): Promise<void> {
    await backupTaskServiceProvider.get().enqueue(TASK_FIRESTORE_EXPORT_CHECK, {
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

export const firestoreExportServiceProvider = new LazyProvider(() => new FirestoreExportService());
