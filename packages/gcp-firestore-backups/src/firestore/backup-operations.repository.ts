import { TimestampedRepository } from "@mondokit/gcp-firestore";
import { BackupOperation } from "../backups/index.js";

export const backupOperationsCollection = "backup-operations";
export const backupOperationsRepository = new TimestampedRepository<BackupOperation>(backupOperationsCollection);
