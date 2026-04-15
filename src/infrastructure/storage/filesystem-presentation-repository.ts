/**
 * Filesystem adapter for PresentationRepository port.
 *
 * Stores presentations as folders:
 *   {basePath}/{id}/
 *     presentation.md    — Marp markdown
 *     styles.css         — Custom CSS
 *     scripts.js         — Custom JS
 *     metadata.json      — Title, description, dates, theme, plugins
 *     history.json       — Change history entries
 *     conversation.json  — AI chat history
 */

import { promises as fs } from "fs";
import path from "path";
import type { PresentationRepository } from "@/core/ports";
import {
  countSlides,
} from "@/core/domain";
import type {
  PresentationId,
  Presentation,
  PresentationSummary,
  PresentationMetadata,
  VersionSnapshot,
  ConversationMessage,
} from "@/core/domain";
import { createLogger } from "@/infrastructure/logging";

const logger = createLogger("FilesystemStorage");

export class FilesystemPresentationRepository
  implements PresentationRepository
{
  constructor(private readonly basePath: string) {}

  async list(): Promise<PresentationSummary[]> {
    logger.info("Listing presentations", { basePath: this.basePath });
    try {
      const entries = await fs.readdir(this.basePath, { withFileTypes: true });
      const dirs = entries.filter((e) => e.isDirectory());

      const summaries: PresentationSummary[] = [];

      for (const dir of dirs) {
        try {
          const presentation = await this.getById(dir.name);
          if (presentation) {
            summaries.push({
              id: presentation.metadata.id,
              title: presentation.metadata.title,
              description: presentation.metadata.description,
              author: presentation.metadata.author || "",
              theme: presentation.metadata.theme,
              updatedAt: presentation.metadata.updatedAt,
              slideCount: countSlides(presentation.markdown),
            });
          }
        } catch (err) {
          logger.warn(`Skipping invalid presentation folder: ${dir.name}`, err);
        }
      }

      // Sort by updatedAt descending (most recent first)
      summaries.sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
      );

      logger.info(`Found ${summaries.length} presentations`);
      return summaries;
    } catch (err) {
      logger.error("Failed to list presentations", err);
      return [];
    }
  }

  async getById(id: PresentationId): Promise<Presentation | null> {
    logger.debug("Getting presentation", { id });
    const dir = this.presentationDir(id);

    if (!(await this.dirExists(dir))) {
      logger.debug("Presentation not found", { id });
      return null;
    }

    try {
      const [markdown, css, js, metadata, history, conversation] =
        await Promise.all([
          this.readFileOrDefault(path.join(dir, "presentation.md"), ""),
          this.readFileOrDefault(path.join(dir, "styles.css"), ""),
          this.readFileOrDefault(path.join(dir, "scripts.js"), ""),
          this.readJson<PresentationMetadata>(path.join(dir, "metadata.json")),
          this.readJson<VersionSnapshot[]>(path.join(dir, "history.json")),
          this.readJson<ConversationMessage[]>(
            path.join(dir, "conversation.json"),
          ),
        ]);

      if (!metadata) {
        logger.warn("No metadata.json found for presentation", { id });
        return null;
      }

      return {
        metadata,
        markdown,
        css,
        js,
        history: history ?? [],
        conversation: conversation ?? [],
      };
    } catch (err) {
      logger.error("Failed to read presentation", { id, err });
      return null;
    }
  }

  async create(presentation: Presentation): Promise<Presentation> {
    const id = presentation.metadata.id;
    logger.info("Creating presentation", { id });

    const dir = this.presentationDir(id);
    await fs.mkdir(dir, { recursive: true });
    await this.writePresentation(dir, presentation);

    logger.info("Presentation created", { id });
    return presentation;
  }

  async updateContent(
    id: PresentationId,
    content: { markdown?: string; css?: string; js?: string },
  ): Promise<Presentation | null> {
    logger.info("Updating presentation content", { id });

    const existing = await this.getById(id);
    if (!existing) return null;

    const now = new Date().toISOString();

    const updated: Presentation = {
      ...existing,
      markdown: content.markdown ?? existing.markdown,
      css: content.css ?? existing.css,
      js: content.js ?? existing.js,
      metadata: {
        ...existing.metadata,
        updatedAt: now,
      },
    };

    const dir = this.presentationDir(id);
    await this.writePresentation(dir, updated);

    logger.info("Presentation content updated", { id });
    return updated;
  }

  async updateMetadata(
    id: PresentationId,
    metadata: Partial<
      Omit<PresentationMetadata, "id" | "createdAt" | "updatedAt">
    >,
  ): Promise<Presentation | null> {
    logger.info("Updating presentation metadata", { id });

    const existing = await this.getById(id);
    if (!existing) return null;

    const now = new Date().toISOString();
    const updated: Presentation = {
      ...existing,
      metadata: {
        ...existing.metadata,
        ...metadata,
        updatedAt: now,
      },
    };

    const dir = this.presentationDir(id);
    await this.writePresentation(dir, updated);

    logger.info("Presentation metadata updated", { id });
    return updated;
  }

  async addVersionSnapshot(
    id: PresentationId,
    snapshot: VersionSnapshot,
  ): Promise<VersionSnapshot[] | null> {
    logger.info("Adding version snapshot", { id, title: snapshot.title });

    const existing = await this.getById(id);
    if (!existing) return null;

    const updatedHistory = [...existing.history, snapshot];
    const dir = this.presentationDir(id);
    await fs.writeFile(
      path.join(dir, "history.json"),
      JSON.stringify(updatedHistory, null, 2),
      "utf-8",
    );

    logger.info("Version snapshot saved", { id, versionId: snapshot.id });
    return updatedHistory;
  }

  async getHistory(id: PresentationId): Promise<VersionSnapshot[] | null> {
    logger.debug("Getting history", { id });
    const dir = this.presentationDir(id);

    if (!(await this.dirExists(dir))) return null;

    const history = await this.readJson<VersionSnapshot[]>(
      path.join(dir, "history.json"),
    );
    return history ?? [];
  }

  async saveConversation(
    id: PresentationId,
    messages: ConversationMessage[],
  ): Promise<boolean> {
    logger.info("Saving conversation", { id, messageCount: messages.length });
    const dir = this.presentationDir(id);

    if (!(await this.dirExists(dir))) return false;

    await fs.writeFile(
      path.join(dir, "conversation.json"),
      JSON.stringify(messages, null, 2),
      "utf-8",
    );
    return true;
  }

  async delete(id: PresentationId): Promise<boolean> {
    logger.info("Deleting presentation", { id });
    const dir = this.presentationDir(id);

    if (!(await this.dirExists(dir))) {
      logger.warn("Presentation not found for deletion", { id });
      return false;
    }

    await fs.rm(dir, { recursive: true, force: true });
    logger.info("Presentation deleted", { id });
    return true;
  }

  async exists(id: PresentationId): Promise<boolean> {
    return this.dirExists(this.presentationDir(id));
  }

  // === Private Helpers ===

  private presentationDir(id: PresentationId): string {
    return path.join(this.basePath, id);
  }

  private async writePresentation(
    dir: string,
    presentation: Presentation,
  ): Promise<void> {
    await Promise.all([
      fs.writeFile(
        path.join(dir, "presentation.md"),
        presentation.markdown,
        "utf-8",
      ),
      fs.writeFile(path.join(dir, "styles.css"), presentation.css, "utf-8"),
      fs.writeFile(path.join(dir, "scripts.js"), presentation.js, "utf-8"),
      fs.writeFile(
        path.join(dir, "metadata.json"),
        JSON.stringify(presentation.metadata, null, 2),
        "utf-8",
      ),
      fs.writeFile(
        path.join(dir, "history.json"),
        JSON.stringify(presentation.history, null, 2),
        "utf-8",
      ),
      fs.writeFile(
        path.join(dir, "conversation.json"),
        JSON.stringify(presentation.conversation, null, 2),
        "utf-8",
      ),
    ]);
  }

  private async readFileOrDefault(
    filePath: string,
    defaultValue: string,
  ): Promise<string> {
    try {
      return await fs.readFile(filePath, "utf-8");
    } catch {
      return defaultValue;
    }
  }

  private async readJson<T>(filePath: string): Promise<T | null> {
    try {
      const content = await fs.readFile(filePath, "utf-8");
      return JSON.parse(content) as T;
    } catch {
      return null;
    }
  }

  private async dirExists(dirPath: string): Promise<boolean> {
    try {
      const stat = await fs.stat(dirPath);
      return stat.isDirectory();
    } catch {
      return false;
    }
  }
}
