const js = require('@eslint/js');
const tsParser = require('@typescript-eslint/parser');
const tsPlugin = require('@typescript-eslint/eslint-plugin');
const globals = require('globals');

/** @type {import("eslint").Linter.FlatConfig[]} */
module.exports = [
  {
    ignores: ['dist/**', 'node_modules/**'],
  },
  {
    files: ['eslint.config.cjs'],
    languageOptions: {
      globals: globals.node,
    },
    rules: {
      'no-undef': 'off',
    },
  },
  js.configs.recommended,
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'commonjs',
      },
      globals: globals.node,
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
    },
    rules: {
      ...tsPlugin.configs.recommended.rules,
      // TS handles undefined names; this rule is noisy in TS projects.
      'no-undef': 'off',
      // Node 18+ has global Request/Response, but we import Express types with same names.
      'no-redeclare': 'off',
      '@typescript-eslint/no-redeclare': 'off',
      // Prefer the TS-aware variant.
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      // This codebase uses `any` in a few places (e.g., Express req.user typing).
      // Keep it allowed for now; tighten later if desired.
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
];

