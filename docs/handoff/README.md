# Handoff Documentation

> These files define how we work. They are **tech-stack independent** (except `TECHSTACK.md`) and can be reused across projects.

## Files

| File | Purpose | Scope |
|------|---------|-------|
| [`PROCESS.md`](PROCESS.md) | Development workflow, task lifecycle, branch protocol, quality gates, documentation standards, session protocol | **Universal** — same for any project |
| [`TECHSTACK.md`](TECHSTACK.md) | Technology choices, versions, architecture patterns, environment variables, known constraints | **Project-specific** — changes per project |
| [`CLAUDE-MD-TEMPLATE.md`](CLAUDE-MD-TEMPLATE.md) | Template for creating a new project's `CLAUDE.md` | **Universal** — copy for new projects |
| [`BRANCH-CHECKLIST.md`](BRANCH-CHECKLIST.md) | Pre-merge checklist ensuring branch autonomy | **Universal** — same for any project |

## How to use for a new project

1. Copy `PROCESS.md` as-is — it defines your workflow
2. Copy `BRANCH-CHECKLIST.md` as-is — it ensures branch completeness
3. Copy `CLAUDE-MD-TEMPLATE.md` → rename to `CLAUDE.md` → fill in your project details
4. Create a new `TECHSTACK.md` for your project's specific technology choices
5. Create the standard folder structure:
   ```
   docs/
     handoff/          ← These files
     Adr/              ← Architecture Decision Records
     diagrams/         ← C4 diagrams (LikeC4 format)
     devlog/           ← Daily development logs
     tasks/
       backlog.md      ← Tasks to do
       done-{yyyyMM}.md ← Completed tasks
       id.txt          ← Next sequential task ID
     user/
       README.md       ← User documentation
     troubleshooting.md
   scripts/
     dev.sh            ← Start dev environment
     build.sh          ← Build project
     test.sh           ← Run tests
     commit.sh         ← Build + test + commit (quality gate)
     push.sh           ← Push to remote
   ```

## Key principle

**Every feature branch is disposable.** The conversation that produced it can be completely discarded after merge. All context lives in the project files — never in chat history.
