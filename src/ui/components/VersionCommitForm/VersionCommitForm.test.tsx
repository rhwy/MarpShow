import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { VersionCommitForm } from "./VersionCommitForm";

describe("VersionCommitForm", () => {
  it("renders without crashing", () => {
    render(<VersionCommitForm onCommit={vi.fn()} />);
    expect(screen.getByTestId("version-commit-form")).toBeInTheDocument();
  });

  it("shows the input and save button", () => {
    render(<VersionCommitForm onCommit={vi.fn()} />);
    expect(screen.getByTestId("version-title-input")).toBeInTheDocument();
    expect(screen.getByTestId("version-save-btn")).toBeInTheDocument();
  });

  it("disables save when title is empty", () => {
    render(<VersionCommitForm onCommit={vi.fn()} />);
    expect(screen.getByTestId("version-save-btn")).toBeDisabled();
  });

  it("calls onCommit with title on submit", () => {
    const onCommit = vi.fn();
    render(<VersionCommitForm onCommit={onCommit} />);
    fireEvent.change(screen.getByTestId("version-title-input"), {
      target: { value: "Initial version" },
    });
    fireEvent.click(screen.getByTestId("version-save-btn"));
    expect(onCommit).toHaveBeenCalledWith("Initial version");
  });

  it("shows last version info when provided", () => {
    render(
      <VersionCommitForm
        onCommit={vi.fn()}
        lastVersion={{ id: 3, title: "Added charts", timestamp: "2026-04-12T12:00:00Z" }}
      />,
    );
    expect(screen.getByText("v3")).toBeInTheDocument();
    expect(screen.getByText(/Added charts/)).toBeInTheDocument();
  });
});
