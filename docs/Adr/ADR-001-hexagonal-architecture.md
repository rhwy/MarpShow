# ADR-001: Hexagonal Architecture with Next.js App Router

## Status
Accepted

## Date
2026-04-10

## Context
MarkShow needs a maintainable, testable architecture that separates business logic from UI and infrastructure concerns. The app uses Next.js App Router which imposes file-based routing conventions.

## Alternatives Considered

| Approach | Pros | Cons |
|----------|------|------|
| **Hexagonal (chosen)** | Clean separation, full testability, swappable adapters | More initial boilerplate |
| Feature-based folders | Simple, co-located | Business logic couples to UI |
| MVC | Familiar | Poor fit for React, tight coupling |

## Decision
Use hexagonal architecture with three layers:
- **core/** — Domain entities and port interfaces (no framework dependencies)
- **infrastructure/** — Adapter implementations (logging, storage, AI client)
- **ui/** — React components, isolated and testable

Next.js `app/` directory handles routing but delegates to `ui/` components.

## Consequences
- Domain logic is fully testable without UI or infrastructure
- Adapters can be swapped (e.g., filesystem → database) without touching domain
- Slightly more files and indirection than a flat structure
