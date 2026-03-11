module.exports = {
  testEnvironment: "node",
  collectCoverage: true,
  coverageDirectory: "coverage",
  coverageReporters: ["text", "lcov", "html"],
  collectCoverageFrom: [
    "src/**/*.js",
    "!src/app.js",
    "!**/node_modules/**",
    "!src/public/**/*.js",
  ],
  testMatch: ["**/tests/**/*.test.js"],
  testPathIgnorePatterns: ["src/public", "public", "node_modules"],
  setupFilesAfterEnv: ["<rootDir>/src/tests/setup.js"],
  verbose: true,
  detectOpenHandles: true,
  forceExit: true,
  moduleNameMapper: {
    "^jquery$": "jquery/dist/jquery.js",
  },
  transformIgnorePatterns: [
    "node_modules/(?!(jsdom|@exodus/bytes|@asamuzakjp|cssstyle|whatwg-encoding|whatwg-url|csscalc|csscolor|nwsapi|parse5|sax|symbol-tree|whatwg-mimetype|domexception|webidl-conversions|css-tree|mdn-data)/)",
  ],
  globals: {
    "ts-jest": {
      useESM: true,
    },
  },
};
