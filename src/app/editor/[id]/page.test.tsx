import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import EditorPage from "./page";

vi.mock("next/navigation", () => ({
  useParams: () => ({ id: "test-id" }),
  useRouter: () => ({ push: vi.fn(), back: vi.fn() }),
  usePathname: () => "/editor/test-id",
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

const mockPresentation = {
  metadata: {
    id: "test-id",
    title: "Test Deck",
    description: "",
    theme: "default",
    plugins: [],
    createdAt: "2026-04-10T00:00:00.000Z",
    updatedAt: "2026-04-10T00:00:00.000Z",
  },
  markdown: "---\nmarp: true\n---\n\n# Test",
  css: "",
  js: "",
  history: [],
  conversation: [],
};

describe("EditorPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the loading state initially", () => {
    mockFetch.mockReturnValue(new Promise(() => {}));
    render(<EditorPage />);
    expect(screen.getByText("Loading editor...")).toBeInTheDocument();
  });

  it("renders the TopBar", () => {
    mockFetch.mockReturnValue(new Promise(() => {}));
    render(<EditorPage />);
    expect(screen.getByText("MarkShow")).toBeInTheDocument();
  });

  it("renders the editor tabs after loading", async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockPresentation,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ html: "<html></html>", slideCount: 1, css: "" }),
      });

    render(<EditorPage />);

    const mdTab = await screen.findByText("Markdown");
    expect(mdTab).toBeInTheDocument();
    expect(screen.getByText("CSS")).toBeInTheDocument();
    expect(screen.getByText("JS")).toBeInTheDocument();
  });

  it("renders the code editor after loading", async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockPresentation,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ html: "<html></html>", slideCount: 1, css: "" }),
      });

    render(<EditorPage />);

    const editor = await screen.findByTestId("code-editor");
    expect(editor).toBeInTheDocument();
  });

  it("renders the preview panel after loading", async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockPresentation,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ html: "<html></html>", slideCount: 1, css: "" }),
      });

    render(<EditorPage />);

    const preview = await screen.findByTestId("preview-panel");
    expect(preview).toBeInTheDocument();
  });

  it("shows not found when presentation doesn't exist", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
    });

    render(<EditorPage />);

    const msg = await screen.findByText("Presentation not found.");
    expect(msg).toBeInTheDocument();
  });

  it("renders the Present button in preview", async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockPresentation,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ html: "<html></html>", slideCount: 1, css: "" }),
      });

    render(<EditorPage />);

    const presentBtn = await screen.findByTestId("present-button");
    expect(presentBtn).toBeInTheDocument();
  });
});
