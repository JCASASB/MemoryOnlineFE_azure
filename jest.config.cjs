/** @type {import('jest').Config} */
module.exports = {
  preset: "ts-jest/presets/default-esm",
  testEnvironment: "node",
  extensionsToTreatAsEsm: [".ts"],
  roots: ["<rootDir>/tests"],
  testMatch: ["**/*.test.ts"],
  moduleNameMapper: {
    "^uuid$": "<rootDir>/test/uuid.ts",
    "^@core/(.*)$": "<rootDir>/src/core/$1",
  },
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        useESM: true,
        tsconfig: "<rootDir>/tsconfig.test.json",
      },
    ],
  },
  collectCoverageFrom: [
    "src/core/**/*.ts",
    "!src/core/**/entities/*.ts",
    "!src/core/**/repository/*.ts",
    "!src/core/**/ports/*.ts",
    "!src/core/**/*.test.ts",
    "!src/core/**/test-helpers.ts",
  ],
  coverageDirectory: "coverage",
};
