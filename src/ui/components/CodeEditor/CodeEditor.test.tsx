import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { CodeEditor } from "./CodeEditor";

describe("CodeEditor", () => {
  it("renders without crashing", () => {
    render(<CodeEditor value="# Hello" language="markdown" />);
    expect(screen.getByTestId("code-editor")).toBeInTheDocument();
  });

  it("renders with css language", () => {
    render(<CodeEditor value="body { color: red; }" language="css" />);
    expect(screen.getByTestId("code-editor")).toBeInTheDocument();
  });

  it("renders with javascript language", () => {
    render(<CodeEditor value="console.log('hi')" language="javascript" />);
    expect(screen.getByTestId("code-editor")).toBeInTheDocument();
  });

  it("applies custom className", () => {
    render(
      <CodeEditor value="" language="markdown" className="my-editor" />,
    );
    const el = screen.getByTestId("code-editor");
    expect(el.className).toContain("my-editor");
  });
});
