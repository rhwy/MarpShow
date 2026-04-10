// MarkShow — C4 Architecture Views
// Compatible with LikeC4 / Structurizr DSL

views {

  // === System Context View ===
  view systemContext of markshow {
    title "MarkShow — System Context"
    description "High-level view showing MarkShow and its external dependencies"

    include *
    autoLayout
  }

  // === Container View ===
  view container of markshow {
    title "MarkShow — Container View"
    description "Internal containers: web application and file storage"

    include *
    autoLayout
  }

  // === Component View ===
  view component of markshow.webapp {
    title "MarkShow — Web Application Components"
    description "Hexagonal architecture: UI → Core → Infrastructure"

    include *
    autoLayout
  }

}
