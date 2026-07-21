import { BackupOperation } from "../backups/index.js";
import { isSuccessfulExport } from "./util.js";

const baseOperation = (overrides: Partial<BackupOperation> = {}): BackupOperation => ({
  id: "op-1",
  type: "EXPORT_TO_BIGQUERY",
  operationName: "operations/123",
  name: "export",
  createdAt: new Date("2026-01-01T00:00:00.000Z"),
  updatedAt: new Date("2026-01-01T00:00:00.000Z"),
  done: true,
  operationState: "SUCCESSFUL",
  ...overrides,
});

describe("isSuccessfulExport", () => {
  it("returns false when not done", () => {
    expect(isSuccessfulExport(baseOperation({ done: false }))).toBe(false);
  });

  it("returns true for a successful completed export", () => {
    expect(isSuccessfulExport(baseOperation())).toBe(true);
  });

  it("returns true when done with no error and no operationState", () => {
    expect(isSuccessfulExport(baseOperation({ operationState: null }))).toBe(true);
  });

  it("returns false when errorCode is set", () => {
    expect(isSuccessfulExport(baseOperation({ errorCode: 13, errorMessage: "boom" }))).toBe(false);
  });

  it("returns false when errorMessage is set without errorCode", () => {
    expect(isSuccessfulExport(baseOperation({ errorMessage: "boom" }))).toBe(false);
  });

  it("returns false for FAILED operationState", () => {
    expect(isSuccessfulExport(baseOperation({ operationState: "FAILED" }))).toBe(false);
  });

  it("returns false for CANCELLED operationState", () => {
    expect(isSuccessfulExport(baseOperation({ operationState: "CANCELLED" }))).toBe(false);
  });
});
