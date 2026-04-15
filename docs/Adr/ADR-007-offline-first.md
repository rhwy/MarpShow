# ADR-007: Offline-First Design

## Status
Accepted

## Date
2026-04-13

## Context
The app must work fully offline (e.g., on a plane). This means no external CDN dependencies for fonts, scripts, or assets.

## Decisions Made

1. **Fonts**: Marp's default theme imports fonts from `fonts.bunny.net`. We strip all `@import` and `@charset` directives from rendered CSS and inject local `@font-face` declarations pointing to woff2 files in `public/fonts/` (Lato, Roboto Mono via @fontsource). App fonts (Inter, Geist, Funnel Sans) use `next/font` which downloads at build time.

2. **Rendering plugins**: Mermaid.js (3MB) and Chart.js (204KB) bundles served from `public/`. PptxGenJS bundle (461KB) also in `public/`. All loaded via `<script>` tags — no CDN.

3. **AI assistant**: Works with local Ollama by default (`AI_API_URL=http://localhost:11434/v1`). Falls back gracefully when no AI provider is available.

4. **Storage**: Local filesystem — no remote database or cloud storage needed.

## Consequences
- Total offline bundle is ~3.7MB extra (Mermaid is the bulk)
- All core features work without network: editing, previewing, presenting, exporting
- AI assistance requires a local model (Ollama) or is unavailable offline
- Fonts render correctly offline — no fallback to system fonts
