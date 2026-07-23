// Jest para lógica pura (formatters, regras de preço, seletores).
// Usa babel-jest com babel-preset-expo (já no babel.config.js) e resolve os
// aliases do tsconfig. Não usa o preset jest-expo (não precisamos do ambiente
// RN para funções puras).
module.exports = {
  testEnvironment: 'node',
  transform: {
    '^.+\\.(ts|tsx|js|jsx)$': 'babel-jest',
  },
  moduleNameMapper: {
    '^@components/(.*)$': '<rootDir>/src/components/$1',
    '^@theme/(.*)$': '<rootDir>/src/theme/$1',
    '^@config/(.*)$': '<rootDir>/src/config/$1',
    '^@data/(.*)$': '<rootDir>/src/data/$1',
    '^@domain/(.*)$': '<rootDir>/src/domain/$1',
    '^@services/(.*)$': '<rootDir>/src/services/$1',
    '^@store/(.*)$': '<rootDir>/src/store/$1',
    '^@hooks/(.*)$': '<rootDir>/src/hooks/$1',
    '^@utils/(.*)$': '<rootDir>/src/utils/$1',
    '^@assets/(.*)$': '<rootDir>/assets/$1',
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testMatch: ['**/src/**/__tests__/**/*.test.ts'],
};
