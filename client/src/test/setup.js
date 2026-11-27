import "@testing-library/jest-dom/vitest";
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

// Unmount rendered components and clear saved sessions between tests
afterEach(() => {
  cleanup();
  sessionStorage.clear();
});
