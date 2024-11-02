const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:8081', // development frontend
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});
