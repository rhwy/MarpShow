import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { TopBar } from "./TopBar";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  usePathname: () => "/",
}));

// Mock next/link
vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    ...props
  }: {
    children: React.ReactNode;
    href: string;
    [key: string]: unknown;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

describe("TopBar", () => {
  it("renders the MarkShow logo", () => {
    render(<TopBar />);
    expect(screen.getByText("MarkShow")).toBeInTheDocument();
  });

  it("renders navigation links", () => {
    render(<TopBar />);
    expect(screen.getByLabelText("Home")).toBeInTheDocument();
    expect(screen.getByLabelText("Editor")).toBeInTheDocument();
    expect(screen.getByLabelText("Details")).toBeInTheDocument();
    expect(screen.getByLabelText("Settings")).toBeInTheDocument();
  });

  it("renders a navigation element", () => {
    render(<TopBar />);
    expect(screen.getByRole("navigation")).toBeInTheDocument();
  });

  it("renders the logo as a link to home", () => {
    render(<TopBar />);
    const logoLink = screen.getByText("MarkShow").closest("a");
    expect(logoLink).toHaveAttribute("href", "/");
  });
});
