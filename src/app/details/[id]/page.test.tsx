import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import DetailsPage from "./page";

vi.mock("next/navigation", () => ({
  useParams: () => ({ id: "test-id" }),
  useRouter: () => ({ back: vi.fn(), push: vi.fn() }),
  usePathname: () => "/details/test-id",
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
    description: "A test",
    author: "Jane",
    theme: "default",
    plugins: [],
    createdAt: "2026-04-10T00:00:00.000Z",
    updatedAt: "2026-04-10T12:00:00.000Z",
  },
  markdown: "---\nmarp: true\n---\n\n# Slide 1\n\n---\n\n## Slide 2",
  css: "",
  js: "",
  history: [
    { id: 1, timestamp: "2026-04-10T00:00:00Z", title: "Initial version", content: { markdown: "# Test", css: "", js: "" } },
    { id: 2, timestamp: "2026-04-10T01:00:00Z", title: "Added API slide", content: { markdown: "# Test\n---\n## API", css: "", js: "" } },
  ],
  conversation: [
    { id: "c1", role: "user", content: "Make a slide about APIs", timestamp: "2026-04-10T01:00:00Z" },
    { id: "c2", role: "assistant", content: "Done! Added an API slide.", timestamp: "2026-04-10T01:00:05Z" },
  ],
};

describe("DetailsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders loading state initially", () => {
    mockFetch.mockReturnValue(new Promise(() => {}));
    render(<DetailsPage />);
    expect(screen.getByText("Loading details...")).toBeInTheDocument();
  });

  it("renders the TopBar", () => {
    mockFetch.mockReturnValue(new Promise(() => {}));
    render(<DetailsPage />);
    expect(screen.getByText("MarkShow")).toBeInTheDocument();
  });

  it("renders the action bar with title and slide count", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => mockPresentation,
    });
    render(<DetailsPage />);
    expect(await screen.findByText("Test Deck")).toBeInTheDocument();
    expect(screen.getByText("2 slides")).toBeInTheDocument();
  });

  it("renders the three column headers", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => mockPresentation,
    });
    render(<DetailsPage />);
    expect(await screen.findByText("Markdown Source")).toBeInTheDocument();
    expect(screen.getByText("Change History")).toBeInTheDocument();
    expect(screen.getByText("AI Conversation Log")).toBeInTheDocument();
  });

  it("renders the markdown viewer", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => mockPresentation,
    });
    render(<DetailsPage />);
    expect(await screen.findByTestId("markdown-viewer")).toBeInTheDocument();
  });

  it("renders history entries", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => mockPresentation,
    });
    render(<DetailsPage />);
    expect(await screen.findByText("Initial version")).toBeInTheDocument();
    expect(screen.getByText("Added API slide")).toBeInTheDocument();
  });

  it("renders conversation messages", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => mockPresentation,
    });
    render(<DetailsPage />);
    expect(await screen.findByText("Make a slide about APIs")).toBeInTheDocument();
    expect(screen.getByText("Done! Added an API slide.")).toBeInTheDocument();
  });

  it("renders export buttons", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => mockPresentation,
    });
    render(<DetailsPage />);
    expect(await screen.findByTestId("export-pdf-btn")).toBeInTheDocument();
    expect(screen.getByTestId("export-pptx-btn")).toBeInTheDocument();
    expect(screen.getByTestId("export-markdown-btn")).toBeInTheDocument();
  });

  it("shows not found when presentation doesn't exist", async () => {
    mockFetch.mockResolvedValue({ ok: false, status: 404 });
    render(<DetailsPage />);
    expect(await screen.findByText("Presentation not found.")).toBeInTheDocument();
  });
});
