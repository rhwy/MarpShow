"use client";

export interface ChatBubbleProps {
  /** Role of the message sender */
  role: "user" | "assistant";
  /** Message content */
  content: string;
  /** Optional timestamp string */
  timestamp?: string;
}

/**
 * ChatBubble — a single message in the AI assistant chat.
 *
 * Assistant messages: elevated background, accent-colored "Assistant" label.
 * User messages: darker background, muted "You" label.
 */
export function ChatBubble({ role, content, timestamp }: ChatBubbleProps) {
  const isAssistant = role === "assistant";

  return (
    <div
      className="flex flex-col gap-1.5 rounded-lg"
      style={{
        backgroundColor: isAssistant
          ? "var(--surface-elevated)"
          : "#1E1E1E",
        padding: 10,
      }}
      data-testid="chat-bubble"
      data-role={role}
    >
      {/* Label */}
      <div className="flex items-center justify-between">
        <span
          className="text-[10px]"
          style={{
            fontFamily: "var(--font-caption)",
            color: isAssistant
              ? "var(--accent-primary)"
              : "var(--fg-muted)",
          }}
        >
          {isAssistant ? "Assistant" : "You"}
        </span>
        {timestamp && (
          <span
            className="text-[10px]"
            style={{
              fontFamily: "var(--font-caption)",
              color: "var(--fg-muted)",
            }}
          >
            {timestamp}
          </span>
        )}
      </div>

      {/* Content */}
      <p
        className="text-xs leading-relaxed whitespace-pre-wrap"
        style={{
          fontFamily: "var(--font-body)",
          color: isAssistant
            ? "var(--fg-secondary)"
            : "var(--fg-primary)",
          margin: 0,
        }}
      >
        {content}
      </p>
    </div>
  );
}
