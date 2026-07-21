import { BackupOperation } from "../backups/index.js";
import { mergeExportOperation } from "./util.js";

const baseOperation = (overrides: Partial<BackupOperation> = {}): BackupOperation => ({
  id: "op-1",
  type: "EXPORT_TO_BIGQUERY",
  operationName: "operations/123",
  name: "export",
  kinds: ["User", "Order"],
  outputUriPrefix: "gs://bucket/export/folder",
  createdAt: new Date("2026-01-01T00:00:00.000Z"),
  updatedAt: new Date("2026-01-01T00:00:00.000Z"),
  ...overrides,
});

describe("mergeExportOperation", () => {
  it("preserves kinds when metadata omits entityFilter", () => {
    const merged = mergeExportOperation(baseOperation(), {
      done: false,
      metadata: { outputUrlPrefix: "gs://bucket/export/folder" },
      error: undefined,
    });

    expect(merged.kinds).toEqual(["User", "Order"]);
    expect(merged.outputUriPrefix).toBe("gs://bucket/export/folder");
    expect(merged.done).toBe(false);
  });

  it("preserves kinds when metadata is null", () => {
    const merged = mergeExportOperation(baseOperation(), {
      done: false,
      metadata: null,
      error: undefined,
    });

    expect(merged.kinds).toEqual(["User", "Order"]);
  });

  it("updates kinds when metadata provides them", () => {
    const merged = mergeExportOperation(baseOperation(), {
      done: true,
      metadata: {
        entityFilter: { kinds: ["User"] },
        outputUrlPrefix: "gs://bucket/export/updated",
        common: { state: "SUCCESSFUL" },
      },
      error: undefined,
    });

    expect(merged.kinds).toEqual(["User"]);
    expect(merged.outputUriPrefix).toBe("gs://bucket/export/updated");
    expect(merged.operationState).toBe("SUCCESSFUL");
    expect(merged.done).toBe(true);
  });

  it("records error details when the export fails", () => {
    const merged = mergeExportOperation(baseOperation(), {
      done: true,
      metadata: { entityFilter: { kinds: ["User", "Order"] } },
      error: { code: 13, message: "export failed" },
    });

    expect(merged.errorCode).toBe(13);
    expect(merged.errorMessage).toBe("export failed");
    expect(merged.kinds).toEqual(["User", "Order"]);
  });
});
