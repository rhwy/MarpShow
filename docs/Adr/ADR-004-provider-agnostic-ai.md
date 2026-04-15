# ADR-004: Provider-Agnostic AI via OpenAI-Compatible API

## Status
Accepted

## Date
2026-04-12

## Context
The AI assistant needs to work with various providers: local Ollama (gemma4) for offline/privacy, Claude for quality, OpenAI for compatibility. We initially planned to use `@anthropic-ai/sdk` but this would lock us to one provider.

## Alternatives Considered

| Approach | Pros | Cons |
|----------|------|------|
| **OpenAI-compatible API (chosen)** | Works with Ollama, Claude, OpenAI, LM Studio, any provider | No provider-specific features (tool use, vision) |
| Anthropic SDK | Best Claude integration | Locks to one provider |
| Multi-SDK (adapter per provider) | Full feature set per provider | Complex, many deps |
| LangChain | Abstracts providers | Heavy dependency, overkill |

## Decision
Use a generic fetch-based adapter targeting the `/v1/chat/completions` endpoint (OpenAI format). Configuration via environment variables: `AI_API_URL`, `AI_MODEL`, `AI_API_KEY`, `AI_SYSTEM_PROMPT`. Default: local Ollama with gemma4.

## Consequences
- Works offline with Ollama — critical for travel use
- Zero lock-in — switch providers by changing env vars
- No provider-specific features (acceptable for our text-generation use case)
- Streaming via SSE parsing (standard across all providers)
