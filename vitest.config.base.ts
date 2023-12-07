import { InlineConfig } from "vitest";
import { UserConfigExport } from "vitest/config";

const config: UserConfigExport = {
  test: {
    globals: true,
    setupFiles: ["./src/__test/setup-tests.ts", "./src/__test/setup-after-env.ts"],
    testTimeout: 20000,
    restoreMocks: true,
    clearMocks: true,
    minThreads: 1,
    maxThreads: 1,
    sequence: {
      hooks: "list",
      setupFiles: "list",
    },
    // Being specific on test match prevents IDE from running generated JS files
    include: ["**/?(*.)+(test)\\.ts"],
  },
};
export const vitestConfig = (overrides?: InlineConfig): UserConfigExport => ({
  test: {
    globals: true,
    setupFiles: ["./src/__test/setup-tests.ts", "./src/__test/setup-after-env.ts"],
    testTimeout: 20000,
    restoreMocks: true,
    clearMocks: true,
    minThreads: 1,
    maxThreads: 1,
    sequence: {
      hooks: "list",
      setupFiles: "list"
    },
    // Being specific on test match prevents IDE from running generated JS files
    include: ["**/?(*.)+(test)\\.ts"],
    ...overrides
  }
});
export default config;
