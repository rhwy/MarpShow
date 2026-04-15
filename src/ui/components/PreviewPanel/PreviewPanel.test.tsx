import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { PreviewPanel } from "./PreviewPanel";

const sampleHtml =
  '<!DOCTYPE html><html><body><section>S1</section><section>S2</section></body></html>';

describe("PreviewPanel", () => {
  it("renders without crashing", () => {
    render(<PreviewPanel html={sampleHtml} presentationId="test" />);
    expect(screen.getByTestId("preview-panel")).toBeInTheDocument();
  });

  it("shows the Preview label", () => {
    render(<PreviewPanel html={sampleHtml} presentationId="test" />);
    expect(screen.getByText("Preview")).toBeInTheDocument();
  });

  it("shows the slide counter", () => {
    render(<PreviewPanel html={sampleHtml} presentationId="test" />);
    // Default: 1 / 1 (before iframe reports count)
    expect(screen.getByText(/1 \//)).toBeInTheDocument();
  });

  it("renders the Present button", () => {
    render(<PreviewPanel html={sampleHtml} presentationId="test" />);
    expect(screen.getByTestId("present-button")).toBeInTheDocument();
    expect(screen.getByText("Present")).toBeInTheDocument();
  });

  it("calls onPresent when Present button is clicked", () => {
    const onPresent = vi.fn();
    render(
      <PreviewPanel
        html={sampleHtml}
        presentationId="test"
        onPresent={onPresent}
      />,
    );
    fireEvent.click(screen.getByTestId("present-button"));
    expect(onPresent).toHaveBeenCalledOnce();
  });

  it("renders the slide renderer", () => {
    render(<PreviewPanel html={sampleHtml} presentationId="test" />);
    expect(screen.getByTestId("slide-renderer")).toBeInTheDocument();
  });
});
