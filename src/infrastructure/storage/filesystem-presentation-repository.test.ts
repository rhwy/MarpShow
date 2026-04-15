import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { promises as fs } from "fs";
import path from "path";
import os from "os";
import { FilesystemPresentationRepository } from "./filesystem-presentation-repository";
import { createPresentation, createVersionSnapshot } from "@/core/domain";

describe("FilesystemPresentationRepository", () => {
  let tempDir: string;
  let repo: FilesystemPresentationRepository;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "markshow-test-"));
    repo = new FilesystemPresentationRepository(tempDir);
  });

  afterEach(async () => {
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  describe("create", () => {
    it("creates a presentation folder with all files", async () => {
      const p = createPresentation("test-1", "Test Deck");
      await repo.create(p);

      const dir = path.join(tempDir, "test-1");
      const files = await fs.readdir(dir);
      expect(files).toContain("presentation.md");
      expect(files).toContain("styles.css");
      expect(files).toContain("scripts.js");
      expect(files).toContain("metadata.json");
      expect(files).toContain("history.json");
      expect(files).toContain("conversation.json");
    });

    it("writes correct markdown content", async () => {
      const p = createPresentation("test-2", "My Talk");
      await repo.create(p);

      const md = await fs.readFile(
        path.join(tempDir, "test-2", "presentation.md"),
        "utf-8",
      );
      expect(md).toContain("# My Talk");
      expect(md).toContain("marp: true");
    });

    it("writes valid metadata JSON", async () => {
      const p = createPresentation("test-3", "Title", "Desc");
      await repo.create(p);

      const raw = await fs.readFile(
        path.join(tempDir, "test-3", "metadata.json"),
        "utf-8",
      );
      const meta = JSON.parse(raw);
      expect(meta.id).toBe("test-3");
      expect(meta.title).toBe("Title");
      expect(meta.description).toBe("Desc");
    });
  });

  describe("getById", () => {
    it("returns a full presentation when it exists", async () => {
      const p = createPresentation("get-1", "Get Test");
      await repo.create(p);

      const loaded = await repo.getById("get-1");
      expect(loaded).not.toBeNull();
      expect(loaded!.metadata.title).toBe("Get Test");
      expect(loaded!.markdown).toContain("# Get Test");
      expect(loaded!.history).toHaveLength(0);
    });

    it("returns null for non-existent ID", async () => {
      const loaded = await repo.getById("nope");
      expect(loaded).toBeNull();
    });
  });

  describe("list", () => {
    it("returns empty array when no presentations exist", async () => {
      const result = await repo.list();
      expect(result).toEqual([]);
    });

    it("returns summaries sorted by updatedAt descending", async () => {
      const p1 = createPresentation("list-1", "First");
      const p2 = createPresentation("list-2", "Second");
      // Ensure p2 is newer
      const p2WithLaterDate = {
        ...p2,
        metadata: {
          ...p2.metadata,
          updatedAt: new Date(
            Date.now() + 1000,
          ).toISOString(),
        },
      };
      await repo.create(p1);
      await repo.create(p2WithLaterDate);

      const result = await repo.list();
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe("list-2");
      expect(result[1].id).toBe("list-1");
    });

    it("includes slide count in summaries", async () => {
      const p = createPresentation("list-3", "Slides");
      await repo.create(p);

      const result = await repo.list();
      expect(result[0].slideCount).toBeGreaterThanOrEqual(1);
    });
  });

  describe("updateContent", () => {
    it("updates markdown content", async () => {
      const p = createPresentation("upd-1", "Update Test");
      await repo.create(p);

      const updated = await repo.updateContent("upd-1", {
        markdown: "# New Content",
      });
      expect(updated).not.toBeNull();
      expect(updated!.markdown).toBe("# New Content");

      // Verify persisted
      const reloaded = await repo.getById("upd-1");
      expect(reloaded!.markdown).toBe("# New Content");
    });

    it("updates CSS without affecting markdown", async () => {
      const p = createPresentation("upd-2", "CSS Test");
      await repo.create(p);

      const updated = await repo.updateContent("upd-2", {
        css: "body { color: red; }",
      });
      expect(updated!.css).toBe("body { color: red; }");
      expect(updated!.markdown).toContain("# CSS Test");
    });

    it("updates the updatedAt timestamp", async () => {
      const p = createPresentation("upd-3", "Time Test");
      await repo.create(p);
      const originalTime = p.metadata.updatedAt;

      // Small delay to ensure time difference
      await new Promise((r) => setTimeout(r, 10));

      const updated = await repo.updateContent("upd-3", { markdown: "new" });
      expect(updated!.metadata.updatedAt).not.toBe(originalTime);
    });

    it("returns null for non-existent presentation", async () => {
      const result = await repo.updateContent("nope", { markdown: "x" });
      expect(result).toBeNull();
    });
  });

  describe("updateMetadata", () => {
    it("updates title and description", async () => {
      const p = createPresentation("meta-1", "Old Title");
      await repo.create(p);

      const updated = await repo.updateMetadata("meta-1", {
        title: "New Title",
        description: "New desc",
      });
      expect(updated!.metadata.title).toBe("New Title");
      expect(updated!.metadata.description).toBe("New desc");
    });

    it("preserves fields not being updated", async () => {
      const p = createPresentation("meta-2", "Keep Theme");
      await repo.create(p);

      await repo.updateMetadata("meta-2", { title: "Changed" });
      const reloaded = await repo.getById("meta-2");
      expect(reloaded!.metadata.theme).toBe("default");
    });
  });

  describe("delete", () => {
    it("removes the presentation folder", async () => {
      const p = createPresentation("del-1", "Delete Me");
      await repo.create(p);
      expect(await repo.exists("del-1")).toBe(true);

      const result = await repo.delete("del-1");
      expect(result).toBe(true);
      expect(await repo.exists("del-1")).toBe(false);
    });

    it("returns false for non-existent presentation", async () => {
      const result = await repo.delete("nope");
      expect(result).toBe(false);
    });
  });

  describe("exists", () => {
    it("returns true for existing presentation", async () => {
      await repo.create(createPresentation("ex-1", "Exists"));
      expect(await repo.exists("ex-1")).toBe(true);
    });

    it("returns false for non-existent presentation", async () => {
      expect(await repo.exists("nope")).toBe(false);
    });
  });

  describe("addVersionSnapshot", () => {
    it("appends a version snapshot to the presentation", async () => {
      await repo.create(createPresentation("snap-1", "Snap Test"));
      const snap = createVersionSnapshot(1, "Initial", "# Test", "", "");
      const history = await repo.addVersionSnapshot("snap-1", snap);
      expect(history).not.toBeNull();
      expect(history!.length).toBe(1);
      expect(history![0].title).toBe("Initial");
    });

    it("returns null for non-existent presentation", async () => {
      const snap = createVersionSnapshot(1, "x", "", "", "");
      expect(await repo.addVersionSnapshot("nope", snap)).toBeNull();
    });

    it("persists the snapshot to disk", async () => {
      await repo.create(createPresentation("snap-2", "Persist"));
      const snap = createVersionSnapshot(1, "v1", "# Hello", "body{}", "");
      await repo.addVersionSnapshot("snap-2", snap);

      const reloaded = await repo.getHistory("snap-2");
      expect(reloaded).toHaveLength(1);
      expect(reloaded![0].content.markdown).toBe("# Hello");
      expect(reloaded![0].content.css).toBe("body{}");
    });
  });

  describe("getHistory", () => {
    it("returns empty history for new presentation", async () => {
      await repo.create(createPresentation("gh-1", "Get History"));
      const history = await repo.getHistory("gh-1");
      expect(history).not.toBeNull();
      expect(history!.length).toBe(0);
    });

    it("returns null for non-existent presentation", async () => {
      expect(await repo.getHistory("nope")).toBeNull();
    });
  });
});
