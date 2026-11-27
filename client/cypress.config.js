import { defineConfig } from "cypress";

// Cypress E2E configuration. By default the tests run against the live, cloud-hosted site.
// To test a local copy instead:  npx cypress run --config baseUrl=http://localhost:5173
export default defineConfig({
  e2e: {
    baseUrl: "https://comp-229-assignment3-my-portfolio.vercel.app",
    specPattern: "cypress/e2e/**/*.cy.js",
    supportFile: "cypress/support/e2e.js",
    video: true,               // records an .mp4 of every spec into cypress/videos
    screenshotOnRunFailure: true,
    viewportWidth: 1280,
    viewportHeight: 800,
    defaultCommandTimeout: 15000, // the free Render API can take a while to wake up
  },
});
