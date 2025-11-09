module.exports = {
  testEnvironment: "jsdom",
  moduleFileExtensions: ["js", "jsx"],
  transform: {
    "^.+.[jt]sx?$": ["@swc/jest"],
  },
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
};
