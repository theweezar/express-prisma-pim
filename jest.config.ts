import { createJsWithTsEsmPreset, type JestConfigWithTsJest } from 'ts-jest'

const jestConfig: JestConfigWithTsJest = {
  ...createJsWithTsEsmPreset(),
  testMatch: ['**/*.test.ts']
}

export default jestConfig

