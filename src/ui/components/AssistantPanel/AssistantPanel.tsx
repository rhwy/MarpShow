"use client";

import { useState, useRef, useEffect } from "react";
import { Sparkles, PanelLeftClose, Send, Eraser } from "lucide-react";
import { ChatBubble } from "@/ui/components/ChatBubble";
import type { ConversationMessage } from "@/core/domain";

export interface AssistantPanelProps {
  /** Chat messages to display */
  messages: ConversationMessage[];
  /** Called when the user sends a message */
  onSendMessage?: (content: string) => void;
  /** Called when the user closes the panel */
  onClose?: () => void;
  /** Called when the user clears the conversation */
  onClear?: () => void;
  /** Whether the assistant is currently responding */
  loading?: boolean;
}

/**
 * AssistantPanel — AI assistant chat panel for the editor.
 *
 * Header with sparkles icon, title, and close button.
 * Scrollable chat area with ChatBubble messages.
 * Input area with text field and send button.
 */
export function AssistantPanel({
  messages,
  onSendMessage,
  onClose,
  onClear,
  loading = false,
}: AssistantPanelProps) {
  const [inputValue, setInputValue] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const handleSend = () => {
    const trimmed = inputValue.trim();
    if (!trimmed || loading) return;
    onSendMessage?.(trimmed);
    setInputValue("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div
      className="flex flex-col h-full"
      style={{
        backgroundColor: "var(--surface-card)",
        borderRight: "1px solid var(--border-subtle)",
      }}
      data-testid="assistant-panel"
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-3 flex-shrink-0"
        style={{
          height: 44,
          borderBottom: "1px solid var(--border-subtle)",
        }}
      >
        <div className="flex items-center gap-2">
          <Sparkles
            size={16}
            style={{ color: "var(--accent-primary)" }}
          />
          <span
            className="text-[13px] font-semibold"
            style={{
              fontFamily: "var(--font-heading)",
              color: "var(--fg-primary)",
            }}
          >
            AI Assistant
          </span>
        </div>
        <div className="flex items-center gap-2">
          {messages.length > 0 && (
            <button
              onClick={onClear}
              className="flex items-center justify-center"
              style={{ color: "var(--fg-muted)" }}
              aria-label="Clear conversation"
              data-testid="assistant-clear-btn"
              title="Clear conversation"
            >
              <Eraser size={14} />
            </button>
          )}
          <button
            onClick={onClose}
            className="flex items-center justify-center"
            style={{ color: "var(--fg-muted)" }}
            aria-label="Close assistant panel"
            data-testid="assistant-close-btn"
          >
            <PanelLeftClose size={16} />
          </button>
        </div>
      </div>

      {/* Chat area */}
      <div
        className="flex-1 overflow-y-auto flex flex-col gap-2.5 p-3"
        data-testid="assistant-chat-area"
      >
        {messages.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <p
              className="text-xs text-center px-4"
              style={{
                fontFamily: "var(--font-body)",
                color: "var(--fg-muted)",
              }}
            >
              Ask the AI assistant to help create, modify, or improve your slides.
            </p>
          </div>
        ) : (
          messages.map((msg) => (
            <ChatBubble
              key={msg.id}
              role={msg.role}
              content={msg.content}
              timestamp={formatTimestamp(msg.timestamp)}
            />
          ))
        )}
        {loading && (
          <div
            className="flex items-center gap-2 px-2 py-1"
            data-testid="assistant-loading"
          >
            <div
              className="w-2 h-2 rounded-full animate-pulse"
              style={{ backgroundColor: "var(--accent-primary)" }}
            />
            <span
              className="text-xs"
              style={{
                fontFamily: "var(--font-body)",
                color: "var(--fg-muted)",
              }}
            >
              Thinking...
            </span>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input area */}
      <div
        className="flex items-center gap-2 px-3 flex-shrink-0"
        style={{
          height: 44,
          borderTop: "1px solid var(--border-subtle)",
        }}
      >
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask about your slides..."
          disabled={loading}
          className="flex-1 text-xs px-2.5 rounded-lg outline-none"
          style={{
            height: 32,
            backgroundColor: "var(--surface-elevated)",
            color: "var(--fg-primary)",
            fontFamily: "var(--font-body)",
            border: "none",
          }}
          data-testid="assistant-input"
        />
        <button
          onClick={handleSend}
          disabled={!inputValue.trim() || loading}
          className="flex items-center justify-center transition-opacity"
          style={{
            color: "var(--accent-primary)",
            opacity: !inputValue.trim() || loading ? 0.4 : 1,
          }}
          aria-label="Send message"
          data-testid="assistant-send-btn"
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}

function formatTimestamp(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin} min ago`;
  const diffHrs = Math.floor(diffMin / 60);
  if (diffHrs < 24) return `${diffHrs}h ago`;
  return date.toLocaleDateString();
}
