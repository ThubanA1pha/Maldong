import { defineConfig } from "@playwright/test"
import base from "./playwright.config"

export default defineConfig({
  ...base,
  testDir: "./regressions",
  testMatch: /implementation\.spec\.ts$/,
})
