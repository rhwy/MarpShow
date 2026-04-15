import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MetadataForm } from "./MetadataForm";

const defaultValues = {
  title: "My Deck",
  description: "A subtitle",
  author: "Jane",
};

describe("MetadataForm", () => {
  it("renders without crashing", () => {
    render(<MetadataForm values={defaultValues} onSave={vi.fn()} />);
    expect(screen.getByTestId("metadata-form")).toBeInTheDocument();
  });

  it("renders form fields with current values", () => {
    render(<MetadataForm values={defaultValues} onSave={vi.fn()} />);
    expect(screen.getByTestId("meta-title")).toHaveValue("My Deck");
    expect(screen.getByTestId("meta-description")).toHaveValue("A subtitle");
    expect(screen.getByTestId("meta-author")).toHaveValue("Jane");
  });

  it("handles undefined values gracefully", () => {
    render(
      <MetadataForm
        values={{ title: "Test", description: "", author: "" }}
        onSave={vi.fn()}
      />,
    );
    expect(screen.getByTestId("meta-title")).toHaveValue("Test");
    expect(screen.getByTestId("meta-author")).toHaveValue("");
  });

  it("disables save when no changes are made", () => {
    render(<MetadataForm values={defaultValues} onSave={vi.fn()} />);
    expect(screen.getByTestId("meta-save-btn")).toBeDisabled();
  });

  it("enables save when values change", () => {
    render(<MetadataForm values={defaultValues} onSave={vi.fn()} />);
    fireEvent.change(screen.getByTestId("meta-title"), {
      target: { value: "Changed Title" },
    });
    expect(screen.getByTestId("meta-save-btn")).not.toBeDisabled();
  });

  it("calls onSave with updated values on submit", () => {
    const onSave = vi.fn();
    render(<MetadataForm values={defaultValues} onSave={onSave} />);

    fireEvent.change(screen.getByTestId("meta-title"), {
      target: { value: "New Title" },
    });
    fireEvent.click(screen.getByTestId("meta-save-btn"));

    expect(onSave).toHaveBeenCalledWith({
      title: "New Title",
      description: "A subtitle",
      author: "Jane",
    });
  });

  it("shows saving state", () => {
    render(<MetadataForm values={defaultValues} onSave={vi.fn()} saving />);
    expect(screen.getByText("Saving...")).toBeInTheDocument();
  });

  it("shows a note about theme being in frontmatter", () => {
    render(<MetadataForm values={defaultValues} onSave={vi.fn()} />);
    expect(screen.getByText(/theme: theme-name/)).toBeInTheDocument();
  });
});
