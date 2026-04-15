# MarkShow — Session Summary (April 10–14, 2026)

> This document captures the full context of the initial development session for handoff to future sessions.

## Project State

**MarkShow** is a fully functional markdown-first presentation editor with AI co-authoring. All core workflows are implemented and working offline.

### Key metrics
- **236 tests** across 32 test files — all passing
- **77 source files**, **84 completed tasks** (ID-001 through ID-084)
- **8 ADRs** documenting architectural decisions
- **75 commits** across 18 feature branches

---

## Essential Documents

| Document | Path | Purpose |
|----------|------|---------|
| **Project context** | `CLAUDE.md` | Tech stack, architecture, rules, tokens — read by Claude at session start |
| **Requirements** | `docs/rules/start.md` | Original product vision, pages, features, design tokens |
| **User guide** | `docs/user/README.md` | Use-case oriented documentation for all features |
| **Backlog** | `docs/tasks/backlog.md` | Remaining and future tasks |
| **Done log** | `docs/tasks/done-202604.md` | All completed tasks with descriptions |
| **ADRs** | `docs/Adr/ADR-*.md` | Architecture decisions (8 total) |
| **C4 diagrams** | `docs/diagrams/model.dsl`, `views.dsl` | System architecture in C4 DSL |
| **Devlogs** | `docs/devlog/2026-04-{10,12,14}.md` | Detailed change log per day |
| **Troubleshooting** | `docs/troubleshooting.md` | Known issues and fixes |
| **Design reference** | `MarpWebManager.pen` | UI design (read via pencil MCP tools only) |

---

## Architecture Overview

### Hexagonal layers (ADR-001)
```
src/
  app/                → Next.js App Router pages + API routes
  core/domain/        → Entities: Presentation, VersionSnapshot, Settings
  core/ports/         → Interfaces: PresentationRepository, MarpRenderer, AIAssistant
  infrastructure/
    logging/          → ConsoleLogger abstraction
    storage/          → FilesystemPresentationRepository
    marp/             → MarpCoreRenderer, rewriteMediaPaths, scopeCustomCss
    ai/               → OpenAICompatibleAssistant, system-prompt
  ui/components/      → 16 isolated React components
  ui/utils/           → Export utilities (PDF, PPTX, Markdown)
```

### Key technical decisions
- **ADR-001**: Hexagonal architecture with Next.js App Router
- **ADR-002**: Docker-first development (all work inside containers)
- **ADR-003**: Vitest + React Testing Library + happy-dom
- **ADR-004**: Provider-agnostic AI via OpenAI-compatible API (Ollama/gemma4 default)
- **ADR-005**: AI diff review with @codemirror/merge (per-chunk accept/reject)
- **ADR-006**: Filesystem-based themes with Marp themeSet.add()
- **ADR-007**: Offline-first (all fonts, scripts bundled locally)
- **ADR-008**: Manual version snapshots (not auto-history)

---

## Feature Inventory

### Pages
| Route | Status | Key components |
|-------|--------|----------------|
| `/` (Home) | ✅ Complete | Card list, filtering, create dialog, delete |
| `/editor/:id` | ✅ Complete | CodeMirror, tabs (MD/CSS/JS/Media/Config), preview, AI panel, diff review, version commits |
| `/present/:id` | ✅ Complete | Fullscreen 16:9, navigation, keyboard shortcuts |
| `/details/:id` | ✅ Complete | 3-column: markdown viewer + version timeline + conversation log, export buttons |
| `/settings` | ✅ Complete | Sidebar nav, theme editor, plugins, editor prefs |

### API Routes
| Endpoint | Methods |
|----------|---------|
| `/api/presentations` | GET, POST |
| `/api/presentations/:id` | GET, PUT, PATCH, DELETE |
| `/api/presentations/:id/render` | POST |
| `/api/presentations/:id/media` | GET, POST, PATCH, DELETE |
| `/api/presentations/:id/media/:filename` | GET |
| `/api/presentations/:id/history` | GET, POST |
| `/api/presentations/:id/conversation` | GET, PUT |
| `/api/presentations/:id/chat` | POST (SSE streaming) |
| `/api/settings` | GET, PUT |
| `/api/themes` | GET, POST |
| `/api/themes/:id` | GET, PUT, DELETE |

### Rendering plugins
- **Mermaid.js**: `\`\`\`mermaid` code blocks → SVG diagrams (dark theme, proportional)
- **Chart.js**: `\`\`\`chart` JSON blocks → canvas charts (bar, line, pie, etc.)
- **Custom CSS**: scoped to Marp selector specificity via `scopeCustomCss()`
- **Custom JS**: injected as `<script>` block in rendered HTML
- **Image auto-fit**: flexbox CSS fills remaining slide space

### Data storage
```
data/presentations/
  {slug}/
    presentation.md    — Marp markdown
    styles.css         — Custom CSS
    scripts.js         — Custom JS
    metadata.json      — Title, description, author, dates, theme
    history.json       — Version snapshots (id, timestamp, title, content)
    conversation.json  — AI chat messages
    *.png/jpg/svg      — Media files
  themes/
    {name}.css         — Custom Marp themes (with @theme directive)
  settings.json        — App settings (plugins, editor prefs)
```

---

## Remaining Backlog

### Ready to implement
*(none currently — all tasks completed or marked as future)*

### Future (requires user confirmation before starting)
- **ID-058** ? LaTeX/KaTeX notation plugin
- **ID-061** ? Abstract rendering engine (Marp ↔ Reveal.js)
- **ID-083** ? Full-text search across presentation content

---

## Development Workflow Reminders

1. **Always create backlog tasks BEFORE starting work** (increment `docs/tasks/id.txt`)
2. **Commit after EACH task** — includes code, tests, task tracking, devlog
3. **No authorization needed for branch commits** — only ask before merging to main
4. **All work in Docker** — use `./scripts/dev.sh`, `./scripts/build.sh`, `./scripts/test.sh`
5. **Build script recreates container** to avoid stale `.next` volume cache
6. **Design reference**: read `MarpWebManager.pen` via pencil MCP tools only

---

## Environment Variables

```env
APP_PORT=3737
NODE_ENV=development
AI_API_URL=http://localhost:11434/v1
AI_MODEL=gemma4
AI_API_KEY=
AI_SYSTEM_PROMPT=
STORAGE_PATH=/data/presentations
```
