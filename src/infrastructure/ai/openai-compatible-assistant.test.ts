import { describe, it, expect, vi, beforeEach } from "vitest";
import { OpenAICompatibleAssistant } from "./openai-compatible-assistant";
import type { AIAssistantConfig } from "@/core/ports";

const mockConfig: AIAssistantConfig = {
  apiUrl: "http://localhost:11434/v1",
  model: "gemma4",
  systemPrompt: "You are a test assistant.",
};

const mockFetch = vi.fn();
global.fetch = mockFetch;

describe("OpenAICompatibleAssistant", () => {
  let assistant: OpenAICompatibleAssistant;

  beforeEach(() => {
    vi.clearAllMocks();
    assistant = new OpenAICompatibleAssistant(mockConfig);
  });

  describe("chat", () => {
    it("sends request to the correct endpoint", async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          choices: [{ message: { content: "Hello!" } }],
        }),
      });

      await assistant.chat({
        userMessage: "Hi",
        currentMarkdown: "# Test",
        history: [],
      });

      expect(mockFetch).toHaveBeenCalledWith(
        "http://localhost:11434/v1/chat/completions",
        expect.objectContaining({ method: "POST" }),
      );
    });

    it("includes system prompt, context, and user message", async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          choices: [{ message: { content: "Response" } }],
        }),
      });

      await assistant.chat({
        userMessage: "Add a slide",
        currentMarkdown: "# Deck",
        history: [],
      });

      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(body.messages[0].role).toBe("system");
      expect(body.messages[0].content).toBe("You are a test assistant.");
      expect(body.messages[1].role).toBe("user");
      expect(body.messages[1].content).toContain("# Deck");
      expect(body.messages[1].content).toContain("Add a slide");
      expect(body.model).toBe("gemma4");
    });

    it("includes conversation history in messages", async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          choices: [{ message: { content: "Sure" } }],
        }),
      });

      await assistant.chat({
        userMessage: "Continue",
        currentMarkdown: "# Test",
        history: [
          { id: "1", role: "user", content: "Start", timestamp: "" },
          { id: "2", role: "assistant", content: "OK", timestamp: "" },
        ],
      });

      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      // system + 2 history + user = 4 messages
      expect(body.messages).toHaveLength(4);
      expect(body.messages[1].content).toBe("Start");
      expect(body.messages[2].content).toBe("OK");
    });

    it("returns content from the response", async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          choices: [{ message: { content: "Here is your slide" } }],
        }),
      });

      const result = await assistant.chat({
        userMessage: "x",
        currentMarkdown: "",
        history: [],
      });

      expect(result.content).toBe("Here is your slide");
    });

    it("extracts markdown from fenced code blocks", async () => {
      const aiResponse = `I've updated your slides.

\`\`\`markdown
---
marp: true
---

# Updated Slide
\`\`\``;

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          choices: [{ message: { content: aiResponse } }],
        }),
      });

      const result = await assistant.chat({
        userMessage: "x",
        currentMarkdown: "",
        history: [],
      });

      expect(result.updatedMarkdown).toContain("---\nmarp: true");
      expect(result.updatedMarkdown).toContain("# Updated Slide");
    });

    it("returns undefined updatedMarkdown when no code block", async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          choices: [{ message: { content: "Just a text response." } }],
        }),
      });

      const result = await assistant.chat({
        userMessage: "x",
        currentMarkdown: "",
        history: [],
      });

      expect(result.updatedMarkdown).toBeUndefined();
    });

    it("includes Authorization header when apiKey is set", async () => {
      const authedAssistant = new OpenAICompatibleAssistant({
        ...mockConfig,
        apiKey: "sk-test-123",
      });

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          choices: [{ message: { content: "OK" } }],
        }),
      });

      await authedAssistant.chat({
        userMessage: "x",
        currentMarkdown: "",
        history: [],
      });

      const headers = mockFetch.mock.calls[0][1].headers;
      expect(headers.Authorization).toBe("Bearer sk-test-123");
    });

    it("throws on API error", async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
        text: async () => "Internal Server Error",
      });

      await expect(
        assistant.chat({
          userMessage: "x",
          currentMarkdown: "",
          history: [],
        }),
      ).rejects.toThrow("AI API error 500");
    });
  });
});
