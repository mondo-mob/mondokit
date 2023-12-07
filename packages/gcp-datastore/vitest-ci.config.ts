import { defineConfig } from "vitest/config";
import { vitestConfig } from "../../vitest.config.base";

export default defineConfig(vitestConfig({
  globalSetup: "./src/__test/ci-setup-teardown.ts"
}));
