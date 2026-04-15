import { describe, it, expect } from "vitest";
import {
  createPresentation,
  createVersionSnapshot,
  countSlides,
  toSummary,
} from "./presentation";
import type { Presentation } from "./presentation";

describe("createPresentation", () => {
  it("creates a presentation with default values", () => {
    const p = createPresentation("abc-123", "My Deck");

    expect(p.metadata.id).toBe("abc-123");
    expect(p.metadata.title).toBe("My Deck");
    expect(p.metadata.description).toBe("");
    expect(p.metadata.author).toBe("");
    expect(p.metadata.theme).toBe("default");
    expect(p.metadata.plugins).toEqual([]);
    expect(p.metadata.createdAt).toBeTruthy();
    expect(p.metadata.updatedAt).toBe(p.metadata.createdAt);
  });

  it("uses the provided description", () => {
    const p = createPresentation("id", "Title", "A great deck");
    expect(p.metadata.description).toBe("A great deck");
  });

  it("uses the provided author", () => {
    const p = createPresentation("id", "Title", "desc", "Jane Smith");
    expect(p.metadata.author).toBe("Jane Smith");
    expect(p.markdown).toContain("*Jane Smith*");
  });

  it("includes description in default markdown", () => {
    const p = createPresentation("id", "Title", "My subtitle");
    expect(p.markdown).toContain("My subtitle");
  });

  it("generates default Marp markdown with the title", () => {
    const p = createPresentation("id", "My Talk");
    expect(p.markdown).toContain("marp: true");
    expect(p.markdown).toContain("# My Talk");
  });

  it("starts with empty CSS and JS", () => {
    const p = createPresentation("id", "T");
    expect(p.css).toBe("");
    expect(p.js).toBe("");
  });

  it("starts with empty history (versions are manual)", () => {
    const p = createPresentation("id", "T");
    expect(p.history).toHaveLength(0);
  });

  it("starts with an empty conversation", () => {
    const p = createPresentation("id", "T");
    expect(p.conversation).toEqual([]);
  });
});

describe("countSlides", () => {
  it("counts slides in a standard Marp document", () => {
    const md = `---
marp: true
---

# Slide 1

---

## Slide 2

---

## Slide 3
`;
    expect(countSlides(md)).toBe(3);
  });

  it("returns 1 for a single-slide document", () => {
    const md = `---
marp: true
---

# Only slide
`;
    expect(countSlides(md)).toBe(1);
  });

  it("returns at least 1 for empty content", () => {
    expect(countSlides("")).toBe(1);
  });

  it("handles document without frontmatter", () => {
    const md = `# Slide 1

---

## Slide 2
`;
    expect(countSlides(md)).toBe(2);
  });
});

describe("createVersionSnapshot", () => {
  it("creates a snapshot with the given fields", () => {
    const snap = createVersionSnapshot(1, "Initial version", "# Test", "body{}", "log()");
    expect(snap.id).toBe(1);
    expect(snap.title).toBe("Initial version");
    expect(snap.timestamp).toBeTruthy();
    expect(snap.content.markdown).toBe("# Test");
    expect(snap.content.css).toBe("body{}");
    expect(snap.content.js).toBe("log()");
  });

  it("uses sequential IDs", () => {
    const s1 = createVersionSnapshot(1, "v1", "", "", "");
    const s2 = createVersionSnapshot(2, "v2", "", "", "");
    expect(s1.id).toBe(1);
    expect(s2.id).toBe(2);
  });
});

describe("toSummary", () => {
  it("extracts a summary from a full presentation", () => {
    const p = createPresentation("s-1", "Summary Test", "desc");
    const summary = toSummary(p);

    expect(summary.id).toBe("s-1");
    expect(summary.title).toBe("Summary Test");
    expect(summary.description).toBe("desc");
    expect(summary.theme).toBe("default");
    expect(summary.updatedAt).toBe(p.metadata.updatedAt);
    expect(summary.slideCount).toBe(2); // default template has 2 slides
  });

  it("does not include markdown, css, js, history, or conversation", () => {
    const p = createPresentation("s-2", "T");
    const summary = toSummary(p) as Record<string, unknown>;

    expect(summary).not.toHaveProperty("markdown");
    expect(summary).not.toHaveProperty("css");
    expect(summary).not.toHaveProperty("js");
    expect(summary).not.toHaveProperty("history");
    expect(summary).not.toHaveProperty("conversation");
  });
});
