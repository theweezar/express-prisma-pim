/**
 * For a detailed explanation regarding each configuration property, visit:
 * https://jestjs.io/docs/configuration
 */

import type { Config } from 'jest';

const config: Config = {
  verbose: true,
  clearMocks: true,
  collectCoverage: true,
  coverageDirectory: "coverage/jest",
  coverageProvider: "v8",
  testMatch: ['**/babel/**/*.test.js'],
  testPathIgnorePatterns: [
    "\\\\node_modules\\\\"
  ]
};

export default config;
