import { google } from "@google-cloud/datastore/build/protos/protos.js";
import { BackupOperation } from "../backups/index.js";
import ITimestamp = google.protobuf.ITimestamp;
import IExportEntitiesMetadata = google.datastore.admin.v1.IExportEntitiesMetadata;

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
  const meta = (exportOperation.metadata ?? {}) as IExportEntitiesMetadata;
  return {
    ...backupOperation,
    done: exportOperation.done ?? backupOperation.done ?? false,
    // Prefer metadata when present; otherwise keep values stored at export start.
    // Sparse/partial metadata must not wipe kinds (needed for EXPORT_TO_BIGQUERY).
    kinds: meta.entityFilter?.kinds ?? backupOperation.kinds ?? [],
    outputUriPrefix: meta.outputUrlPrefix ?? backupOperation.outputUriPrefix ?? null,
    operationState:
      meta.common?.state != null ? `${meta.common.state}` : (backupOperation.operationState ?? null),
    startTime: toISOTime(meta.common?.startTime) ?? backupOperation.startTime ?? null,
    endTime: toISOTime(meta.common?.endTime) ?? backupOperation.endTime ?? null,
    errorCode: exportOperation.error?.code ?? (exportOperation.done ? null : (backupOperation.errorCode ?? null)),
    errorMessage:
      exportOperation.error?.message ?? (exportOperation.done ? null : (backupOperation.errorMessage ?? null)),
  };
};
