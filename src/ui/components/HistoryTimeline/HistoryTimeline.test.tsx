import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { HistoryTimeline } from "./HistoryTimeline";
import type { VersionSnapshot } from "@/core/domain";

const sampleEntries: VersionSnapshot[] = [
  {
    id: 1,
    timestamp: "2026-04-10T10:00:00Z",
    title: "Initial version",
    content: { markdown: "# Test", css: "", js: "" },
  },
  {
    id: 2,
    timestamp: "2026-04-10T11:00:00Z",
    title: "Added charts slide",
    content: { markdown: "# Test\n\n---\n\n## Charts", css: "", js: "" },
  },
];

describe("HistoryTimeline", () => {
  it("renders without crashing", () => {
    render(<HistoryTimeline entries={[]} />);
    expect(screen.getByTestId("history-timeline")).toBeInTheDocument();
  });

  it("shows empty state when no entries", () => {
    render(<HistoryTimeline entries={[]} />);
    expect(screen.getByText("No versions saved yet.")).toBeInTheDocument();
  });

  it("renders version entries", () => {
    render(<HistoryTimeline entries={sampleEntries} />);
    expect(screen.getByText("Initial version")).toBeInTheDocument();
    expect(screen.getByText("Added charts slide")).toBeInTheDocument();
  });

  it("shows version IDs", () => {
    render(<HistoryTimeline entries={sampleEntries} />);
    expect(screen.getByText("v1")).toBeInTheDocument();
    expect(screen.getByText("v2")).toBeInTheDocument();
  });

  it("shows entries in reverse chronological order", () => {
    render(<HistoryTimeline entries={sampleEntries} />);
    const entries = screen.getAllByTestId("history-entry");
    expect(entries[0].textContent).toContain("Added charts slide");
    expect(entries[1].textContent).toContain("Initial version");
  });
});
