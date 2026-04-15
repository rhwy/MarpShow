# ADR-005: AI Diff Review with CodeMirror Merge View

## Status
Accepted

## Date
2026-04-12

## Context
When the AI generates or modifies slide content, we need a way for the user to review changes before they're applied. Silently replacing the editor content is poor UX.

## Alternatives Considered

| Approach | Pros | Cons |
|----------|------|------|
| **@codemirror/merge UnifiedMergeView (chosen)** | Built-in per-chunk accept/reject, inline diff, lightweight | Adds dependency |
| Custom diff component | Full control | Must implement diff algorithm + UI |
| Proposal panel (side-by-side) | Simple | No per-chunk granularity |
| Silent replacement | Simplest | Terrible UX, no review |

## Decision
Use `@codemirror/merge` UnifiedMergeView. When AI returns a markdown code block, the editor enters diff mode showing inline insertions (green) and deletions (red) with per-chunk Accept/Reject buttons. Global "Accept All" / "Reject All" / "Done" buttons above the editor.

## Consequences
- Users review each change individually (like VS Code inline diff)
- AI can propose large changes safely
- Small dependency (~30KB) but purpose-built for the task
- Diff mode blocks other tabs until resolved (intentional)
