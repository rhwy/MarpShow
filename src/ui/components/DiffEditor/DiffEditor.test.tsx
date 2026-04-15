import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { DiffEditor } from "./DiffEditor";

describe("DiffEditor", () => {
  it("renders without crashing", () => {
    render(
      <DiffEditor
        originalDoc="# Original"
        modifiedDoc="# Modified"
        onResolved={vi.fn()}
      />,
    );
    expect(screen.getByTestId("diff-editor")).toBeInTheDocument();
  });

  it("shows the reviewing header", () => {
    render(
      <DiffEditor
        originalDoc="# Original"
        modifiedDoc="# Modified"
        onResolved={vi.fn()}
      />,
    );
    expect(screen.getByText("Reviewing AI changes")).toBeInTheDocument();
  });

  it("shows Accept All and Reject All buttons", () => {
    render(
      <DiffEditor
        originalDoc="# Original"
        modifiedDoc="# Modified"
        onResolved={vi.fn()}
      />,
    );
    expect(screen.getByTestId("accept-all-btn")).toBeInTheDocument();
    expect(screen.getByTestId("reject-all-btn")).toBeInTheDocument();
  });

  it("shows a Done button", () => {
    render(
      <DiffEditor
        originalDoc="# Original"
        modifiedDoc="# Modified"
        onResolved={vi.fn()}
      />,
    );
    expect(screen.getByTestId("done-review-btn")).toBeInTheDocument();
  });
});
