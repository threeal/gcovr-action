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
  },
  verbose: true
}
