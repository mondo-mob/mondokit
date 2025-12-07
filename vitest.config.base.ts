import { defineConfig } from "vitest/config";
import { InlineConfig } from "vitest/node";

export const vitestConfig = (overrides?: InlineConfig) =>
  defineConfig({
    test: {
      globals: true,
      setupFiles: ["./src/__test/setup-tests.ts", "./src/__test/setup-after-env.ts"],
      testTimeout: 20000,
      restoreMocks: true,
      clearMocks: true,
      maxWorkers: 1,
      sequence: {
        hooks: "list",
        setupFiles: "list",
      },
      // Being specific on test match prevents IDE from running generated JS files
      include: ["**/?(*.)+(test)\\.ts"],
      ...overrides,
    },
  });
