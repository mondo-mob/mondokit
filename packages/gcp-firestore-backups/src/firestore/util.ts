import { google } from "@google-cloud/firestore/build/protos/firestore_admin_v1_proto_api.js";
import { BackupOperation } from "../backups/index.js";
import IExportDocumentsMetadata = google.firestore.admin.v1.IExportDocumentsMetadata;
import ITimestamp = google.protobuf.ITimestamp;

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
