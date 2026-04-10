// MarkShow — C4 Architecture Model
// Compatible with LikeC4 / Structurizr DSL

model {

  // === Actors ===
  user = person "Presenter" {
    description "A user who creates and presents markdown-based slide decks"
  }

  // === External Systems ===
  claudeApi = softwareSystem "Claude API" {
    description "Anthropic Claude API for AI-assisted content generation"
    technology "REST API"
    tag external
  }

  // === MarkShow System ===
  markshow = softwareSystem "MarkShow" {
    description "Markdown-first presentation editor with AI co-author"

    // --- Containers ---
    webapp = container "Web Application" {
      description "Next.js application serving the UI and API routes"
      technology "Next.js 15, TypeScript, React 19"

      // -- Components --
      ui = component "UI Layer" {
        description "React components: TopBar, pages, editor, preview"
        technology "React, Tailwind CSS v4, Lucide"
      }

      core = component "Core Domain" {
        description "Domain entities, ports, and use cases"
        technology "TypeScript"
      }

      infra = component "Infrastructure" {
        description "Adapters: logging, storage, AI client"
        technology "TypeScript"
      }
    }

    storage = container "File Storage" {
      description "Local filesystem storing presentations as folders"
      technology "Filesystem (Docker volume)"
      tag storage
    }
  }

  // === Relationships ===
  user -> markshow.webapp "Uses" "HTTPS"
  markshow.webapp.ui -> markshow.webapp.core "Calls use cases"
  markshow.webapp.core -> markshow.webapp.infra "Via port interfaces"
  markshow.webapp.infra -> markshow.storage "Reads/writes presentations"
  markshow.webapp.infra -> claudeApi "Sends prompts, receives content" "HTTPS"

}
