import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ResizablePanels } from "./ResizablePanels";

describe("ResizablePanels", () => {
  it("renders without crashing", () => {
    render(
      <ResizablePanels
        left={<div>Left</div>}
        right={<div>Right</div>}
      />,
    );
    expect(screen.getByTestId("resizable-panels")).toBeInTheDocument();
  });

  it("renders both panels", () => {
    render(
      <ResizablePanels
        left={<div>Left Content</div>}
        right={<div>Right Content</div>}
      />,
    );
    expect(screen.getByText("Left Content")).toBeInTheDocument();
    expect(screen.getByText("Right Content")).toBeInTheDocument();
  });

  it("renders the divider", () => {
    render(
      <ResizablePanels
        left={<div>L</div>}
        right={<div>R</div>}
      />,
    );
    expect(screen.getByTestId("panel-divider")).toBeInTheDocument();
  });
});
