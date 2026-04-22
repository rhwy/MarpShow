# The Cost of Uncleared Context

> A quantitative analysis of how accumulated conversation context affects both API cost and model quality in long Claude Code development sessions — and why clearing between feature branches is the right habit.

---

## The question

When you work with Claude Code across multiple feature branches without clearing the conversation, the context window grows. Every message you send includes not just the current exchange but the entire history of what came before. Thanks to Anthropic's prompt caching, previous turns are served at a 90% discount — but they are not free. And there is a hard ceiling: the model's context window.

This raises a practical question: **how much does accumulated context actually cost, and when does it become a problem?**

---

## How context accumulates

Every API call Claude Code makes sends the full conversation history as input. A typical development turn looks like this:

| Component | Tokens |
|-----------|--------|
| User message | ~100 |
| Claude response | ~800 |
| Tool calls + results (file reads, edits, bash) | ~1,000 |
| **Total added to context per turn** | **~1,900** |

At the start of a session, only the project's `CLAUDE.md` and auto-read docs are in context (~6,500 tokens). After 30 turns of a typical feature, the accumulated context is ~63,500 tokens. After a second feature without clearing: ~120,500. After a third: ~177,500 — which is **89% of a 200k context window**.

| Milestone | Context size | % of 200k window |
|-----------|-------------|------------------|
| Session start (CLAUDE.md only) | 6,500 | 3% |
| End of Feature 1 | 63,500 | 32% |
| End of Feature 2 — no clear | 120,500 | 60% |
| End of Feature 3 — no clear | 177,500 | **89% ⚠️** |

A fourth feature would hit the ceiling partway through. Clearing is not optional for sustained work — it is the only way to keep going.

---

## The simulation

### Parameters

| Parameter | Value |
|-----------|-------|
| Model | Claude Sonnet 3.5 |
| System context (CLAUDE.md + docs) | 6,500 tokens |
| Turns per feature | 30 |
| Context added per turn | 1,900 tokens |
| Output tokens per turn | 800 tokens |
| Features modelled | 3 |

### Pricing

| Token type | $/1M tokens |
|-----------|------------|
| Input — uncached | $3.00 |
| Cache write | $3.75 |
| Cache read | $0.30 |
| Output | $15.00 |

The key mechanic: the accumulated history from previous features sits in Anthropic's prompt cache. Every turn of Feature 2 *cache-reads* all of Feature 1's conversation — at $0.30/M, not zero.

---

## Strategy A — Never clear (3 features back-to-back)

Each feature's cache read cost is dominated by the accumulated history it inherits.

**Feature 1** — starts at 6,500 tokens:
```
Cache reads per turn N: 6,500 + (N−1) × 1,900
Sum over 30 turns: 1,021,500 tokens
```

**Feature 2** — starts at 63,500 tokens (all of Feature 1 in cache):
```
Cache reads per turn N: 63,500 + (N−1) × 1,900
Sum over 30 turns: 2,731,500 tokens
```

**Feature 3** — starts at 120,500 tokens:
```
Cache reads per turn N: 120,500 + (N−1) × 1,900
Sum over 30 turns: 4,441,500 tokens
```

| Cost component | Total tokens | Cost |
|---------------|-------------|------|
| Cache reads | 8,194,500 | $2.46 |
| Cache writes | 171,000 | $0.64 |
| Uncached input | 9,000 | $0.03 |
| Output | 72,000 | $1.08 |
| **Total** | | **$4.21** |

---

## Strategy B — `/clear` after each feature

Each feature starts fresh at 6,500 tokens. All three features look identical to Feature 1.

| Cost component | Total tokens | Cost |
|---------------|-------------|------|
| Cache reads | 3,064,500 | $0.92 |
| Cache writes | 171,000 | $0.64 |
| Uncached input | 9,000 | $0.03 |
| Output | 72,000 | $1.08 |
| **Total** | | **$2.67** |

---

## The comparison

| | No clear | Clear per feature | Saved |
|--|----------|------------------|-------|
| Cache reads | $2.46 | $0.92 | $1.54 |
| Cache writes | $0.64 | $0.64 | — |
| Uncached input | $0.03 | $0.03 | — |
| Output | $1.08 | $1.08 | — |
| **Total** | **$4.21** | **$2.67** | **$1.54 (37%)** |

The $1.54 difference is pure waste: paying to re-read Feature 1's conversation throughout every turn of Feature 2, and Features 1+2 throughout every turn of Feature 3. None of that accumulated history contributes to the current task.

The cost of re-loading `CLAUDE.md` after a `/clear` — a cache write of 6,500 tokens ($0.024) — is recovered in roughly two turns of avoided accumulated-context reads.

---

## What the numbers reveal

### 1. Output tokens dominate

At $15.00/M, output is five times more expensive than uncached input and fifty times more expensive than cache reads. In both strategies, output accounts for ~40% of total spend. **Response length has more impact on cost than context hygiene.** Keeping Claude concise saves more than anything else.

### 2. Cache is cheap, not free

Cache reads at $0.30/M are a 90% discount versus uncached input — an enormous saving. But at scale (millions of tokens per session), that 10¢-per-million adds up. An 80%-full context window means paying for 160,000 cached tokens on *every single turn*, most of which is irrelevant conversation from previous features.

### 3. The hard limit is the real constraint

Cost is secondary. A 200k-token context window with 30 turns per feature gives you exactly three features before you physically cannot proceed. Clearing is the only way to sustain work over multiple sessions. This is a hard engineering constraint, not a preference.

### 4. Quality degrades before the limit

Model attention is not uniform across the context window. Research and practical experience consistently show that reasoning quality degrades when context is very full — the model gives less weight to instructions buried early in a long history. **The symptom is subtle drift**: Claude starts forgetting constraints, repeating itself, or losing track of architectural rules stated in `CLAUDE.md`. This is harder to measure than cost but arguably more damaging to output quality.

---

## Practical recommendations

### When to clear

| Condition | Action |
|-----------|--------|
| Feature branch merged to main | Always `/clear` |
| Context > 70% full | `/clear` immediately — don't start the next task |
| Session > ~50 turns | Check context %; clear if above 60% |
| Long exploratory session with many file reads | Clear before implementing anything |

### Before clearing — record the session

Write a devlog entry with stats from the Claude Code status bar before running `/clear`:

```markdown
## 14:30 - feat/ai-diff-review [merged + cleared]
Tokens used: ~180k / 200k (~90% consumed). Session ~3h.
Branch merged to main. All tests green. Context cleared.
```

This captures the only information that won't survive the clear.

### After clearing

Claude Code re-reads `CLAUDE.md` automatically on the next message. No manual reload needed. The new session starts with full context headroom and the project state intact — because **all context lives in the project files, never in the conversation**.

---

## The fundamental principle

> A conversation is scaffolding. When the work is done and committed, the scaffolding comes down.

Prompt caching makes long sessions economically viable. But it does not make them costless or quality-neutral. The discipline of clearing after each branch serves three goals at once: it reduces API spend, preserves model quality, and forces the good habit of keeping project state in files rather than conversation history.

The 37% cost saving across three features is real. The quality preservation is real. The hard context ceiling is a fact. `/clear` after every merge is not housekeeping — it is part of the workflow.
