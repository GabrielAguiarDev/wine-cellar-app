// ESLint flat config (Expo SDK 57)
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*', '.expo/*', 'node_modules/*'],
  },
  {
    rules: {
      // Ordenação de imports: externals → react/rn → aliases → relativos
      'import/order': [
        'warn',
        {
          groups: [
            'builtin',
            'external',
            'internal',
            ['parent', 'sibling', 'index'],
          ],
          pathGroups: [
            { pattern: 'react', group: 'external', position: 'before' },
            { pattern: 'react-native', group: 'external', position: 'before' },
            { pattern: '@/**', group: 'internal' },
            { pattern: '@components/**', group: 'internal' },
            { pattern: '@theme/**', group: 'internal' },
            { pattern: '@domain/**', group: 'internal' },
            { pattern: '@services/**', group: 'internal' },
            { pattern: '@store/**', group: 'internal' },
            { pattern: '@config/**', group: 'internal' },
            { pattern: '@data/**', group: 'internal' },
            { pattern: '@hooks/**', group: 'internal' },
            { pattern: '@utils/**', group: 'internal' },
          ],
          pathGroupsExcludedImportTypes: ['react', 'react-native'],
          'newlines-between': 'always',
          alphabetize: { order: 'asc', caseInsensitive: true },
        },
      ],
    },
  },
]);
