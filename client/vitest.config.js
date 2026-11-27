import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

// Unit-test configuration (Vitest + React Testing Library, run in a simulated browser: jsdom)
export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./src/test/setup.js",
    css: false,
  },
});
