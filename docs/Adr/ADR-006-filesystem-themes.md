# ADR-006: Filesystem-Based Theme System with Marp ThemeSet

## Status
Accepted

## Date
2026-04-13

## Context
Themes need to be real CSS files that work with Marp's `theme:` frontmatter directive. Users should be able to create, edit, and delete custom themes that are immediately usable in presentations.

## Alternatives Considered

| Approach | Pros | Cons |
|----------|------|------|
| **CSS files + Marp themeSet.add() (chosen)** | Real Marp themes, editable, filesystem-based | Must load all themes before each render |
| Inline CSS in settings.json | Simpler storage | Not real Marp themes, no `theme:` directive |
| Database-backed themes | Scalable | Over-engineering, adds DB dependency |

## Decision
Store custom themes as CSS files in `data/presentations/themes/{slug}.css`. Each file must include a `/* @theme name */` directive. The MarpCoreRenderer loads all CSS files from the themes directory and registers them via `marp.themeSet.add()` before each render. Built-in themes (default, gaia, uncover) are always available.

Theme management via API: GET/POST `/api/themes`, GET/PUT/DELETE `/api/themes/:id`. Settings page provides a CodeMirror CSS editor for custom themes.

## Consequences
- Themes are real Marp-compatible CSS — reference via `theme: my-theme` in frontmatter
- Slugified names enforce valid identifiers
- Built-in themes can't be edited or deleted (badged as "built-in")
- All themes loaded per render — acceptable for current scale
