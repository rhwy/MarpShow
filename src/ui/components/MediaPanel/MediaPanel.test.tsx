import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MediaPanel } from "./MediaPanel";

const mockFetch = vi.fn();
global.fetch = mockFetch;

const sampleFiles = [
  {
    name: "photo.png",
    path: "/api/presentations/test-1/media/photo.png",
    markdownRef: "![photo.png](./photo.png)",
  },
  {
    name: "diagram.svg",
    path: "/api/presentations/test-1/media/diagram.svg",
    markdownRef: "![diagram.svg](./diagram.svg)",
  },
];

describe("MediaPanel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders without crashing", () => {
    mockFetch.mockResolvedValue({ ok: true, json: async () => [] });
    render(<MediaPanel presentationId="test-1" />);
    expect(screen.getByTestId("media-panel")).toBeInTheDocument();
  });

  it("renders the drop zone", () => {
    mockFetch.mockResolvedValue({ ok: true, json: async () => [] });
    render(<MediaPanel presentationId="test-1" />);
    expect(screen.getByTestId("media-dropzone")).toBeInTheDocument();
  });

  it("shows empty state when no files", async () => {
    mockFetch.mockResolvedValue({ ok: true, json: async () => [] });
    render(<MediaPanel presentationId="test-1" />);
    const msg = await screen.findByText("No media files yet.");
    expect(msg).toBeInTheDocument();
  });

  it("renders file items when files exist", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => sampleFiles,
    });
    render(<MediaPanel presentationId="test-1" />);
    await screen.findByText("photo.png");
    expect(screen.getByText("diagram.svg")).toBeInTheDocument();
  });

  it("shows rename input when rename button is clicked", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => sampleFiles,
    });
    render(<MediaPanel presentationId="test-1" />);
    await screen.findByText("photo.png");

    fireEvent.click(screen.getByLabelText("Rename photo.png"));
    expect(screen.getByTestId("media-rename-input")).toBeInTheDocument();
    expect(screen.getByTestId("media-rename-input")).toHaveValue("photo.png");
  });

  it("opens preview popup when thumbnail is clicked", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => sampleFiles,
    });
    render(<MediaPanel presentationId="test-1" />);
    await screen.findByText("photo.png");

    const thumbnails = screen.getAllByTestId("media-thumbnail");
    fireEvent.click(thumbnails[0]);

    expect(screen.getByTestId("media-preview-overlay")).toBeInTheDocument();
    expect(screen.getByLabelText("Close preview")).toBeInTheDocument();
  });

  it("closes preview popup when close button is clicked", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => sampleFiles,
    });
    render(<MediaPanel presentationId="test-1" />);
    await screen.findByText("photo.png");

    // Open
    const thumbnails = screen.getAllByTestId("media-thumbnail");
    fireEvent.click(thumbnails[0]);
    expect(screen.getByTestId("media-preview-overlay")).toBeInTheDocument();

    // Close
    fireEvent.click(screen.getByLabelText("Close preview"));
    expect(screen.queryByTestId("media-preview-overlay")).not.toBeInTheDocument();
  });

  it("has a hidden file input", () => {
    mockFetch.mockResolvedValue({ ok: true, json: async () => [] });
    render(<MediaPanel presentationId="test-1" />);
    expect(screen.getByTestId("media-file-input")).toBeInTheDocument();
  });

  it("calls delete API when delete button is clicked", async () => {
    mockFetch
      .mockResolvedValueOnce({ ok: true, json: async () => sampleFiles }) // list
      .mockResolvedValueOnce({ ok: true, json: async () => ({ success: true }) }) // delete
      .mockResolvedValueOnce({ ok: true, json: async () => [] }); // re-list

    render(<MediaPanel presentationId="test-1" />);
    await screen.findByText("photo.png");

    fireEvent.click(screen.getByLabelText("Delete photo.png"));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        "/api/presentations/test-1/media?file=photo.png",
        { method: "DELETE" },
      );
    });
  });
});
