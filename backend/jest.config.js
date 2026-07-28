module.exports = {
    preset: "ts-jest",
    testEnvironment: "node",
    roots: ["<rootDir>/src"],
    testMatch: ["**/__tests__/**/*.test.ts"],
    setupFiles: ["<rootDir>/src/__tests__/env.setup.ts"],
    setupFilesAfterEnv: ["<rootDir>/src/__tests__/setup.ts"],
    testTimeout: 20000,
    maxWorkers: 1,
};
