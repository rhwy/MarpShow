import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ChatBubble } from "./ChatBubble";

describe("ChatBubble", () => {
  it("renders without crashing", () => {
    render(<ChatBubble role="user" content="Hello" />);
    expect(screen.getByTestId("chat-bubble")).toBeInTheDocument();
  });

  it("renders user message with 'You' label", () => {
    render(<ChatBubble role="user" content="Test message" />);
    expect(screen.getByText("You")).toBeInTheDocument();
    expect(screen.getByText("Test message")).toBeInTheDocument();
  });

  it("renders assistant message with 'Assistant' label", () => {
    render(<ChatBubble role="assistant" content="AI response" />);
    expect(screen.getByText("Assistant")).toBeInTheDocument();
    expect(screen.getByText("AI response")).toBeInTheDocument();
  });

  it("sets data-role attribute", () => {
    render(<ChatBubble role="assistant" content="test" />);
    expect(screen.getByTestId("chat-bubble")).toHaveAttribute(
      "data-role",
      "assistant",
    );
  });

  it("renders timestamp when provided", () => {
    render(
      <ChatBubble role="user" content="msg" timestamp="2 min ago" />,
    );
    expect(screen.getByText("2 min ago")).toBeInTheDocument();
  });

  it("renders without timestamp gracefully", () => {
    render(<ChatBubble role="user" content="msg" />);
    expect(screen.getByText("msg")).toBeInTheDocument();
  });
});
