# Tech Stack — MarkShow

> This document is **project-specific**. It describes the technology choices for MarkShow. When starting a new project with a different stack, create a new version of this file — the process rules in `PROCESS.md` remain the same.

---

## Core Stack

| Layer | Choice | Version | Rationale |
|-------|--------|---------|-----------|
| Framework | Next.js (App Router) | 15.x | SSR, file-based routing, React ecosystem |
| Language | TypeScript | 5.x | Type safety, IDE support |
| UI library | React | 19.x | Component model, ecosystem |
| Styling | Tailwind CSS | v4 | Utility-first, design tokens via `@theme` |
| Package manager | pnpm | latest | Fast, disk-efficient |
| Runtime | Node.js | 22 LTS | Alpine Docker image |
| Container | Docker Compose | latest | Dev + prod targets, bind mounts |

## Domain-Specific

| Layer | Choice | Rationale |
|-------|--------|-----------|
| Code editor | CodeMirror 6 | Extensible, markdown/CSS/JS modes, merge view |
| Slide rendering | Marp Core (`@marp-team/marp-core`) | Markdown → HTML slides, theme system |
| AI | OpenAI-compatible API (fetch-based) | Provider-agnostic: Ollama, Claude, OpenAI |
| Diff review | `@codemirror/merge` | Per-chunk accept/reject in unified view |
| Diagrams | Mermaid.js (browser bundle) | Offline, renders in slides |
| Charts | Chart.js (UMD bundle) | Offline, renders in slides |
| PPTX export | pptxgenjs (browser bundle) | Client-side PowerPoint generation |
| Icons | Lucide React | Lightweight, consistent |

## Testing

| Tool | Purpose |
|------|---------|
| Vitest | Test runner, fast, native ESM/TS |
| React Testing Library | Component testing |
| happy-dom | Lightweight DOM environment |
| `@testing-library/jest-dom` | DOM matchers |

## Fonts

| Role | Font | Source |
|------|------|--------|
| Headings | Inter | `next/font/google` (build-time download) |
| Body | Geist Sans | `geist` package |
| Code | Geist Mono | `geist` package |
| Captions | Funnel Sans | `next/font/google` |
| Marp slides | Lato, Roboto Mono | `@fontsource` (bundled in `public/fonts/`) |

## Architecture Patterns

- **Hexagonal architecture** (ports and adapters)
- **Domain layer** (`core/domain`, `core/ports`) has zero framework dependencies
- **Infrastructure** implements port interfaces (filesystem storage, Marp renderer, AI adapter)
- **UI components** are isolated, testable, props-driven
- **API routes** are thin — delegate to domain/infrastructure
- **Logger abstraction** — `createLogger(context)` factory, pluggable backend

## Docker Configuration

```yaml
# Key compose settings
services:
  app:
    build: { target: dev }      # Multi-stage: dev (hot reload) | prod (standalone)
    volumes:
      - .:/app                   # Source bind mount for hot reload
      - /app/node_modules        # Anonymous volume (container's own deps)
      - /app/.next               # Anonymous volume (build cache)
      - ./data:/data             # Persistent storage bind mount
    environment:
      - WATCHPACK_POLLING=true   # Reliable file watching in Docker
```

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `APP_PORT` | No | `3737` | Host port mapping |
| `NODE_ENV` | No | `development` | Environment mode |
| `STORAGE_PATH` | No | `/data/presentations` | Data directory in container |
| `AI_API_URL` | No | `http://localhost:11434/v1` | AI API endpoint |
| `AI_MODEL` | No | `gemma4` | AI model name |
| `AI_API_KEY` | No | *(empty)* | AI API key (optional for Ollama) |
| `AI_SYSTEM_PROMPT` | No | *(built-in)* | Custom system prompt |

## Known Constraints

1. **Docker `.next` anonymous volume**: caches stale build artifacts. Build scripts recreate the container to get fresh volumes.
2. **Marp CSS specificity**: Marp uses very specific selectors (`div.marpit > svg > foreignObject > section`). Custom CSS must be scoped to match.
3. **pptxgenjs**: uses Node.js modules — must be loaded as browser bundle via `<script>` tag, not via `import`.
4. **Marp fonts**: injects `@import` for CDN fonts — stripped and replaced with local `@font-face` for offline support.
