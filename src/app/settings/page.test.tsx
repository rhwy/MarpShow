import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import SettingsPage from "./page";

vi.mock("next/navigation", () => ({
  usePathname: () => "/settings",
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

const mockFetch = vi.fn();
global.fetch = mockFetch;

describe("SettingsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockImplementation((url: string) => {
      if (url.includes("/api/themes")) {
        return Promise.resolve({
          ok: true,
          json: async () => [
            { id: "default", name: "default", description: "Built-in", builtin: true },
            { id: "my-theme", name: "my-theme", description: "Custom", builtin: false },
          ],
        });
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({
          activeTheme: "default",
          plugins: [
            { id: "katex", name: "Math Equations (KaTeX)", description: "LaTeX", icon: "sigma", enabled: true },
            { id: "mermaid", name: "Mermaid Diagrams", description: "Diagrams", icon: "git-branch", enabled: false },
          ],
          editor: { fontSize: 14, tabSize: 2, autoSave: true, lineNumbers: true },
        }),
      });
    });
  });

  it("renders without crashing", () => {
    render(<SettingsPage />);
    expect(screen.getByTestId("settings-sidebar")).toBeInTheDocument();
  });

  it("renders the sidebar navigation", () => {
    render(<SettingsPage />);
    const sidebar = screen.getByTestId("settings-sidebar");
    expect(sidebar).toBeInTheDocument();
    // Sidebar has nav items
    expect(sidebar.textContent).toContain("Themes");
    expect(sidebar.textContent).toContain("Plugins");
    expect(sidebar.textContent).toContain("Editor");
  });

  it("renders themes from API", async () => {
    render(<SettingsPage />);
    const grid = await screen.findByTestId("theme-grid");
    expect(grid).toBeInTheDocument();
    // Built-in theme name shown as code
    expect(await screen.findByText("default")).toBeInTheDocument();
  });

  it("renders editor preferences", () => {
    render(<SettingsPage />);
    expect(screen.getByText("Font Size")).toBeInTheDocument();
    expect(screen.getByText("Auto-Save")).toBeInTheDocument();
  });

  it("renders the About section", () => {
    render(<SettingsPage />);
    expect(screen.getByText("Version 0.1.0")).toBeInTheDocument();
  });
});
