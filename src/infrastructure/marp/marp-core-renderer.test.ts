import { describe, it, expect } from "vitest";
import { MarpCoreRenderer } from "./marp-core-renderer";

describe("MarpCoreRenderer", () => {
  const renderer = new MarpCoreRenderer();

  it("renders basic Marp markdown to HTML", async () => {
    const markdown = `---
marp: true
---

# Hello World
`;
    const result = await renderer.render(markdown);

    expect(result.html).toContain("Hello World");
    expect(result.html).toContain("<!DOCTYPE html>");
    expect(result.html).toContain("<style>");
    expect(result.slideCount).toBeGreaterThanOrEqual(1);
  });

  it("counts multiple slides correctly", async () => {
    const markdown = `---
marp: true
---

# Slide 1

---

# Slide 2

---

# Slide 3
`;
    const result = await renderer.render(markdown);
    expect(result.slideCount).toBe(3);
  });

  it("returns CSS from the rendering", async () => {
    const markdown = `---
marp: true
---

# Test
`;
    const result = await renderer.render(markdown);
    expect(result.css).toBeTruthy();
    expect(result.css.length).toBeGreaterThan(0);
  });

  it("includes custom CSS when provided", async () => {
    const markdown = `---
marp: true
---

# Test
`;
    const customCss = ".custom-class { color: red; }";
    const result = await renderer.render(markdown, customCss);

    expect(result.css).toContain(".custom-class");
    expect(result.html).toContain(".custom-class");
  });

  it("includes custom JavaScript in rendered output", async () => {
    const markdown = `---
marp: true
---

# Test
`;
    const customJs = 'console.log("hello from custom JS")';
    const result = await renderer.render(markdown, undefined, customJs);

    expect(result.html).toContain("<script>");
    expect(result.html).toContain("hello from custom JS");
  });

  it("does not include custom script block when no JS provided", async () => {
    const markdown = `---
marp: true
---

# Test
`;
    const result = await renderer.render(markdown);
    // Our custom JS block would be the last script before </body>
    // Marp may include its own scripts, but ours shouldn't be there
    expect(result.html).not.toContain('console.log("hello');
  });

  it("does not include external CDN @import for fonts (offline-safe)", async () => {
    const markdown = `---
marp: true
theme: gaia
---

# Offline Test
`;
    const result = await renderer.render(markdown);
    expect(result.html).not.toContain("@import");
    expect(result.html).not.toContain("fonts.bunny.net");
    expect(result.html).not.toContain("fonts.googleapis.com");
    // But it should have local font-face
    expect(result.html).toContain("@font-face");
    expect(result.html).toContain("/fonts/lato-latin-400-normal.woff2");
  });

  it("includes auto-fit image CSS with Marp-specific selectors", async () => {
    const markdown = `---
marp: true
---

# Test
`;
    const result = await renderer.render(markdown);
    expect(result.html).toContain("div.marpit > svg > foreignObject > section");
    expect(result.html).toContain("object-fit: contain");
    expect(result.html).toContain("flex-direction: column");
  });

  it("scopes custom CSS to Marp selector specificity", async () => {
    const markdown = `---
marp: true
---

# Test
`;
    const customCss = "section { background: #111; }";
    const result = await renderer.render(markdown, customCss);
    // Custom CSS should be scoped to Marp's full path
    expect(result.html).toContain(
      "div.marpit > svg > foreignObject > section { background: #111; }",
    );
  });

  it("handles markdown without frontmatter", async () => {
    const markdown = "# Just a heading";
    const result = await renderer.render(markdown);

    expect(result.html).toContain("Just a heading");
    expect(result.slideCount).toBeGreaterThanOrEqual(1);
  });

  it("produces a complete HTML document", async () => {
    const markdown = `---
marp: true
---

# Doc Test
`;
    const result = await renderer.render(markdown);

    expect(result.html).toContain("<!DOCTYPE html>");
    expect(result.html).toContain("<html>");
    expect(result.html).toContain("</html>");
    expect(result.html).toContain("<head>");
    expect(result.html).toContain("<body>");
  });
});
