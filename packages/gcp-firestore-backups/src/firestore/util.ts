import { BackupOperation } from "../backups/index.js";

// Firestore v8 no longer exposes its generated proto types via the package "exports" map, so we model
// the handful of fields we read from an export operation's metadata locally.
interface ITimestamp {
  seconds?: number | string | null;
  nanos?: number | null;
}
interface IExportDocumentsMetadata {
  collectionIds?: string[] | null;
  outputUriPrefix?: string | null;
  operationState?: string | null;
  startTime?: ITimestamp | null;
  endTime?: ITimestamp | null;
}

export const toISOTime = (timestamp?: ITimestamp | null): string | null => {
  if (!timestamp || !timestamp.seconds) return null;
  return new Date(Number(timestamp.seconds) * 1000).toISOString();
};

export const mergeExportOperation = (
  backupOperation: BackupOperation,
  exportOperation: {
    done: boolean | undefined;
    metadata: unknown | null;
    error: { code?: number; message?: string } | undefined;
  },
): BackupOperation => {
  const meta = exportOperation.metadata as IExportDocumentsMetadata;
  return {
    ...backupOperation,
    done: exportOperation.done || false,
    collectionIds: meta.collectionIds || [],
    outputUriPrefix: meta.outputUriPrefix || null,
    operationState: meta.operationState || null,
    startTime: toISOTime(meta.startTime),
    endTime: toISOTime(meta.endTime),
    errorCode: exportOperation.error?.code || null,
    errorMessage: exportOperation.error?.message || null,
  };
};

const FAILED_OPERATION_STATES = new Set(["FAILED", "CANCELLED"]);

/**
 * True when a long-running export has finished successfully.
 * `done` alone is not enough — failed/cancelled ops also set `done: true`.
 */
export const isSuccessfulExport = (backupOperation: BackupOperation): boolean => {
  if (!backupOperation.done) {
    return false;
  }
  if (backupOperation.errorCode != null || backupOperation.errorMessage) {
    return false;
  }
  const state = backupOperation.operationState?.toString().toUpperCase();
  if (state && FAILED_OPERATION_STATES.has(state)) {
    return false;
  }
  return true;
};
