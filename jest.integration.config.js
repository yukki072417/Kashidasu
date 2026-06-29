module.exports = {
  testEnvironment: "node",
  collectCoverage: false,
  verbose: true,
  runInBand: true,
  testSequencer: "<rootDir>/src/tests/integration/testSequencer.js",
  globalSetup: "<rootDir>/src/tests/integration/jestGlobalSetup.js",
  testMatch: ["**/tests/integration/**/*.test.js"],
  testPathIgnorePatterns: ["src/public", "public", "node_modules"],
  setupFilesAfterEnv: ["<rootDir>/src/tests/integration/globalSetup.js"],
  forceExit: true,
  moduleNameMapper: {
    "^jquery$": "jquery/dist/jquery.js",
    "^@/(.*)$": "<rootDir>/src/$1",
    "^@tests/(.*)$": "<rootDir>/src/tests/$1",
    "^@root/(.*)$": "<rootDir>/$1",
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
