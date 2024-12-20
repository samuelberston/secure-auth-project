// jest.config.js
export const projects = [
  {
    displayName: "backend",
    testEnvironment: "node",
    testMatch: ["<rootDir>/server/tests/**/*.test.js"],
    transform: {
      "^.+\\.js$": "babel-jest"
    },
    moduleFileExtensions: ["js"]
  },
  {
    displayName: "frontend",
    testEnvironment: "jsdom",
    testMatch: ["<rootDir>/frontend/tests/**/*.test.js"],
    transform: {
      "^.+\\.js$": "babel-jest"
    },
    moduleFileExtensions: ["js", "mjs"],
    globals: {
      "babel-jest": {
        useESM: true
      }
    },
    setupFilesAfterEnv: ["<rootDir>/jest.setup.js"]
  }
];
  