import { TimestampedRepository } from "@mondokit/gcp-datastore";
import { BackupOperation } from "../backups/index.js";

export const backupOperationsKind = "backup-operations";
export const backupOperationsRepository = new TimestampedRepository<BackupOperation>(backupOperationsKind);
