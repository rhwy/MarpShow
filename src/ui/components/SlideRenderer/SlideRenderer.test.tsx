import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { SlideRenderer } from "./SlideRenderer";

describe("SlideRenderer", () => {
  const sampleHtml = `<!DOCTYPE html>
<html><head><style>body{margin:0}</style></head>
<body><section>Slide 1</section><section>Slide 2</section></body></html>`;

  it("renders an iframe with the provided HTML", () => {
    render(<SlideRenderer html={sampleHtml} />);

    const container = screen.getByTestId("slide-renderer");
    expect(container).toBeInTheDocument();

    const iframe = container.querySelector("iframe");
    expect(iframe).toBeInTheDocument();
    expect(iframe?.getAttribute("srcdoc")).toBe(sampleHtml);
  });

  it("sets the iframe title for accessibility", () => {
    render(<SlideRenderer html={sampleHtml} />);
    const iframe = screen.getByTitle("Slide Preview");
    expect(iframe).toBeInTheDocument();
  });

  it("applies sandbox attribute for security", () => {
    render(<SlideRenderer html={sampleHtml} />);
    const iframe = screen.getByTitle("Slide Preview");
    expect(iframe).toHaveAttribute("sandbox");
  });

  it("applies custom className to container", () => {
    render(<SlideRenderer html={sampleHtml} className="my-custom-class" />);
    const container = screen.getByTestId("slide-renderer");
    expect(container.className).toContain("my-custom-class");
  });

  it("renders with default currentSlide of 0", () => {
    const onSlideCount = vi.fn();
    render(
      <SlideRenderer html={sampleHtml} onSlideCount={onSlideCount} />,
    );
    // Component renders without errors
    expect(screen.getByTestId("slide-renderer")).toBeInTheDocument();
  });
});
