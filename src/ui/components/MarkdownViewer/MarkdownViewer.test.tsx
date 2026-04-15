import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MarkdownViewer } from "./MarkdownViewer";

describe("MarkdownViewer", () => {
  it("renders without crashing", () => {
    render(<MarkdownViewer source="# Hello" />);
    expect(screen.getByTestId("markdown-viewer")).toBeInTheDocument();
  });

  it("renders line numbers", () => {
    render(<MarkdownViewer source={`line1\nline2\nline3`} />);
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("renders the source content", () => {
    render(<MarkdownViewer source={`# Title\n\nSome content`} />);
    expect(screen.getByText("# Title")).toBeInTheDocument();
    expect(screen.getByText("Some content")).toBeInTheDocument();
  });

  it("handles empty source", () => {
    render(<MarkdownViewer source="" />);
    expect(screen.getByTestId("markdown-viewer")).toBeInTheDocument();
  });
});
