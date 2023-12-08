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
  }
): BackupOperation => {
  const meta = exportOperation.metadata as IExportEntitiesMetadata;
  return {
    ...backupOperation,
    done: exportOperation.done || false,
    kinds: meta.entityFilter?.kinds || [],
    outputUriPrefix: meta.outputUrlPrefix || null,
    operationState: meta.common?.state ? `${meta.common.state}` : null,
    startTime: toISOTime(meta.common?.startTime),
    endTime: toISOTime(meta.common?.endTime),
    errorCode: exportOperation.error?.code || null,
    errorMessage: exportOperation.error?.message || null,
  };
};
