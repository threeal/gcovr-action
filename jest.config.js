module.exports = {
  clearMocks: true,
  moduleFileExtensions: ['js', 'ts'],
  testMatch: ['**/*.test.ts'],
  transform: {
    '^.+\\.ts$': 'ts-jest'
  },
  setupFilesAfterEnv: ["./jest.setup.js"],
  moduleNameMapper: {
    'ansi-styles': '<rootDir>/mock/ansi-styles.js',
  },
  verbose: true
}
