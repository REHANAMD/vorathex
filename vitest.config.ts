// vitest.config.ts
import { defineConfig } from 'vitest/config';

/**
 * Vitest 4 configuration.
 *
 * Two projects, deliberately:
 *   - `unit`        — pure in-memory tests (engine, events). No services. Always runnable.
 *   - `integration` — tests that open real TCP connections to Postgres and Redis.
 *
 * Root-level `test` options are NOT inherited by inline projects unless a project
 * sets `extends: true`. Every option a project needs is therefore stated inside that
 * project. The duplication is not an oversight — see the study guide.
 *
 * `coverage` is a global option: it cannot be set per-project and must live at root.
 */
export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: 'unit',
          include: ['tests/engine/**/*.test.ts', 'tests/events/**/*.test.ts'],
          environment: 'node',

          // globals: false is Vitest's default, restated so the decision is visible.
          // tsconfig sets `types: ["node"]`, so describe/it/expect do not exist as
          // ambient globals. Every test file imports them explicitly from 'vitest'.
          // Flipping this to true would require adding "vitest/globals" to tsconfig's
          // `types`, which is repo-wide — `expect` would become an ambient global
          // inside src/engine/match.ts. Not in this project.
          globals: false,

          // A unit test that takes 10s is a bug, not a slow test. The Day 30 determinism
          // run (1000 orders x2, x100) is the one legitimate exception and declares its
          // own timeout inline: it({ timeout: 60_000 }). Per-test timeouts keep this
          // global bound honest instead of inflating it to hide one slow case.
          testTimeout: 10_000,
          hookTimeout: 10_000,

          restoreMocks: true, // no mock state leaks across test files
        },
      },
      {
        test: {
          name: 'integration',
          include: ['tests/persistence/**/*.test.ts', 'tests/ingestion/**/*.test.ts'],
          environment: 'node',
          globals: false,

          // Real network round-trips, real transactions, real XCLAIM timeouts.
          // The failure-handling test (Day 55) deliberately waits for a pending-message
          // claim to time out, which alone can exceed the 5s default.
          testTimeout: 30_000,
          hookTimeout: 30_000,

          // These suites share ONE Postgres database and ONE Redis stream. Vitest runs
          // test FILES in parallel by default; two files truncating vorathex_events at
          // the same time is a flaky-test factory. Serialise them.
          fileParallelism: false,

          restoreMocks: true,
        },
      },
    ],

    coverage: {
      provider: 'v8',
      reportsDirectory: 'coverage', // gitignored (Day 3)
      reporter: ['text', 'text-summary', 'html', 'lcov'],

      // MANDATORY in Vitest 4. `coverage.all` was removed; coverage now reports only
      // files that were loaded during the run. Without an explicit include, a source
      // file that no test imports never appears in the report at all — so it cannot
      // drag the number down, and an untested module reads as 100%. This line is what
      // makes an untested file show up as 0% and count against the thresholds.
      include: ['src/**/*.ts'],

      // Subtracts from `include` above, so it only needs to name things inside src/.
      exclude: [
        '**/index.ts', // barrels: pure re-exports, no branches, no logic to cover
        '**/*.d.ts',
      ],

      // Glob-keyed thresholds. A glob entry does NOT inherit global thresholds, and
      // there are deliberately no global thresholds here: a global floor would count
      // src/persistence/** and src/ingestion/** into its denominator, and those are
      // covered only by the integration project — which does not run on a bare machine.
      // The FINAL gate asks for >=80% on src/engine/ and src/events/. That, exactly.
      thresholds: {
        'src/engine/**/*.ts': {
          lines: 80,
          functions: 80,
          branches: 80,
          statements: 80,
        },
        'src/events/**/*.ts': {
          lines: 80,
          functions: 80,
          branches: 80,
          statements: 80,
        },
      },
    },
  },
});
