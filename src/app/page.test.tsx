import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import HomePage from "./page";

vi.mock("next/navigation", () => ({
  usePathname: () => "/",
}));

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

describe("HomePage", () => {
  it("renders the page heading", () => {
    render(<HomePage />);
    expect(screen.getByText("Home")).toBeInTheDocument();
  });

  it("renders the TopBar", () => {
    render(<HomePage />);
    expect(screen.getByText("MarkShow")).toBeInTheDocument();
  });
});
