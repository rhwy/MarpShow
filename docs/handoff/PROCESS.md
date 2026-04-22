# Development Process

> This document defines **how we work** — independent of any tech stack. These rules apply to every project, every feature, every session.

---

## 1. Feature Branch Autonomy

**Every feature branch is self-contained.** When a branch is merged to main, the conversation that produced it can be completely discarded. No magic tricks hidden in chat history.

This means every branch must, at completion:
- ✅ Compile and run (container up, app functional)
- ✅ Pass all tests
- ✅ Have clean, refactored code (no TODOs, no dead code from the branch)
- ✅ Have updated documentation (user docs, architecture docs, ADRs if applicable)
- ✅ Have updated task tracking (backlog cleaned, done file updated, devlog written)
- ✅ Have a meaningful squash-merge commit message summarizing the work

**The CLAUDE.md file is the single source of truth.** It must always reflect the current state of the project so a new session can start cold.

---

## 2. Task Lifecycle

### Creating tasks
- **Always create backlog tasks BEFORE writing code.** Every user request = one or more tasks with sequential IDs.
- Increment `docs/tasks/id.txt` for each new task.
- Format: `- [TYPE : ID-NNN] title` where TYPE is: `feat`, `fix`, `init`, `clean`, `struct`, `test`.
- Tasks should be **small and autonomous** — the app compiles and runs after each one.

### Executing tasks
- Work in **logical/priority order**, not FIFO. Group by dependency.
- One task per commit (many commits per task is OK, but never many tasks in one commit).
- Each commit includes: code + tests + task tracking update.
- No authorization needed for commits during branch work.

### Completing tasks
- Remove from `docs/tasks/backlog.md`.
- Add to `docs/tasks/done-{yyyyMM}.md` in the appropriate day section, most recent on top.
- Update the devlog (`docs/devlog/yyyy-MM-dd.md`).

---

## 3. Branch Workflow

```
main (protected) ← squash merge ← feature/branch-name ← individual commits
```

1. **Create branch** from main: `git checkout -b feat/feature-name`
2. **Create tasks** in backlog with sequential IDs
3. **Implement each task**: code → test → commit → update tracking
4. **At branch end**: verify everything works, update all docs
5. **Merge to main**: squash merge with a summary message — **requires human confirmation**
6. **Push to remote**: `./scripts/push.sh`

### Branch naming
- `feat/` — new features
- `fix/` — bug fixes, UX improvements
- `struct/` — architecture, refactoring
- `init/` — project scaffolding

---

## 4. Quality Gates

### Before each commit
- Code compiles
- All tests pass
- New code has tests (unit, integration, or smoke test at minimum)

### Before merge to main
- App compiles, runs, container is healthy
- All tests pass
- Code is clean (no debug logs, no commented-out code)
- Documentation updated (user docs, architecture if changed)
- ADRs written for significant decisions
- C4 diagrams updated if architecture changed
- Task tracking is clean (backlog updated, done file updated)
- Devlog entry written for the branch work
- CLAUDE.md reflects the current state

### The commit.sh quality gate
The `commit.sh` script enforces: **build → test → commit**. If build or tests fail, the commit is rejected.

---

## 5. Documentation Standards

### User documentation (`docs/user/`)
- **Use-case oriented**, not feature lists
- Each section explains what the user can do and how to do it
- Include concrete examples (code blocks, screenshots)
- Update continuously — every new feature gets documented

### Architecture decisions (`docs/Adr/`)
- One ADR per significant decision
- Format: Status, Date, Context, Alternatives (table), Decision, Consequences
- Never delete ADRs — mark as "Superseded" if replaced

### C4 diagrams (`docs/diagrams/`)
- LikeC4 DSL format (`.c4` files)
- Separate files: `specification.c4`, `model.c4`, `views.c4`
- Validate with `npx likec4 validate`
- Update when architecture changes

### Development log (`docs/devlog/`)
- One file per day: `yyyy-MM-dd.md`
- One section per branch: `## hh:mm - branch-name`
- Purpose statement + exhaustive list of changes (one line per item)
- Most recent section on top

### Troubleshooting (`docs/troubleshooting.md`)
- Document known issues and their fixes
- Add entries when bugs are found and resolved

---

## 6. Code Standards

### Architecture
- **Hexagonal architecture**: domain (entities, ports) → infrastructure (adapters) → UI (components)
- Domain has zero framework dependencies
- Adapters implement port interfaces
- UI components are isolated, testable, props-driven

### Testing
- Every component gets at least a smoke test (renders without crashing)
- Every domain function gets unit tests
- Every adapter gets integration tests
- Every page gets a render test

### Logging
- All events/actions logged via abstracted Logger interface
- `createLogger(context)` factory — never raw `console.log`
- Ready to plug any log receiver later

### Containerization
- ALL work inside Docker — no host dependencies
- All config via environment variables (`.env` → compose → container)
- Scripts abstract Docker commands
- Build script recreates container to avoid stale caches

---

## 7. Session Protocol

### Starting a session
1. Claude reads `CLAUDE.md` automatically
2. Check `docs/tasks/backlog.md` for pending work
3. Check devlog for recent context
4. Ask the user what to work on

### During a session
1. Create tasks before coding
2. Implement → test → commit → track per task
3. Keep CLAUDE.md up to date if architecture changes

### Ending a session
1. Ensure current branch is in a clean state
2. Update devlog with the session's work
3. Update CLAUDE.md if any project-level changes
4. Merge to main if the user confirms
5. **Check session consumption** (see §7.1 below) — note stats in devlog if relevant
6. Run `/clear` in Claude Code to wipe the conversation from context
7. **The conversation can now be discarded** — all context is in the project files

### 7.1 Session consumption & context management

**Viewing stats in Claude Code:**
The status bar at the bottom of the Claude Code terminal shows live context usage:
- **Tokens used / total** — e.g. `47k / 200k`
- **% remaining** — how much headroom is left
- **Cost** — accumulated spend for the session

**When to start a fresh session:**
- Context is above ~70–80% full → start a new session (context compression degrades quality)
- After merging a branch → natural break point, clean slate for next feature
- After a long exploratory session with many tool calls → quality drops as context fills

**How to reset:**
```
/clear
```
Clears the entire conversation history from Claude's context window. Claude Code will re-read `CLAUDE.md` automatically on the next message. All project state lives in files — nothing is lost.

**What `/clear` does NOT do:**
- Does not affect your files, git history, or Docker containers
- Does not reset the cost counter (that's per API key, not per conversation)
- Does not affect other open tabs/sessions

**Recommended devlog entry before clearing:**
```markdown
## 14:30 - feat/my-feature [cleared]
Context: ~85% full after N tasks. Stats: ~180k tokens used.
Branch merged to main. Session ended cleanly.
```

---

## 8. Future Tasks Protocol

Tasks that need user confirmation before starting are marked with `?` in the backlog:
```
- [FEAT : ID-058] ? Add LaTeX/KaTeX support
```

Never start these automatically. Always ask the user first.
