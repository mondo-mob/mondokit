import { InlineConfig } from "vitest";
import { UserConfigExport } from "vitest/config";

export const vitestConfig = (overrides?: InlineConfig): UserConfigExport => ({
  test: {
    globals: true,
    setupFiles: ["./src/__test/setup-tests.ts", "./src/__test/setup-after-env.ts"],
    testTimeout: 20000,
    restoreMocks: true,
    clearMocks: true,
    poolOptions: {
      threads: {
        singleThread: true,
      },
    },
    sequence: {
      hooks: "list",
      setupFiles: "list",
    },
    // Being specific on test match prevents IDE from running generated JS files
    include: ["**/?(*.)+(test)\\.ts"],
    ...overrides,
  },
});
