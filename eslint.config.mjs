import tseslint from 'typescript-eslint';
import prettierConfig from 'eslint-plugin-prettier/recommended';
import importPlugin from 'eslint-plugin-import-x';
import globals from 'globals';

export default tseslint.config(
  // Global ignores (replaces .eslintignore)
  {
    ignores: [
      '**/__fixtures__/**',
      'test-harness/tests/**',
      'packages/*/dist/**',
      'packages/rulesets/src/oas/schemas/validators.ts',
      'packages/rulesets/src/arazzo/schemas/validators.ts',
      'packages/*/CHANGELOG.md',
      'packages/formatters/src/html/templates.ts',
    ],
  },

  // Base for all linted files
  {
    files: ['packages/**/*.{js,mjs,ts}', 'test-harness/**/*.{js,mjs,ts}'],
    extends: [tseslint.configs.recommended, prettierConfig],
    languageOptions: {
      globals: { ...globals.es2015, ...globals.browser, ...globals.node },
    },
    rules: {
      'no-console': 'error',
      '@typescript-eslint/prefer-for-of': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          args: 'after-used',
          ignoreRestSiblings: true,
        },
      ],
      '@typescript-eslint/no-require-imports': 'warn',
      '@typescript-eslint/explicit-function-return-type': 'warn',
    },
  },

  // TypeScript source files with type-checking
  {
    files: ['packages/*/src/**/*.ts'],
    extends: [tseslint.configs.eslintRecommended, tseslint.configs.recommendedTypeChecked],
    plugins: { import: importPlugin },
      parserOptions: {
        project: './tsconfig.eslint.json',
        tsconfigRootDir: new URL('.', import.meta.url).pathname,
      }
    },
    rules: {
      '@typescript-eslint/prefer-optional-chain': 'error',
      '@typescript-eslint/prefer-regexp-exec': 'error',
      '@typescript-eslint/prefer-nullish-coalescing': 'error',
      '@typescript-eslint/no-floating-promises': ['error', { ignoreVoid: true }],
      '@typescript-eslint/strict-boolean-expressions': 'warn',
      '@typescript-eslint/only-throw-error': 'error',
      '@typescript-eslint/no-unsafe-argument': 'warn',
      'import/no-extraneous-dependencies': [
        'error',
        { devDependencies: ['**/*.{test,spec}.ts', '**/__tests__/__helpers__/*.ts'] },
      ],
    },
  },

  // CLI package: downgrade no-console to warn
  {
    files: ['packages/cli/src/**/*.ts'],
    rules: { 'no-console': 'warn' },
  },

  // Test files: relax strict rules
  {
    files: ['packages/*/src/**/__tests__/**/*.ts', 'test-harness/**/*.{ts,js}'],
    rules: {
      '@typescript-eslint/strict-boolean-expressions': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/no-floating-promises': 'off',
      '@typescript-eslint/require-await': 'off',
      '@typescript-eslint/unbound-method': 'off',
      '@typescript-eslint/no-require-imports': 'off',
      '@typescript-eslint/prefer-promise-reject-errors': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/restrict-template-expressions': 'off',
    },
  },

  // Jest test files: jest + node globals
  {
    files: ['**/__tests__/**/*.jest.test.{ts,js}', '__mocks__/**/*.{ts,js}'],
    languageOptions: { globals: { ...globals.jest, ...globals.node } },
  },

  // Karma test files: browser + jasmine globals
  {
    files: ['**/__tests__/**/*.karma.test.{ts,js}'],
    languageOptions: { globals: { ...globals.browser, ...globals.jasmine } },
  },

  // Scripts and test-harness: node globals
  {
    files: ['scripts/**/*.{mjs,ts}', 'test-harness/**/*.{ts,js}'],
    languageOptions: { globals: { ...globals.node } },
  },
);
