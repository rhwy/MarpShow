import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { AssistantPanel } from "./AssistantPanel";
import type { ConversationMessage } from "@/core/domain";

const sampleMessages: ConversationMessage[] = [
  {
    id: "1",
    role: "user",
    content: "Create a slide about APIs",
    timestamp: new Date().toISOString(),
  },
  {
    id: "2",
    role: "assistant",
    content: "I've created a slide about REST APIs.",
    timestamp: new Date().toISOString(),
  },
];

describe("AssistantPanel", () => {
  it("renders without crashing", () => {
    render(<AssistantPanel messages={[]} />);
    expect(screen.getByTestId("assistant-panel")).toBeInTheDocument();
  });

  it("renders the header with title", () => {
    render(<AssistantPanel messages={[]} />);
    expect(screen.getByText("AI Assistant")).toBeInTheDocument();
  });

  it("renders empty state when no messages", () => {
    render(<AssistantPanel messages={[]} />);
    expect(
      screen.getByText(/Ask the AI assistant/),
    ).toBeInTheDocument();
  });

  it("renders chat bubbles for messages", () => {
    render(<AssistantPanel messages={sampleMessages} />);
    expect(screen.getByText("Create a slide about APIs")).toBeInTheDocument();
    expect(
      screen.getByText("I've created a slide about REST APIs."),
    ).toBeInTheDocument();
  });

  it("renders the input field", () => {
    render(<AssistantPanel messages={[]} />);
    expect(screen.getByTestId("assistant-input")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Ask about your slides..."),
    ).toBeInTheDocument();
  });

  it("calls onSendMessage when send button is clicked", () => {
    const onSend = vi.fn();
    render(<AssistantPanel messages={[]} onSendMessage={onSend} />);

    const input = screen.getByTestId("assistant-input");
    fireEvent.change(input, { target: { value: "Hello AI" } });
    fireEvent.click(screen.getByTestId("assistant-send-btn"));

    expect(onSend).toHaveBeenCalledWith("Hello AI");
  });

  it("calls onSendMessage on Enter key", () => {
    const onSend = vi.fn();
    render(<AssistantPanel messages={[]} onSendMessage={onSend} />);

    const input = screen.getByTestId("assistant-input");
    fireEvent.change(input, { target: { value: "Hello" } });
    fireEvent.keyDown(input, { key: "Enter" });

    expect(onSend).toHaveBeenCalledWith("Hello");
  });

  it("clears input after sending", () => {
    const onSend = vi.fn();
    render(<AssistantPanel messages={[]} onSendMessage={onSend} />);

    const input = screen.getByTestId("assistant-input") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "Test" } });
    fireEvent.click(screen.getByTestId("assistant-send-btn"));

    expect(input.value).toBe("");
  });

  it("disables send when input is empty", () => {
    render(<AssistantPanel messages={[]} />);
    expect(screen.getByTestId("assistant-send-btn")).toBeDisabled();
  });

  it("calls onClose when close button is clicked", () => {
    const onClose = vi.fn();
    render(<AssistantPanel messages={[]} onClose={onClose} />);
    fireEvent.click(screen.getByTestId("assistant-close-btn"));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("shows loading indicator when loading", () => {
    render(<AssistantPanel messages={[]} loading />);
    expect(screen.getByTestId("assistant-loading")).toBeInTheDocument();
    expect(screen.getByText("Thinking...")).toBeInTheDocument();
  });
});
