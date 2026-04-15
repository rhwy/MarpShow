import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import PresentPage from "./page";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useParams: () => ({ id: "test-123" }),
  useRouter: () => ({
    back: vi.fn(),
    push: vi.fn(),
  }),
}));

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe("PresentPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the loading state initially", () => {
    // fetch never resolves — stays in loading
    mockFetch.mockReturnValue(new Promise(() => {}));

    render(<PresentPage />);
    expect(screen.getByText("Loading presentation...")).toBeInTheDocument();
  });

  it("renders the slide area after loading", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        html: "<html><body><section>Slide 1</section></body></html>",
        slideCount: 1,
        css: "",
      }),
    });

    render(<PresentPage />);

    // Wait for loading to finish
    const slideRenderer = await screen.findByTestId("slide-renderer");
    expect(slideRenderer).toBeInTheDocument();
  });

  it("renders navigation controls after loading", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        html: "<html><body><section>S1</section><section>S2</section></body></html>",
        slideCount: 2,
        css: "",
      }),
    });

    render(<PresentPage />);

    const prevBtn = await screen.findByLabelText("Previous slide");
    const nextBtn = await screen.findByLabelText("Next slide");
    const backBtn = await screen.findByLabelText("Go back");
    const fullscreenBtn = await screen.findByLabelText("Toggle fullscreen");

    expect(prevBtn).toBeInTheDocument();
    expect(nextBtn).toBeInTheDocument();
    expect(backBtn).toBeInTheDocument();
    expect(fullscreenBtn).toBeInTheDocument();
  });

  it("displays the slide counter", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        html: "<html><body><section>S1</section><section>S2</section><section>S3</section></body></html>",
        slideCount: 3,
        css: "",
      }),
    });

    render(<PresentPage />);

    const counter = await screen.findByText("1 / 3");
    expect(counter).toBeInTheDocument();
  });

  it("calls the render API with the correct presentation ID", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        html: "<html><body><section>S</section></body></html>",
        slideCount: 1,
        css: "",
      }),
    });

    render(<PresentPage />);
    await screen.findByTestId("slide-renderer");

    expect(mockFetch).toHaveBeenCalledWith(
      "/api/presentations/test-123/render",
      { method: "POST" },
    );
  });
});
