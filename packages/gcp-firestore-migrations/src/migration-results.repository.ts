import { TimestampedEntity, TimestampedRepository } from "@mondokit/gcp-firestore";

export interface MigrationResult extends TimestampedEntity {
  result: "COMPLETE" | "ERROR";
  error?: string;
}

export const migrationResultsRepository = new TimestampedRepository<MigrationResult>("migrations");
