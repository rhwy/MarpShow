# MarkShow — Project Context

## What is this project?

MarkShow is a **markdown-first presentation editor** using [Marp](https://marp.app/) format with an **AI co-author** (Claude). Users write slides in Marp markdown; the AI helps generate content, structure, and syntax. Dark-themed, modern UI.

**Design reference:** `MarpWebManager.pen` (read via pencil MCP tools only, never with Read/Grep).

---

## Tech Stack

| Layer | Choice | Notes |
|---|---|---|
| Framework | **Next.js 15** (App Router) + TypeScript | File-based routing, React 19 |
| Styling | **Tailwind CSS v4** | Design tokens in `src/app/globals.css` |
| Code editor | **CodeMirror 6** | Markdown/CSS/JS tabs |
| Slide rendering | **Marp Core** (`@marp-team/marp-core`) | Markdown → HTML slides |
| AI | **OpenAI-compatible API** | Provider-agnostic: works with Claude, Ollama (gemma4), or any OpenAI-compatible endpoint. Configured via env vars (url, model, system prompt) |
| Icons | **Lucide React** | Icon-only navigation |
| Test framework | **Vitest** + React Testing Library + happy-dom | |
| Package manager | **pnpm** | |
| Runtime | **Node 22** (Alpine) in Docker | |
| Fonts | Inter (headings), Geist (body), Funnel Sans (captions), Geist Mono (code) | Via `geist` package + Google Fonts |

---

## Architecture

**Hexagonal architecture** with three layers (ADR-001):

```
src/
  app/           → Next.js App Router (pages, API routes, layout)
  core/          → Domain layer: entities, ports (interfaces), use cases
    ports/       → Contracts/interfaces (no framework deps)
    domain/      → Domain models and value objects
  infrastructure/→ Adapter implementations
    logging/     → ConsoleLogger (abstracted via Logger interface)
    storage/     → Filesystem adapter (when created)
    ai/          → Claude API adapter (when created)
  ui/            → React components (isolated, testable, props-driven)
    components/  → Shared components (TopBar, etc.)
```

**Key principle:** Domain logic in `core/` has zero framework dependencies. Adapters in `infrastructure/` implement port interfaces. UI components are isolated, testable, and rely only on provided props.

---

## Containerization (ADR-002)

**ALL work runs inside Docker.** No host dependencies beyond Docker itself.

- `docker-compose.yml` — dev target with hot reload (Turbopack), bind mounts
- `.env` → `docker-compose.yml` → container environment variables
- Port: `3737` (configurable via `APP_PORT`)
- Storage: `data/presentations/` folder mounted into container at `STORAGE_PATH`
- Anonymous volumes for `/app/node_modules` and `/app/.next` to avoid host conflicts

---

## Scripts (Rule 5)

Every recurring action has a script. A developer only needs:

| Command | What it does |
|---|---|
| `./scripts/dev.sh` | Start Docker dev environment (background, hot reload) |
| `./scripts/run.sh` | Start Docker production mode |
| `./scripts/build.sh` | Run `next build` inside container (NODE_ENV=production) |
| `./scripts/test.sh` | Run `vitest run` inside container |
| `./scripts/commit.sh "msg"` | Build → test → commit (fails if tests fail) |
| `./scripts/push.sh` | Push current branch to remote |

---

## Development Rules

### Rule 1 — Quality & Testability
- Unit, use-case, and integration tests created with ALL code
- Tests run before each commit (enforced by `commit.sh`)
- User docs in `docs/user/` — use-case oriented, not feature lists

### Rule 2 — Architecture
- Hexagonal architecture, clean code, separation of concerns
- Important decisions → ADR files in `docs/Adr/`
- C4 diagrams in `docs/diagrams/` (DSL format, LikeC4-compatible)

### Rule 3 — Components
- UI components: isolated, testable, cohesive, props-driven
- Must work standalone, carry all needed logic internally

### Rule 4 — Containerization
- ALL build/run/test inside Docker containers
- All config via environment variables (`.env` → compose → container)
- Params: ports, paths, AI config (url, models, keys)

### Rule 5 — Scripting
- One script per basic task: dev, run, build, test, commit, push
- `commit.sh` = build + test + commit (quality gate)

### Rule 6 — Versioning
- Work in dedicated branches per batch
- Commits autonomous if tests pass
- **Merge to main requires human confirmation** (squash merge with summary)
- Dev log in `docs/devlog/yyyy-MM-dd.md` — sections `## hh:mm - branch-name`

### Rule 7 — Logging & Tracing
- All events/actions logged via abstracted `Logger` interface
- `createLogger(context)` factory in `@/infrastructure/logging`
- Ready to plug any log receiver later

### Rule 8 — Definition of Done
- App compiles, runs, container up, tests pass
- Code committed, dev log written
- Documentation updated
- Architecture reviewed (no tech debt accumulation)
- Tasks updated
- Human review before merge

### Rule 9 — Task Tracking
- `docs/tasks/backlog.md` — items to do
- `docs/tasks/done-{yyyyMM}.md` — completed items (anté-chronological, by day)
- Format: `- [TYPE : ID-NNN] title` (types: feat, fix, init, clean, struct, test)
- Sequential ID in `docs/tasks/id.txt` — increment per new backlog item
- Many commits per item OK, never many items in one commit

### Workflow — Task Execution Protocol
- **Always create backlog tasks BEFORE starting work.** Each new request = new task(s) with sequential IDs.
- **Commit after EACH task completion** — not batched. Each commit includes the code, test, task tracking updates, and devlog entry.
- **No authorization needed for commits during branch work** — only ask the user before merging to main.
- **Execute tasks in logical/priority order**, not necessarily FIFO. Group by dependency and coherence.

---

## Design Tokens

Defined in `src/app/globals.css` and mapped to Tailwind via `@theme`:

- **Surfaces:** `--surface-primary` (#0A0A0A), `--surface-card` (#141414), `--surface-elevated` (#1A1A1A), `--surface-hover` (#252525)
- **Foreground:** `--fg-primary` (#FFF), `--fg-secondary` (#A1A1AA), `--fg-muted` (#71717A)
- **Accents:** `--accent-primary` (#A855F7 purple), `--accent-secondary` (#EC4899 pink)
- **Border:** `--border-subtle` (#1A1A1A)
- **Radii:** `--rounded-lg` (8px), `--rounded-xl` (12px), `--rounded-3xl` (24px), `--rounded-full`

Use Tailwind classes: `bg-surface-primary`, `text-fg-secondary`, `text-accent-primary`, `border-border-subtle`, `rounded-xl`, etc.

---

## Pages & Routes

| Route | Page | Purpose |
|---|---|---|
| `/` | Home | Browse, create, manage presentations |
| `/editor/:id` | Editor | Write slides with AI assistant + live preview |
| `/present/:id` | Presentation | Fullscreen slide display |
| `/details/:id` | Details | Review content, history, AI conversations |
| `/settings` | Configuration | Themes, plugins, editor preferences |

---

## Data Storage

Presentations are stored on the filesystem — one folder per presentation:

```
data/presentations/
  {uuid}/
    presentation.md    — Marp markdown source
    styles.css         — Custom CSS
    scripts.js         — Custom JS
    metadata.json      — Title, description, dates, theme, plugins
    history.json       — Change history entries
    conversation.json  — AI chat history
```

This folder is bind-mounted into the container at `STORAGE_PATH` (`/data/presentations`).

---

## Existing ADRs

- **ADR-001:** Hexagonal architecture with Next.js App Router
- **ADR-002:** Docker-first development with hot reload
- **ADR-003:** Vitest for testing
