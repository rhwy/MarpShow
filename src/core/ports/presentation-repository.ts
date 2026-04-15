/**
 * PresentationRepository port — contract for presentation persistence.
 *
 * This interface defines how the domain interacts with storage.
 * Implementations live in infrastructure/ (filesystem, database, etc.)
 * The domain layer never depends on a concrete implementation.
 */

import type {
  PresentationId,
  Presentation,
  PresentationSummary,
  PresentationMetadata,
} from "@/core/domain";

export interface PresentationRepository {
  /**
   * List all presentations as summaries (for the Home page).
   * Returns summaries sorted by updatedAt descending.
   */
  list(): Promise<PresentationSummary[]>;

  /**
   * Get a full presentation by ID (for Editor, Presentation, Details pages).
   * Returns null if not found.
   */
  getById(id: PresentationId): Promise<Presentation | null>;

  /**
   * Create a new presentation and persist it.
   * Returns the created presentation.
   */
  create(presentation: Presentation): Promise<Presentation>;

  /**
   * Update an existing presentation's content (markdown, css, js).
   * Returns the updated presentation, or null if not found.
   */
  updateContent(
    id: PresentationId,
    content: { markdown?: string; css?: string; js?: string },
  ): Promise<Presentation | null>;

  /**
   * Update presentation metadata (title, description, theme, plugins).
   * Returns the updated presentation, or null if not found.
   */
  updateMetadata(
    id: PresentationId,
    metadata: Partial<Omit<PresentationMetadata, "id" | "createdAt" | "updatedAt">>,
  ): Promise<Presentation | null>;

  /**
   * Add a version snapshot (manual save point) to a presentation.
   * Returns the updated history array, or null if not found.
   */
  addVersionSnapshot(
    id: PresentationId,
    snapshot: import("@/core/domain").VersionSnapshot,
  ): Promise<import("@/core/domain").VersionSnapshot[] | null>;

  /**
   * Get the version history for a presentation.
   * Returns the history array, or null if not found.
   */
  getHistory(id: PresentationId): Promise<import("@/core/domain").VersionSnapshot[] | null>;

  /**
   * Save conversation messages for a presentation.
   * Replaces the entire conversation array.
   */
  saveConversation(
    id: PresentationId,
    messages: import("@/core/domain").ConversationMessage[],
  ): Promise<boolean>;

  /**
   * Delete a presentation by ID.
   * Returns true if deleted, false if not found.
   */
  delete(id: PresentationId): Promise<boolean>;

  /**
   * Check if a presentation exists.
   */
  exists(id: PresentationId): Promise<boolean>;
}
