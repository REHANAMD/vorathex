// eslint.config.js
//
// Vorathex lint configuration (ESLint flat config).
//
// Flat config is a LEFT-FOLD over an array: later entries win over earlier ones for
// any file they both match. Two consequences drive the ordering below:
//   1. eslint-config-prettier is LAST, so it can switch off every formatting rule
//      anything above may have switched on. Prettier owns whitespace; ESLint owns logic.
//   2. Rule OPTIONS are replaced, not merged. If a later block re-specifies
//      `no-restricted-imports`, it discards the earlier block's paths entirely — which
//      is why the pure-core block below repeats the `decimal.js` restriction.

import js from '@eslint/js';
import prettierConfig from 'eslint-config-prettier/flat';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    name: 'vorathex/ignores',
    // Build output, coverage output, and generated declarations are not source.
    ignores: ['dist/**', 'coverage/**', '**/*.d.ts'],
  },

  {
    name: 'vorathex/linter-options',
    linterOptions: {
      // A stale `eslint-disable` is a lie about the code. Fail on it, don't warn:
      // the FINAL gate requires zero warnings, so warnings are not a usable channel.
      reportUnusedDisableDirectives: 'error',
    },
  },

  // Core JS correctness rules (no-undef, no-constant-condition, ...). Must come before
  // the typescript-eslint block, which switches off the ones TypeScript already covers.
  js.configs.recommended,

  {
    name: 'vorathex/typescript-type-aware',
    files: ['**/*.ts'],
    extends: [tseslint.configs.strictTypeChecked, tseslint.configs.stylisticTypeChecked],
    languageOptions: {
      parserOptions: {
        // Type-AWARE linting. Without this, the rules that actually matter for an engine
        // with a Postgres pool and a Redis consumer loop — no-floating-promises,
        // no-misused-promises, strict-boolean-expressions — physically cannot run,
        // because they need the type checker, not just the AST.
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      // --- Async correctness: the class of bug that silently eats orders ---------
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-misused-promises': 'error',
      '@typescript-eslint/return-await': ['error', 'in-try-catch'],

      // --- Explicitness over truthiness -----------------------------------------
      // `if (order.price)` is a bug waiting to happen: a Decimal of zero, an empty
      // string, a 0 quantity are all falsy. Force explicit comparisons everywhere.
      '@typescript-eslint/strict-boolean-expressions': [
        'error',
        {
          allowString: false,
          allowNumber: false,
          allowNullableObject: false,
          allowNullableBoolean: false,
          allowNullableString: false,
          allowNullableNumber: false,
          allowAny: false,
        },
      ],

      // Order is a discriminated union (LIMIT | MARKET); so is the event type. When a
      // new variant is added, every switch over it must fail to lint until it is handled.
      '@typescript-eslint/switch-exhaustiveness-check': [
        'error',
        {
          allowDefaultCaseForExhaustiveSwitch: false,
          requireDefaultForNonUnion: true,
        },
      ],

      // --- ESM / verbatimModuleSyntax discipline (tsconfig, Day 2) ---------------
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'separate-type-imports' },
      ],
      '@typescript-eslint/consistent-type-exports': 'error',

      // --- Library surface -------------------------------------------------------
      // This ships as a package; the public boundary must be typed by hand, not inferred.
      '@typescript-eslint/explicit-module-boundary-types': 'error',
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-non-null-assertion': 'error',
      '@typescript-eslint/prefer-readonly': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],

      // --- Immutability guard rails ----------------------------------------------
      // `props: true` also forbids mutating a field of a parameter. This is the closest
      // a linter gets to enforcing "match() does not mutate its inputs".
      'no-param-reassign': ['error', { props: true }],
      'prefer-const': 'error',

      // Structured logging goes through pino (src/utils/logger.ts, Day 12). Nothing else.
      'no-console': 'error',
      eqeqeq: ['error', 'always'],
    },
  },

  {
    name: 'vorathex/decimal-discipline',
    files: ['src/**/*.ts', 'tests/**/*.ts'],
    // The wrapper is the one place allowed to know decimal.js exists.
    ignores: ['src/utils/decimal.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: 'decimal.js',
              message:
                'Import the Decimal wrapper from src/utils/decimal.ts — one blessed money type, no raw decimal.js leakage.',
            },
          ],
        },
      ],
    },
  },

  {
    name: 'vorathex/prime-directive-pure-core',
    // The matching path, the projection, and replay. Nothing non-deterministic may enter.
    files: ['src/engine/**/*.ts', 'src/events/projections.ts', 'src/events/replay.ts'],
    rules: {
      // `new Date()` and `Date.now()` both resolve through the `Date` global.
      'no-restricted-globals': [
        'error',
        {
          name: 'Date',
          message:
            'Prime Directive: no clock in the pure core. Timestamps are assigned before an order reaches match() and carried as data.',
        },
        {
          name: 'process',
          message:
            'Prime Directive: no environment or I/O in the pure core. Configuration is passed in as data.',
        },
      ],
      'no-restricted-properties': [
        'error',
        {
          object: 'Math',
          property: 'random',
          message:
            'Prime Directive: no randomness in the pure core. Ids are generated in src/utils/id.ts, outside matching.',
        },
      ],
      // NOTE: this REPLACES the decimal-discipline block's options for these files,
      // so decimal.js is restated here. Flat config replaces rule options; it never merges.
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: 'decimal.js',
              message: 'Import the Decimal wrapper from src/utils/decimal.ts.',
            },
            { name: 'crypto', message: 'Prime Directive: no id generation inside the pure core.' },
            {
              name: 'node:crypto',
              message: 'Prime Directive: no id generation inside the pure core.',
            },
            {
              name: 'pino',
              message: 'Prime Directive: no logging inside the matching calculation.',
            },
            { name: 'pg', message: 'Prime Directive: no I/O in the pure core.' },
            { name: 'ioredis', message: 'Prime Directive: no I/O in the pure core.' },
          ],
          patterns: [
            {
              group: [
                '**/utils/logger.js',
                '**/utils/id.js',
                '**/persistence/**',
                '**/ingestion/**',
              ],
              message:
                'Prime Directive: the pure core may not reach into logging, id generation, persistence, or ingestion.',
            },
          ],
        },
      ],
    },
  },

  {
    name: 'vorathex/tests',
    files: ['tests/**/*.ts'],
    rules: {
      // Test fixtures know their own shape; forcing a null check on a known-good fixture
      // adds noise, not safety.
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      // vitest's `expect(obj.method).toHaveBeenCalled()` trips unbound-method by design.
      '@typescript-eslint/unbound-method': 'off',
    },
  },

  {
    name: 'vorathex/config-files',
    // Root config files (this file, tsup.config.ts, vitest.config.ts) are tooling, not
    // library source, and are not necessarily inside the tsconfig project. disableTypeChecked
    // resets parserOptions to `{ project: false, projectService: false }` and switches off
    // every type-aware rule, so these files lint syntactically without the type checker.
    files: ['**/*.js', '*.config.ts'],
    extends: [tseslint.configs.disableTypeChecked],
    rules: {
      '@typescript-eslint/explicit-module-boundary-types': 'off',
    },
  },

  // MUST BE LAST. Switches off every rule that would fight Prettier over the same
  // characters. Anything after this could re-enable a formatting rule and reopen the war.
  prettierConfig,
);
