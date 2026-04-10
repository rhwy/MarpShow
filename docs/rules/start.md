
# MarkShow — Requirements

## 1. Product Vision

MarkShow is a **markdown-first presentation editor** where users write slides in [[Marp]] format and an **AI assistant collaborates in real-time** — helping generate content, structure, and syntax while the user fine-tunes presentation and layout.

**Design principles:**
- Dark-themed, modern, streamlined
- Maximize workspace — minimal chrome, icons over labels where possible
- AI is a co-author, not a chatbot — it edits the markdown directly

---

## 2. Pages & Navigation

The app has 5 pages, linked via a persistent top bar.

### 2.1 Top Bar (shared)
- Height: 48px, dark background, subtle bottom border
- Left: "MarkShow" logo (Inter bold)
- Right: icon-only navigation links (Home, Editor, Details, Settings) — active page highlighted

### 2.2 Home Page (`/`)
- **Purpose:** Browse, create, and manage presentations
- **"+ New Presentation" button** at the top, full-width, prominent accent gradient
- **Card grid** (3 columns):
  - Each card is **landscape, compact height** (~193px)
  - Left ~40%: thumbnail/snapshot of the first slide
  - Right ~60%: title, short description, date
  - Action icons per card: **edit**, **delete**, **present**, **open details**
- Cards sorted by last modified (most recent first)

### 2.3 Editor Page (`/editor/:id`)
- **Purpose:** Write and preview slides with AI assistance
- **Layout:** side-by-side, code on the left, live preview on the right
- **AI Assistant panel** (retractable, left side):
  - Toggled via an "Assistant" icon button
  - When open: Assistant 1/5, Code 2/5, Preview 2/5
  - When hidden: Code 1/2, Preview 1/2
  - Contains: chat history (alternating AI/user bubbles), text input with send button
- **Code Editor:**
  - 3 tabs: **Markdown** (default), **CSS**, **JS** — allowing custom styles and scripts per presentation
  - Monospace font, line numbers, syntax highlighting
  - Frontmatter and headings visually distinct (accent colours)
- **Live Preview:**
  - Renders the current Marp markdown in real-time
  - Shows slide counter and navigation dots
  - Has a **"Present" button** that opens the Presentation page

### 2.4 Presentation Page (`/present/:id`)
- **Purpose:** Fullscreen slide display for presenting
- Slide fills the viewport (16:9 aspect ratio, centred, ~90% width)
- **Floating top control bar** (semi-transparent, blurred): back button, slide counter (`1 / 12`), fullscreen toggle, grid view, settings
- **Navigation:** left/right chevron arrows on slide sides (semi-transparent circular buttons)
- Keyboard navigation: arrow keys, space, escape to exit

### 2.5 Details Page (`/details/:id`)
- **Purpose:** Review presentation content, history, and AI interactions
- **Action bar** at top: back arrow, presentation title, slide count badge, export buttons (**PDF**, **PPTX**, **Markdown**)
- **3-column layout:**
  - **Left — Markdown source:** line-numbered raw Marp markdown (read-only)
  - **Centre — Change history:** timeline with colour-coded entries (purple = AI-assisted, pink = AI-generated, grey = manual edit), each with title + timestamp + source label
  - **Right — AI conversation log:** chat bubbles with avatars, message content, timestamps

### 2.6 Configuration Page (`/settings`)
- **Purpose:** Manage themes, plugins, and editor preferences
- **Sidebar nav** (left): categories — Themes, Plugins, Editor, Export, About
- **Themes section:** grid of theme preview cards (3 cols). Each card: colour preview, name, description. Active theme has accent border.
- **Plugins section:** horizontal cards with icon, name, description, on/off toggle. Initial plugins: Math (KaTeX), Mermaid Diagrams, Code Syntax Highlighting, Speaker Notes.
- **Editor preferences:** font size, tab size, auto-save toggle, line numbers toggle

---

## 3. Core Features

### 3.1 Markdown Editing
- FR-01: User can create, edit, and delete presentations
- FR-02: Code editor supports Marp markdown syntax with live preview
- FR-03: Editor provides separate tabs for custom CSS and JS per presentation
- FR-04: Changes in the editor are reflected in the preview in real-time

### 3.2 AI Assistant
- FR-05: AI assistant panel is accessible from the editor page
- FR-06: User can describe what they want in natural language; the AI generates or modifies the Marp markdown
- FR-07: AI suggestions are applied directly to the code editor (not just shown in chat)
- FR-08: Conversation history is persisted per presentation and visible in the Details page

### 3.3 Presentation
- FR-09: User can present slides fullscreen with keyboard and mouse navigation
- FR-10: Slide rendering uses Marp Core for accurate output

### 3.4 Export
- FR-11: Export presentation to PDF
- FR-12: Export presentation to PPTX
- FR-13: Export raw Marp markdown

### 3.5 History & Tracking
- FR-14: Each edit (manual or AI-generated) is logged in the change history
- FR-15: History entries are colour-coded by source (manual / AI-assisted / AI-generated)

### 3.6 Configuration
- FR-16: User can switch between presentation themes
- FR-17: User can enable/disable plugins (KaTeX, Mermaid, syntax highlighting, speaker notes)
- FR-18: User can configure editor preferences (font size, tab size, auto-save, line numbers)

---

## 4. Design Tokens

Please use the 260409_MarpWebManager.pen that contains all the details of the design and screens of this application.

```css
:root {
  /* Surfaces */
  --surface-primary: #0A0A0A;
  --surface-card: #141414;
  --surface-elevated: #1A1A1A;
  --surface-hover: #252525;
  --surface-inverse: #FFFFFF;

  /* Foreground */
  --fg-primary: #FFFFFF;
  --fg-secondary: #A1A1AA;
  --fg-muted: #71717A;
  --fg-inverse: #0A0A0A;

  /* Accents */
  --accent-primary: #A855F7;    /* purple */
  --accent-secondary: #EC4899;  /* pink */
  --accent-glow: rgba(168, 85, 247, 0.2);

  /* Borders & Radii */
  --border-subtle: #1A1A1A;
  --rounded-lg: 8px;
  --rounded-xl: 12px;
  --rounded-3xl: 24px;
  --rounded-full: 9999px;
}
```

**Typography:**

| Role | Font | Usage |
|---|---|---|
| Headings | Inter | Titles, logo, page headers |
| Body | Geist | Descriptions, labels, buttons |
| Captions | Funnel Sans | Dates, metadata, secondary info |
| Code/Data | Geist Mono | Editor, slide counter, markdown source |

**Visual style:** Deep Space Neon palette, basic roundness, sharp depth elevation.

---

## 5. Tech Stack

The  app should run in docker compose from the beginning as a structural base for the whole work, the storage folder should be a mounted folder from the host. Every decision and design choice must be taken with this constraint in mind, including the whole development flow with hot reload. 

| Layer | Choice | Rationale |
|---|---|---|
| Framework | Next.js (App Router) + TypeScript | SSR, file-based routing, React ecosystem |
| Styling | Tailwind CSS v4 | Utility-first, fast iteration, matches design tokens |
| Code editor | CodeMirror 6 | Extensible, supports markdown/CSS/JS, lightweight |
| Slide rendering | Marp Core (`@marp-team/marp-core`) | Standard Marp output, CSS theme support |
| AI | Claude API (`@anthropic-ai/sdk`) | Conversational assistant for content generation |
| Icons | Lucide React | Consistent, lightweight icon set |
| Storage | Local filesystem | Start simple, migrate later |

---

## 6. Implementation Phases

### Phase 1 — Scaffold & Static UI
- Project setup: Next.js + Tailwind + fonts + design tokens
- Shared top bar component and route structure
- Home page with static card grid (dummy data)

### Phase 2 — Editor Core
- CodeMirror integration with markdown/CSS/JS tabs
- Marp live preview (render markdown → HTML in real-time)
- Collapsible AI assistant panel (UI only, no AI yet)

### Phase 3 — AI Integration
- Claude API wiring for the assistant panel
- AI generates/modifies Marp markdown from natural language prompts
- Conversation persistence per presentation

### Phase 4 — Presentation & Details
- Fullscreen presenter with navigation controls
- Details page: markdown viewer, change history timeline, conversation log

### Phase 5 — Configuration & Export
- Theme gallery with preview cards
- Plugin toggles
- Editor preferences
- PDF/PPTX/Markdown export

### Phase 6 — Data Persistence
- Save/load presentations. Persistence should be made in the file system, one folder per presentation from a root folder. 
- Change history storage
- Auto-save

## 7. Development principles

### rule 1 - quality and testability
Unit tests, use cases tests, integration tests must be created along with all the code created and the tests must be ran frequently, at least before each commit

User documentation must be maintained continuously, each new feature must be transcribed in the documentation in docs/user. This documentation must not be tech oriented or pile of features but use case oriented, the user must be able to see not only one the app could do but have a clear explanation of how it works and what he should do for each use case. 

### rule 2 - architecture design
The project must use an hexagonal architecture with clean code principles, ensuring a clear separation of concerns, a good level and coverage of contracts and abstractions and a full testability of all parts. 

All the important decisions must be made with alternatives in mind, pros & cons and then registred in ADR files within a docs/Adr  folder.

The design of the application must registered and continuously updated with C4 compatible diagram files in docs/diagrams. The preferred model is diagram as code, using the C4 dsl language to define the architecture with clear separation between the entities, the model and the views (in separate files and composable files that could generate documentation using LikeC4 tool).

### rule 3 - components
The UI components must be always designed with componentization and isolation principles, they should work not only in isolation but also be testable, they must be cohesive, carry all the needed logic relying only on the provided parameters and internal configuration. 

### rule 4 - containerization
All the work and run, including build and tests must be done inside the docker containers and not depend on anything on the developer computer. the run in docker must be done in background mode, ensuring we always have a runnable version. 

All the parameters must be passed dynamically to the app via environment variables in the compose file that are in turn alimented by a local .env file, including all the ports, paths, ai services configuration (url, models, keys).

### rule 5 - scripting automation
Every development recurring action must be define in a script so that a new developer or agent don't need to remind or know specific commands, a developer should only need to run one script command for each basic task : dev, run, build, test, commit, push. The commit.sh script must prepare the commit message, build the project, run the tests and only then commit the code to ensure we always commit quality code. 

### rule 6 - versioning
Package work in batches within dedicated branches, commits can be made autonomously (if tests pass) but the merge to the main branch after a batch must always be confirmed by a human. 

You must maintain a development log in a folder docs/devlog. this folder contains a markdown file named yyyy-MM-dd.md for each different day of work and the work of each batch must be documented in a dedicated section (h2) with a time and title of the name of the branch (pattern : "## hh:mm - title"), explaining the purpose of the work, then an exhaustive and exact list of the changes in a synthesized way (list with one line per item), organized in the file with the most recent section on top.

### rule 7 - log and trace
The design of the code must be thinked with auditability in mind and logs and traces must be included in the implementation, at least having console logs of the different events and actions on the app. This should be abstracted so that we can plug any log receiver later. 


### rule 8 - DoD

The work is done when:
- the app compile and runs, the container is up and running, and the tests passed
- the code is commited and dev log written
- the documentation is updated as needed. 
- a review of the architecture is done to ensure we don't accumulate technical debt.
- tasks are updated
- a user review is done before merge. 

### rule 9 - tasks

In docs/tasks, we should maintain different files to track our activity:
- backlog.md : this contain a list of items to be done
- done-{yyyyMM}.md : these files (one per month) contain the list of items done in anté-chronological order, keeping then organized by one section per day ("## day").
- Each item (in backlog or done files) must be one line in the bullet point list of the day starting with the nature ("feat", "fix", "init", "clean", "struct", "test") between "[]", followed by a sequential id, then the title of the item. an example could be " - [FEAT : ID-123] create the layout of the configuration page".
- the unique id is maintained in the file docs/tasks/id.txt containing only one integer that is incremented for each task. This increment is done each time a new item is added to the backlog
- during the development you can have many commits for one item but you can't never have many items in only one commit. 
- when a development is done, the line of item is removed from backlog and added to the right done file in the right section on the top. 