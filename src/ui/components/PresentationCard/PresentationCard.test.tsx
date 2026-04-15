import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { PresentationCard } from "./PresentationCard";
import type { PresentationSummary } from "@/core/domain";

const mockPresentation: PresentationSummary = {
  id: "test-1",
  title: "Test Presentation",
  description: "A great test deck",
  theme: "default",
  updatedAt: "2026-04-10T12:00:00.000Z",
  slideCount: 5,
};

describe("PresentationCard", () => {
  it("renders the presentation title", () => {
    render(<PresentationCard presentation={mockPresentation} />);
    expect(screen.getByText("Test Presentation")).toBeInTheDocument();
  });

  it("renders the description", () => {
    render(<PresentationCard presentation={mockPresentation} />);
    expect(screen.getByText("A great test deck")).toBeInTheDocument();
  });

  it("renders a formatted date", () => {
    render(<PresentationCard presentation={mockPresentation} />);
    expect(screen.getByText("Apr 10")).toBeInTheDocument();
  });

  it("renders all four action buttons", () => {
    render(<PresentationCard presentation={mockPresentation} />);
    expect(screen.getByLabelText("Edit Test Presentation")).toBeInTheDocument();
    expect(screen.getByLabelText("Delete Test Presentation")).toBeInTheDocument();
    expect(screen.getByLabelText("Present Test Presentation")).toBeInTheDocument();
    expect(screen.getByLabelText("Details for Test Presentation")).toBeInTheDocument();
  });

  it("calls onEdit when edit button is clicked", () => {
    const onEdit = vi.fn();
    render(<PresentationCard presentation={mockPresentation} onEdit={onEdit} />);
    fireEvent.click(screen.getByLabelText("Edit Test Presentation"));
    expect(onEdit).toHaveBeenCalledWith("test-1");
  });

  it("calls onDelete when delete button is clicked", () => {
    const onDelete = vi.fn();
    render(<PresentationCard presentation={mockPresentation} onDelete={onDelete} />);
    fireEvent.click(screen.getByLabelText("Delete Test Presentation"));
    expect(onDelete).toHaveBeenCalledWith("test-1");
  });

  it("calls onPresent when present button is clicked", () => {
    const onPresent = vi.fn();
    render(<PresentationCard presentation={mockPresentation} onPresent={onPresent} />);
    fireEvent.click(screen.getByLabelText("Present Test Presentation"));
    expect(onPresent).toHaveBeenCalledWith("test-1");
  });

  it("calls onDetails when details button is clicked", () => {
    const onDetails = vi.fn();
    render(<PresentationCard presentation={mockPresentation} onDetails={onDetails} />);
    fireEvent.click(screen.getByLabelText("Details for Test Presentation"));
    expect(onDetails).toHaveBeenCalledWith("test-1");
  });

  it("renders without description gracefully", () => {
    const noDesc = { ...mockPresentation, description: "" };
    render(<PresentationCard presentation={noDesc} />);
    expect(screen.getByText("Test Presentation")).toBeInTheDocument();
  });

  it("has the correct test id", () => {
    render(<PresentationCard presentation={mockPresentation} />);
    expect(screen.getByTestId("presentation-card")).toBeInTheDocument();
  });
});
