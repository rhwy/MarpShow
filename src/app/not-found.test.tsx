import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import NotFound from "./not-found";

vi.mock("next/navigation", () => ({
  usePathname: () => "/nonexistent",
  useRouter: () => ({ back: vi.fn() }),
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

describe("NotFoundPage", () => {
  it("renders without crashing", () => {
    render(<NotFound />);
    expect(screen.getByText("404")).toBeInTheDocument();
  });

  it("renders the TopBar", () => {
    render(<NotFound />);
    expect(screen.getByText("MarkShow")).toBeInTheDocument();
  });
});
