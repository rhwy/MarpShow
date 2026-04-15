import { describe, it, expect } from "vitest";
import { slugify, slugifyDeterministic } from "./slugify";

describe("slugifyDeterministic", () => {
  it("lowercases and replaces spaces with hyphens", () => {
    expect(slugifyDeterministic("Hello World")).toBe("hello-world");
  });

  it("removes special characters", () => {
    expect(slugifyDeterministic("Hello, World!")).toBe("hello-world");
  });

  it("removes diacritics", () => {
    expect(slugifyDeterministic("Présentation été")).toBe("presentation-ete");
  });

  it("collapses multiple hyphens", () => {
    expect(slugifyDeterministic("hello---world")).toBe("hello-world");
  });

  it("trims leading and trailing hyphens", () => {
    expect(slugifyDeterministic("-hello-")).toBe("hello");
  });

  it("returns 'untitled' for empty string", () => {
    expect(slugifyDeterministic("")).toBe("untitled");
  });

  it("handles all-special-char input", () => {
    expect(slugifyDeterministic("!@#$%")).toBe("untitled");
  });
});

describe("slugify", () => {
  it("appends a random suffix", () => {
    const result = slugify("My Presentation");
    expect(result).toMatch(/^my-presentation-[a-z0-9]{4}$/);
  });

  it("produces different results each call", () => {
    const a = slugify("Test");
    const b = slugify("Test");
    expect(a).not.toBe(b);
  });
});
