module.exports = {
  clearMocks: true,
  moduleFileExtensions: ['js', 'ts'],
  testMatch: ['**/*.test.ts'],
  transform: {
    '^.+\\.ts$': 'ts-jest'
  },
  setupFilesAfterEnv: ["./jest.setup.js"],
  moduleNameMapper: {
    'actions/cache': '<rootDir>/lib/testing/mock/actions-cache.js',
    'ansi-styles': '<rootDir>/lib/testing/mock/ansi-styles.js',
  },
  verbose: true
}
