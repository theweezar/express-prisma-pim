import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    name: 'unit',
    include: ['**/*.vi.test.?(c|m)[jt]s?(x)'],
    dir: 'tests/vitest',
    coverage: {
      provider: 'v8',
      enabled: true,
      reportsDirectory: './coverage/vitest'
    }
  },
})