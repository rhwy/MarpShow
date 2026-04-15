import { describe, it, expect } from "vitest";
import { scopeCustomCss } from "./scope-custom-css";

const MARP = "div.marpit > svg > foreignObject > section";

describe("scopeCustomCss", () => {
  it("rewrites bare section selector", () => {
    const css = "section { color: red; }";
    expect(scopeCustomCss(css)).toBe(`${MARP} { color: red; }`);
  });

  it("rewrites section with class", () => {
    const css = "section.dark { background: #000; }";
    expect(scopeCustomCss(css)).toBe(`${MARP}.dark { background: #000; }`);
  });

  it("rewrites section with descendant selector", () => {
    const css = "section h1 { font-size: 3em; }";
    expect(scopeCustomCss(css)).toBe(`${MARP} h1 { font-size: 3em; }`);
  });

  it("rewrites section with pseudo-class", () => {
    const css = "section:nth-of-type(2) { background: blue; }";
    expect(scopeCustomCss(css)).toBe(
      `${MARP}:nth-of-type(2) { background: blue; }`,
    );
  });

  it("rewrites multiple section selectors in comma-separated list", () => {
    const css = "section h1, section h2 { margin: 0; }";
    const result = scopeCustomCss(css);
    expect(result).toContain(`${MARP} h1`);
    expect(result).toContain(`${MARP} h2`);
  });

  it("leaves non-section selectors untouched", () => {
    const css = "body { margin: 0; }\n.custom { color: blue; }";
    expect(scopeCustomCss(css)).toBe(css);
  });

  it("returns empty string for empty input", () => {
    expect(scopeCustomCss("")).toBe("");
    expect(scopeCustomCss("   ")).toBe("   ");
  });

  it("handles multiple rules with section", () => {
    const css = `section { color: red; }
section h1 { font-size: 2em; }
.other { margin: 0; }`;
    const result = scopeCustomCss(css);
    expect(result).toContain(`${MARP} { color: red; }`);
    expect(result).toContain(`${MARP} h1 { font-size: 2em; }`);
    expect(result).toContain(".other { margin: 0; }");
  });
});
