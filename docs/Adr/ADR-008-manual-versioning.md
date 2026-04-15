# ADR-008: Manual Version Snapshots (Not Auto-History)

## Status
Accepted (supersedes initial auto-history design)

## Date
2026-04-13

## Context
Initially, every content save auto-logged a history entry. This captured every keystroke, producing hundreds of entries per session — making the history useless. We needed a more intentional approach.

## Alternatives Considered

| Approach | Pros | Cons |
|----------|------|------|
| Auto-history on every save | No user effort | Unusable volume, no meaningful titles |
| **Manual version snapshots (chosen)** | Intentional, meaningful titles, full content snapshot | Requires user action |
| Timed auto-save (every 5 min) | Balance | Still noisy, no meaningful titles |
| Git-style staging + commit | Familiar to devs | Over-complex for this use case |

## Decision
Version history is now manual. The user explicitly saves a version with a title (like a git commit message) via a form under the preview panel. Each snapshot records:
- Sequential ID (1, 2, 3...)
- Timestamp
- User-provided title
- Full content snapshot (markdown + CSS + JS)

Auto-checkpoints are created only for significant events (e.g., "Properties changed" when metadata is edited).

## Consequences
- History is meaningful and browsable
- Full content snapshots enable future "restore to version" feature
- Fewer, more valuable entries in the Details page timeline
- User must remember to save versions (acceptable trade-off)
