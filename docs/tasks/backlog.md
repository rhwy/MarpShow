# Backlog

## Data Foundation

- [STRUCT : ID-002] Define presentation domain model (entities, value objects, types) in core/domain
- [STRUCT : ID-003] Define storage port interface (PresentationRepository) in core/ports
- [FEAT : ID-004] Implement filesystem storage adapter (read/write/list/delete presentation folders)
- [FEAT : ID-005] Seed sample presentations in data/presentations (3 dummy Marp decks for development)
- [FEAT : ID-006] Create Next.js API routes for presentations CRUD (GET list, GET by id, POST create, PUT update, DELETE)

## Marp Rendering (introduces @marp-team/marp-core)

- [FEAT : ID-007] Create Marp rendering service — port interface + adapter that converts markdown to HTML slides
- [FEAT : ID-008] Create SlideRenderer UI component — renders Marp HTML output in an iframe/container
- [FEAT : ID-009] Create API route to render Marp markdown to HTML (POST /api/presentations/:id/render)

## Presentation Page (first real page, consumes Marp rendering)

- [FEAT : ID-010] Build Presentation page layout — slide area (16:9, centered), dark background
- [FEAT : ID-011] Build floating top control bar — back button, slide counter, fullscreen toggle
- [FEAT : ID-012] Build slide navigation — left/right chevron arrows + keyboard nav (arrows, space, escape)

## Home Page (CRUD consumer)

- [FEAT : ID-013] Build PresentationCard UI component — thumbnail, title, description, date, action icons
- [FEAT : ID-014] Build Home page card grid — fetch presentations from API, 3-column layout, sorted by last modified
- [FEAT : ID-015] Build "New Presentation" flow — button + API call to create, redirect to editor
- [FEAT : ID-016] Build delete presentation flow — confirmation dialog + API call

## Editor Page — Code Editor (introduces CodeMirror 6)

- [FEAT : ID-017] Integrate CodeMirror 6 — basic markdown editor component with dark theme and line numbers
- [FEAT : ID-018] Build editor tab system — Markdown / CSS / JS tabs, each editing the corresponding file
- [FEAT : ID-019] Wire editor to API — load presentation content on mount, save on change (debounced)

## Editor Page — Live Preview (connects CodeMirror to Marp)

- [FEAT : ID-020] Build live preview panel — renders current Marp markdown via rendering service in real-time
- [FEAT : ID-021] Build editor page layout — side-by-side code + preview with resizable split
- [FEAT : ID-022] Add slide counter and navigation dots to preview panel
- [FEAT : ID-023] Add "Present" button in preview that opens Presentation page

## Editor Page — AI Assistant Panel (UI shell, no AI wiring)

- [FEAT : ID-024] Build ChatBubble UI component — user/assistant variants with avatar, content, timestamp
- [FEAT : ID-025] Build AI assistant panel — chat history, text input with send button, collapsible
- [FEAT : ID-026] Wire assistant panel toggle — resize editor/preview layout (1/5 + 2/5 + 2/5 vs 1/2 + 1/2)

## Change History (domain model + storage)

- [STRUCT : ID-027] Define history entry domain model (id, timestamp, title, source type, diff/snapshot)
- [FEAT : ID-028] Implement history tracking in storage adapter — log entries on each save
- [FEAT : ID-029] Create API route for history (GET /api/presentations/:id/history)

## Details Page (read-only consumer of storage + history)

- [FEAT : ID-030] Build markdown source viewer component — line-numbered, read-only, monospace, syntax colored
- [FEAT : ID-031] Build change history timeline component — color-coded entries (purple/pink/grey), timestamps
- [FEAT : ID-032] Build Details page 3-column layout — markdown source + history + conversation log
- [FEAT : ID-033] Build Details action bar — back arrow, title, slide count badge, export button placeholders

## AI Integration (introduces @anthropic-ai/sdk)

- [STRUCT : ID-034] Define AI assistant port interface (sendMessage, streamResponse) in core/ports
- [FEAT : ID-035] Implement Claude API adapter — streaming responses, system prompt for Marp editing
- [FEAT : ID-036] Create API route for AI chat (POST /api/presentations/:id/chat) with streaming
- [FEAT : ID-037] Wire AI assistant panel to API — send user messages, stream responses, display in chat
- [FEAT : ID-038] Implement AI-to-editor bridge — apply AI-generated markdown changes directly to CodeMirror

## Conversation Persistence

- [FEAT : ID-039] Implement conversation storage in filesystem adapter (conversation.json per presentation)
- [FEAT : ID-040] Wire conversation log in Details page — display persisted AI chat history

## Configuration Page

- [FEAT : ID-041] Build settings sidebar navigation — Themes, Plugins, Editor, Export, About sections
- [FEAT : ID-042] Build theme gallery — grid of preview cards, active theme highlighted, theme switching
- [FEAT : ID-043] Build plugin toggle cards — KaTeX, Mermaid, Code Syntax Highlighting, Speaker Notes
- [FEAT : ID-044] Build editor preferences form — font size, tab size, auto-save toggle, line numbers toggle
- [FEAT : ID-045] Persist configuration — store settings in filesystem, load on app start

## Export

- [FEAT : ID-046] Implement Marp markdown export (download raw .md file)
- [FEAT : ID-047] Implement PDF export via Marp CLI or browser rendering
- [FEAT : ID-048] Implement PPTX export
- [FEAT : ID-049] Wire export buttons in Details page action bar
