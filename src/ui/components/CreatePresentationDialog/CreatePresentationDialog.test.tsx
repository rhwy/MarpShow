import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { CreatePresentationDialog } from "./CreatePresentationDialog";

describe("CreatePresentationDialog", () => {
  const baseProps = {
    open: true,
    onCancel: vi.fn(),
    onCreate: vi.fn(),
  };

  it("renders nothing when closed", () => {
    render(<CreatePresentationDialog {...baseProps} open={false} />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("renders title, description, and author fields", () => {
    render(<CreatePresentationDialog {...baseProps} />);
    expect(screen.getByTestId("title-input")).toBeInTheDocument();
    expect(screen.getByTestId("description-input")).toBeInTheDocument();
    expect(screen.getByTestId("author-input")).toBeInTheDocument();
  });

  it("renders the dialog heading", () => {
    render(<CreatePresentationDialog {...baseProps} />);
    expect(screen.getByText("New Presentation")).toBeInTheDocument();
  });

  it("disables submit when title is empty", () => {
    render(<CreatePresentationDialog {...baseProps} />);
    const btn = screen.getByTestId("create-submit-btn");
    expect(btn).toBeDisabled();
  });

  it("calls onCreate with form data on submit", () => {
    const onCreate = vi.fn();
    render(<CreatePresentationDialog {...baseProps} onCreate={onCreate} />);

    fireEvent.change(screen.getByTestId("title-input"), {
      target: { value: "My Deck" },
    });
    fireEvent.change(screen.getByTestId("description-input"), {
      target: { value: "A subtitle" },
    });
    fireEvent.change(screen.getByTestId("author-input"), {
      target: { value: "Jane" },
    });
    fireEvent.click(screen.getByTestId("create-submit-btn"));

    expect(onCreate).toHaveBeenCalledWith({
      title: "My Deck",
      description: "A subtitle",
      author: "Jane",
    });
  });

  it("calls onCancel when cancel button is clicked", () => {
    const onCancel = vi.fn();
    render(<CreatePresentationDialog {...baseProps} onCancel={onCancel} />);
    fireEvent.click(screen.getByText("Cancel"));
    expect(onCancel).toHaveBeenCalledOnce();
  });

  it("shows loading state", () => {
    render(<CreatePresentationDialog {...baseProps} loading />);
    expect(screen.getByText("Creating...")).toBeInTheDocument();
  });
});
