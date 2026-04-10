# ADR-003: Vitest for Testing

## Status
Accepted

## Date
2026-04-10

## Context
The project needs a test framework that works well with TypeScript, ESM modules, React components, and Next.js. Tests must run inside Docker containers.

## Alternatives Considered

| Approach | Pros | Cons |
|----------|------|------|
| **Vitest (chosen)** | Native ESM/TS, fast, Vite-based, great DX | Newer ecosystem |
| Jest | Mature, wide adoption | ESM support requires transforms, slower |
| Playwright Test | Great for E2E | Overkill for unit/integration tests |

## Decision
Use Vitest with:
- `happy-dom` as the test environment (lightweight, fast)
- `@testing-library/react` for component testing
- `@testing-library/jest-dom` for DOM matchers
- Path aliases matching `tsconfig.json`

## Consequences
- Fast test execution, especially with `--watch` mode
- Shared Vite config for consistent module resolution
- `happy-dom` is lighter than jsdom but covers our needs
