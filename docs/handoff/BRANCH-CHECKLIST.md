# Branch Completion Checklist

> Run through this checklist before asking for merge to main. Every item must be ✅.

## Code Quality

- [ ] App compiles without errors
- [ ] All tests pass (`./scripts/test.sh`)
- [ ] Build succeeds (`./scripts/build.sh`)
- [ ] Container starts and is healthy (`./scripts/dev.sh`)
- [ ] No dead code, debug logs, or commented-out code from this branch
- [ ] No `TODO`/`FIXME` introduced without a backlog task

## Tests

- [ ] New code has tests (unit, integration, or smoke)
- [ ] Every new page has at least a smoke test (renders without crashing)
- [ ] Every new component has at least a render test
- [ ] Every new domain function has unit tests
- [ ] Every new API route is tested (at least via component tests that call it)

## Documentation

- [ ] User docs updated in `docs/user/README.md` for new features
- [ ] ADR written for significant architectural decisions (`docs/Adr/`)
- [ ] C4 diagrams updated if architecture changed (`docs/diagrams/`)
- [ ] Troubleshooting doc updated if new known issues found

## Task Tracking

- [ ] All completed tasks removed from `docs/tasks/backlog.md`
- [ ] All completed tasks added to `docs/tasks/done-{yyyyMM}.md`
- [ ] `docs/tasks/id.txt` reflects the next available ID
- [ ] Devlog entry written in `docs/devlog/yyyy-MM-dd.md`

## Project Files

- [ ] `CLAUDE.md` updated if architecture, routes, or major features changed
- [ ] `.env.example` updated if new environment variables added
- [ ] Scripts updated if new recurring commands needed

## Branch Hygiene

- [ ] Meaningful commit messages with task IDs (e.g., `feat(ID-042): ...`)
- [ ] One task per commit (not multiple tasks in one commit)
- [ ] Branch ready for squash merge with a summary message

---

## Merge Command

```bash
git checkout main
git merge --squash feat/branch-name
git commit -m "Summary of the branch work

- Task 1 description
- Task 2 description
...

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
git push -u origin main
```

## After Merge — Session Cleanup

```bash
# In Claude Code terminal:
/clear
```

Before clearing, note context stats from the status bar in the devlog:
```markdown
## hh:mm - feat/branch-name [merged + cleared]
Tokens used: ~XXk / 200k (~XX% consumed). Session duration: ~Xh.
```

After `/clear`, Claude re-reads `CLAUDE.md` automatically. The next session starts cold with full context headroom.
