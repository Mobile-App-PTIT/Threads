module.exports = {
  // Basic Environment Setup
  testEnvironment: "node",
  rootDir: "src",

  // Module Resolution
  moduleFileExtensions: ["js"],
  transform: {
    "^.+\\.js$": "babel-jest",
  },
  moduleNameMapper: {
    "^@src/(.*)$": "<rootDir>/$1",
  },

  // Testing Patterns and Coverage
  testRegex: ".*\\.test\\.js$",
  testPathIgnorePatterns: ["/node_modules/", "/dist/"],
  collectCoverage: true,
  collectCoverageFrom: ["**/*.js"],
  coveragePathIgnorePatterns: [
    "/node_modules/",
    "/dist/",
    "/routes/",
    // "/db.ts",
    // "/app.ts",
    "/models",
  ],
  coverageDirectory: "../coverage",
};
