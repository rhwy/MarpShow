import { describe, it, expect } from "vitest";
import { rewriteMediaPaths } from "./rewrite-media-paths";

describe("rewriteMediaPaths", () => {
  const ID = "my-deck";
  const BASE = "/api/presentations/my-deck/media";

  describe("img src attributes", () => {
    it("rewrites ./filename references", () => {
      const html = '<img src="./photo.png" alt="test">';
      const result = rewriteMediaPaths(html, ID);
      expect(result).toBe(`<img src="${BASE}/photo.png" alt="test">`);
    });

    it("rewrites bare filename references", () => {
      const html = '<img src="diagram.svg" alt="test">';
      const result = rewriteMediaPaths(html, ID);
      expect(result).toBe(`<img src="${BASE}/diagram.svg" alt="test">`);
    });

    it("rewrites single-quoted src", () => {
      const html = "<img src='./logo.png'>";
      const result = rewriteMediaPaths(html, ID);
      expect(result).toBe(`<img src='${BASE}/logo.png'>`);
    });

    it("leaves absolute http URLs untouched", () => {
      const html = '<img src="https://example.com/img.png">';
      const result = rewriteMediaPaths(html, ID);
      expect(result).toBe(html);
    });

    it("leaves data: URLs untouched", () => {
      const html = '<img src="data:image/png;base64,abc">';
      const result = rewriteMediaPaths(html, ID);
      expect(result).toBe(html);
    });

    it("leaves protocol-relative URLs untouched", () => {
      const html = '<img src="//cdn.example.com/img.png">';
      const result = rewriteMediaPaths(html, ID);
      expect(result).toBe(html);
    });

    it("leaves absolute path URLs untouched", () => {
      const html = '<img src="/static/img.png">';
      const result = rewriteMediaPaths(html, ID);
      expect(result).toBe(html);
    });
  });

  describe("CSS url() references", () => {
    it("rewrites url('./file') with quotes", () => {
      const html = "background: url('./bg.jpg')";
      const result = rewriteMediaPaths(html, ID);
      expect(result).toBe(`background: url('${BASE}/bg.jpg')`);
    });

    it("rewrites url(./file) without quotes", () => {
      const html = "background: url(./bg.jpg)";
      const result = rewriteMediaPaths(html, ID);
      expect(result).toBe(`background: url(${BASE}/bg.jpg)`);
    });

    it("rewrites url(file) bare filename", () => {
      const html = "background: url(texture.png)";
      const result = rewriteMediaPaths(html, ID);
      expect(result).toBe(`background: url(${BASE}/texture.png)`);
    });

    it("leaves url(https://...) untouched", () => {
      const html = "background: url('https://example.com/bg.jpg')";
      const result = rewriteMediaPaths(html, ID);
      expect(result).toBe(html);
    });
  });

  describe("mixed content", () => {
    it("rewrites multiple references in the same HTML", () => {
      const html = `
        <img src="./a.png"><img src="b.jpg">
        <style>div { background: url('./c.svg'); }</style>
      `;
      const result = rewriteMediaPaths(html, ID);
      expect(result).toContain(`src="${BASE}/a.png"`);
      expect(result).toContain(`src="${BASE}/b.jpg"`);
      expect(result).toContain(`url('${BASE}/c.svg')`);
    });
  });
});
