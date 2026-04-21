# CLAUDE.md Template

> Copy this template when starting a new project. Fill in the sections. This file is auto-read by Claude Code at session start — it is the **single source of truth** for how to work on this project.

---

```markdown
# {Project Name} — Project Context

## What is this project?

{One paragraph describing the product, its purpose, and key design principles.}

---

## Tech Stack

| Layer | Choice | Notes |
|---|---|---|
| Framework | ... | ... |
| Styling | ... | ... |
| Test framework | ... | ... |
| Package manager | ... | ... |
| Runtime | ... | ... |

---

## Architecture

{Describe the architectural pattern and folder structure.}

```
src/
  {folder structure with descriptions}
```

**Key principle:** {The most important architectural constraint.}

---

## Containerization

{Docker setup: compose targets, volumes, ports, env vars.}

---

## Scripts

| Command | What it does |
|---|---|
| `./scripts/dev.sh` | ... |
| `./scripts/build.sh` | ... |
| `./scripts/test.sh` | ... |
| `./scripts/commit.sh "msg"` | Build → test → commit |
| `./scripts/push.sh` | Push current branch |

---

## Development Rules

> Full process defined in `docs/handoff/PROCESS.md`

Key reminders:
- Always create backlog tasks BEFORE coding
- Commit after EACH task (code + tests + docs + tracking)
- No auth needed for branch commits — only for merge to main
- Every branch must be self-contained (see PROCESS.md §1)

---

## Design Tokens

{If applicable — CSS variables, Tailwind theme, color system.}

---

## Pages & Routes

| Route | Page | Purpose |
|---|---|---|
| `/` | ... | ... |

---

## Data Storage

{How and where data is stored.}

---

## Existing ADRs

{List of architecture decision records.}
```
