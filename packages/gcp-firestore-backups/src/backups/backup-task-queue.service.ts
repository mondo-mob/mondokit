import { LazyProvider } from "@mondokit/gcp-core";
import { TaskQueueService } from "@mondokit/gcp-tasks";
import { getCoreBackupConfiguration } from "../configuration/index.js";

export const DEFAULT_BACKUP_QUEUE = "backup-queue";

export class BackupTaskQueueService extends TaskQueueService {
  constructor() {
    const config = getCoreBackupConfiguration();
    const backupConfig = config.firestoreBackup;
    super({
      queueName: backupConfig?.queue || DEFAULT_BACKUP_QUEUE,
      pathPrefix: backupConfig?.taskPrefix,
      tasksRoutingService: backupConfig?.taskService,
    });
  }
}

export const backupTaskServiceProvider = new LazyProvider(() => new BackupTaskQueueService());
