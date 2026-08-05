import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Pure logic only — no jsdom needed. Keep tests colocated in lib/.
    include: ["lib/**/*.test.ts"],
    environment: "node",
  },
});
