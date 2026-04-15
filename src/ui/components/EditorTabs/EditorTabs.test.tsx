import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { EditorTabs } from "./EditorTabs";

describe("EditorTabs", () => {
  it("renders all seven tabs", () => {
    render(<EditorTabs activeTab="markdown" onTabChange={vi.fn()} />);
    expect(screen.getByText("Markdown")).toBeInTheDocument();
    expect(screen.getByText("CSS")).toBeInTheDocument();
    expect(screen.getByText("Theme")).toBeInTheDocument();
    expect(screen.getByText("JS")).toBeInTheDocument();
    expect(screen.getByText("Media")).toBeInTheDocument();
    expect(screen.getByText("Config")).toBeInTheDocument();
    expect(screen.getByText("Docs")).toBeInTheDocument();
  });

  it("marks the active tab as selected", () => {
    render(<EditorTabs activeTab="css" onTabChange={vi.fn()} />);
    const cssTab = screen.getByText("CSS").closest("button");
    expect(cssTab).toHaveAttribute("aria-selected", "true");
  });

  it("calls onTabChange when a tab is clicked", () => {
    const onTabChange = vi.fn();
    render(<EditorTabs activeTab="markdown" onTabChange={onTabChange} />);
    fireEvent.click(screen.getByText("JS"));
    expect(onTabChange).toHaveBeenCalledWith("javascript");
  });

  it("has tablist role", () => {
    render(<EditorTabs activeTab="markdown" onTabChange={vi.fn()} />);
    expect(screen.getByRole("tablist")).toBeInTheDocument();
  });
});
