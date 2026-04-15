import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import HomePage from "./page";

// Mock next/navigation
const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
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

const mockFetch = vi.fn();
global.fetch = mockFetch;

const samplePresentations = [
  {
    id: "p-1",
    title: "First Deck",
    description: "Description one",
    theme: "default",
    updatedAt: "2026-04-10T12:00:00.000Z",
    slideCount: 3,
  },
  {
    id: "p-2",
    title: "Second Deck",
    description: "Description two",
    theme: "default",
    updatedAt: "2026-04-09T12:00:00.000Z",
    slideCount: 5,
  },
];

describe("HomePage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the TopBar", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => [],
    });
    render(<HomePage />);
    expect(screen.getByText("MarkShow")).toBeInTheDocument();
  });

  it("renders the New Presentation button", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => [],
    });
    render(<HomePage />);
    expect(screen.getByTestId("new-presentation-btn")).toBeInTheDocument();
  });

  it("renders presentation cards after loading", async () => {
    // List call + thumbnail render calls
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => samplePresentations,
    });

    render(<HomePage />);

    const card1 = await screen.findByText("First Deck");
    const card2 = await screen.findByText("Second Deck");
    expect(card1).toBeInTheDocument();
    expect(card2).toBeInTheDocument();
  });

  it("shows empty state when no presentations exist", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => [],
    });

    render(<HomePage />);

    const emptyMsg = await screen.findByText(
      "No presentations yet. Create one to get started!",
    );
    expect(emptyMsg).toBeInTheDocument();
  });

  it("opens create dialog on button click", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => [],
    });

    render(<HomePage />);
    await screen.findByText(
      "No presentations yet. Create one to get started!",
    );

    fireEvent.click(screen.getByTestId("new-presentation-btn"));

    expect(screen.getByText("New Presentation", { selector: "h2" })).toBeInTheDocument();
    expect(screen.getByTestId("title-input")).toBeInTheDocument();
  });

  it("creates presentation via dialog and redirects to editor", async () => {
    // List call returns empty, then create call
    mockFetch
      .mockResolvedValueOnce({ ok: true, json: async () => [] })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: "my-deck-a1b2",
          title: "My Deck",
        }),
      });

    render(<HomePage />);
    await screen.findByText(
      "No presentations yet. Create one to get started!",
    );

    // Open dialog
    fireEvent.click(screen.getByTestId("new-presentation-btn"));

    // Fill in title
    fireEvent.change(screen.getByTestId("title-input"), {
      target: { value: "My Deck" },
    });

    // Submit
    fireEvent.click(screen.getByTestId("create-submit-btn"));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/editor/my-deck-a1b2");
    });
  });

  it("shows delete confirmation dialog", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => samplePresentations,
    });

    render(<HomePage />);

    const deleteBtn = await screen.findByLabelText("Delete First Deck");
    fireEvent.click(deleteBtn);

    expect(
      screen.getByText(/Are you sure you want to delete "First Deck"/),
    ).toBeInTheDocument();
  });

  it("navigates to editor on card edit", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => samplePresentations,
    });

    render(<HomePage />);

    const editBtn = await screen.findByLabelText("Edit First Deck");
    fireEvent.click(editBtn);

    expect(mockPush).toHaveBeenCalledWith("/editor/p-1");
  });

  it("navigates to present on card present", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => samplePresentations,
    });

    render(<HomePage />);

    const presentBtn = await screen.findByLabelText("Present First Deck");
    fireEvent.click(presentBtn);

    expect(mockPush).toHaveBeenCalledWith("/present/p-1");
  });
});
