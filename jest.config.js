module.exports = {
  roots: ["<rootDir>/src/"],
  modulePathIgnorePatterns: ["<rootDir>/dist/"],
  testEnvironment: "jsdom",
  transform: {
    "^.+\\.(j|t)sx?$": "babel-jest",
  },
  moduleNameMapper: {
    "^axios$": require.resolve("axios"),
    "\\.(css)$": "identity-obj-proxy",
    "single-spa-react/parcel": "single-spa-react/lib/cjs/parcel.cjs",
    "\\.(css|scss)$": "identity-obj-proxy",
  },
  setupFilesAfterEnv: ["@testing-library/jest-dom"],
};
