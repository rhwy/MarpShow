/**
 * Presentation domain model.
 *
 * A presentation is a Marp markdown deck with optional custom CSS/JS,
 * metadata, change history, and AI conversation log.
 */

// === Value Objects ===

export type PresentationId = string;

/**
 * Version snapshot — a manual save point for a presentation.
 * Created explicitly by the user (like a git commit).
 */
export interface VersionSnapshot {
  /** Sequential ID (1, 2, 3...) */
  readonly id: number;
  /** Exact date of the save */
  readonly timestamp: string;
  /** User-provided title summarizing this version */
  readonly title: string;
  /** Full content snapshot */
  readonly content: {
    readonly markdown: string;
    readonly css: string;
    readonly js: string;
  };
}

/**
 * Create a version snapshot from current presentation content.
 */
export function createVersionSnapshot(
  id: number,
  title: string,
  markdown: string,
  css: string,
  js: string,
): VersionSnapshot {
  return {
    id,
    timestamp: new Date().toISOString(),
    title,
    content: { markdown, css, js },
  };
}

export type ConversationRole = "user" | "assistant";

export interface ConversationMessage {
  readonly id: string;
  readonly role: ConversationRole;
  readonly content: string;
  readonly timestamp: string;
}

export interface PresentationMetadata {
  readonly id: PresentationId;
  readonly title: string;
  readonly description: string;
  readonly author: string;
  readonly theme: string;
  readonly plugins: string[];
  readonly createdAt: string;
  readonly updatedAt: string;
}

// === Entities ===

/**
 * Full presentation entity with all content.
 * Used when loading a specific presentation for editing or viewing.
 */
export interface Presentation {
  readonly metadata: PresentationMetadata;
  readonly markdown: string;
  readonly css: string;
  readonly js: string;
  readonly history: VersionSnapshot[];
  readonly conversation: ConversationMessage[];
}

/**
 * Summary of a presentation — used in list views (Home page cards).
 * Does not include full content, only metadata.
 */
export interface PresentationSummary {
  readonly id: PresentationId;
  readonly title: string;
  readonly description: string;
  readonly author: string;
  readonly theme: string;
  readonly updatedAt: string;
  readonly slideCount: number;
}

// === Factory Functions ===

/**
 * Create a new presentation with defaults.
 */
export function createPresentation(
  id: PresentationId,
  title: string,
  description: string = "",
  author: string = "",
): Presentation {
  const now = new Date().toISOString();
  return {
    metadata: {
      id,
      title,
      description,
      author,
      theme: "default",
      plugins: [],
      createdAt: now,
      updatedAt: now,
    },
    markdown: defaultMarkdown(title, description, author),
    css: "",
    js: "",
    history: [],
    conversation: [],
  };
}

/**
 * Default Marp markdown for a new presentation.
 */
function defaultMarkdown(
  title: string,
  description: string,
  author: string,
): string {
  const subtitle = description ? `\n${description}\n` : "";
  const authorLine = author ? `\n*${author}*\n` : "";

  return `---
marp: true
theme: default
paginate: true
---

# ${title}
${subtitle}${authorLine}
---

## Slide 2

Add your content here.
`;
}

/**
 * Count slides in a Marp markdown document.
 * Slides are separated by `---` on its own line (after the frontmatter).
 */
export function countSlides(markdown: string): number {
  // Remove frontmatter (between first --- and second ---)
  const frontmatterEnd = markdown.indexOf("---", markdown.indexOf("---") + 3);
  const content =
    frontmatterEnd >= 0 ? markdown.slice(frontmatterEnd + 3) : markdown;

  // Count slide separators (--- on its own line) + 1 for the first slide
  const separators = content.split(/\n---\s*\n/).length;
  return Math.max(1, separators);
}

/**
 * Build a PresentationSummary from a full Presentation.
 */
export function toSummary(presentation: Presentation): PresentationSummary {
  return {
    id: presentation.metadata.id,
    title: presentation.metadata.title,
    description: presentation.metadata.description,
    author: presentation.metadata.author || "",
    theme: presentation.metadata.theme,
    updatedAt: presentation.metadata.updatedAt,
    slideCount: countSlides(presentation.markdown),
  };
}
