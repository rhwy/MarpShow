import { describe, it, expect } from "vitest";
import { MarpCoreRenderer } from "./marp-core-renderer";
import { rewriteMediaPaths } from "./rewrite-media-paths";

/**
 * Integration test: Marp render + media path rewriting.
 * Verifies the full pipeline that the render API uses.
 */
describe("Marp render with media path rewriting", () => {
  const renderer = new MarpCoreRenderer();

  it("rewrites image paths in rendered Marp output", async () => {
    const markdown = `---
marp: true
---

# Slide with image

![My Photo](./photo.png)
`;
    const result = await renderer.render(markdown);
    const rewritten = rewriteMediaPaths(result.html, "test-deck");

    // The rendered HTML should contain the rewritten path
    expect(rewritten).toContain("/api/presentations/test-deck/media/photo.png");
    // Should NOT contain the original relative path as src
    expect(rewritten).not.toMatch(/src=["']\.\/photo\.png["']/);
  });

  it("rewrites background image paths in rendered Marp output", async () => {
    const markdown = `---
marp: true
---

<!-- _backgroundImage: url('./bg.jpg') -->

# Slide with background
`;
    const result = await renderer.render(markdown);
    const rewritten = rewriteMediaPaths(result.html, "deck-123");

    expect(rewritten).toContain("/api/presentations/deck-123/media/bg.jpg");
  });

  it("leaves external URLs untouched in rendered output", async () => {
    const markdown = `---
marp: true
---

![External](https://example.com/logo.png)
`;
    const result = await renderer.render(markdown);
    const rewritten = rewriteMediaPaths(result.html, "test");

    expect(rewritten).toContain("https://example.com/logo.png");
    expect(rewritten).not.toContain("/api/presentations/test/media/https");
  });

  it("handles multiple images in the same document", async () => {
    const markdown = `---
marp: true
---

![A](./a.png)
![B](./b.jpg)

---

![C](./c.svg)
`;
    const result = await renderer.render(markdown);
    const rewritten = rewriteMediaPaths(result.html, "multi");

    expect(rewritten).toContain("/api/presentations/multi/media/a.png");
    expect(rewritten).toContain("/api/presentations/multi/media/b.jpg");
    expect(rewritten).toContain("/api/presentations/multi/media/c.svg");
  });
});
