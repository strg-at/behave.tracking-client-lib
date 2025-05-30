module.exports = {
  verbose: true,
  collectCoverage: true,
  testPathIgnorePatterns: ['<rootDir>/lib/'],
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
}
