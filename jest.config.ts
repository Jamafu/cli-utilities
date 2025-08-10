import type { Config } from '@jest/types';

// Sync object
const config: Config.InitialOptions = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['src/', 'tests/'],
  testMatch: ['**/*.(spec).+(ts|tsx|js)'],
  collectCoverage: true,
  coverageDirectory: '_dist/coverage/',
  collectCoverageFrom: ['src/**/*.ts'],
  setupFiles: ['./jest.setEnvVars.ts'],
  setupFilesAfterEnv: ['./jest.globalSetup.ts'],
  clearMocks: true,
  testTimeout: 30000,
  transform: {
    '^.+\\.(ts|tsx)$': [
      'ts-jest',
      {
        tsconfig: 'tsconfig.json',
        diagnostics: true,
        importsHelper: true,
      },
    ],
  },
};
export default config;
