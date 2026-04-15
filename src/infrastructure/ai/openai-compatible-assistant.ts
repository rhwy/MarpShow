/**
 * OpenAI-compatible adapter for the AIAssistant port.
 *
 * Works with any API implementing the /v1/chat/completions endpoint:
 * Ollama, Claude (via compatibility layer), OpenAI, LM Studio, etc.
 */

import type {
  AIAssistant,
  AIAssistantConfig,
  ChatRequest,
  ChatResponse,
} from "@/core/ports";
import type { ConversationMessage } from "@/core/domain";
import { createLogger } from "@/infrastructure/logging";

const logger = createLogger("OpenAIAssistant");

interface OpenAIChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export class OpenAICompatibleAssistant implements AIAssistant {
  constructor(private readonly config: AIAssistantConfig) {}

  async chat(request: ChatRequest): Promise<ChatResponse> {
    logger.info("Sending chat request", {
      model: this.config.model,
      historyLength: request.history.length,
    });

    const messages = this.buildMessages(request);

    const res = await fetch(`${this.config.apiUrl}/chat/completions`, {
      method: "POST",
      headers: this.buildHeaders(),
      body: JSON.stringify({
        model: this.config.model,
        messages,
        stream: false,
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      logger.error("AI API error", { status: res.status, body });
      throw new Error(`AI API error ${res.status}: ${body}`);
    }

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content ?? "";

    logger.info("Chat response received", {
      contentLength: content.length,
    });

    return {
      content,
      updatedMarkdown: extractMarkdown(content),
    };
  }

  async *chatStream(request: ChatRequest): AsyncIterable<string> {
    logger.info("Starting streaming chat request", {
      model: this.config.model,
    });

    const messages = this.buildMessages(request);

    const res = await fetch(`${this.config.apiUrl}/chat/completions`, {
      method: "POST",
      headers: this.buildHeaders(),
      body: JSON.stringify({
        model: this.config.model,
        messages,
        stream: true,
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      logger.error("AI API stream error", { status: res.status, body });
      throw new Error(`AI API error ${res.status}: ${body}`);
    }

    const reader = res.body?.getReader();
    if (!reader) throw new Error("No response body");

    const decoder = new TextDecoder();
    let buffer = "";

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith("data: ")) continue;
          const data = trimmed.slice(6);
          if (data === "[DONE]") return;

          try {
            const parsed = JSON.parse(data);
            const delta = parsed.choices?.[0]?.delta?.content;
            if (delta) yield delta;
          } catch {
            // Skip malformed JSON lines
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }

  private buildMessages(request: ChatRequest): OpenAIChatMessage[] {
    const messages: OpenAIChatMessage[] = [
      {
        role: "system",
        content: this.config.systemPrompt,
      },
    ];

    // Add conversation history with rolling context window
    // Keep most recent messages that fit under ~4K tokens (~16K chars)
    const MAX_HISTORY_CHARS = 16000;
    const trimmedHistory = trimHistory(request.history, MAX_HISTORY_CHARS);

    for (const msg of trimmedHistory) {
      messages.push({
        role: msg.role,
        content: msg.content,
      });
    }

    // Add current context + user message
    const contextPrefix = `[Current presentation markdown]\n\`\`\`markdown\n${request.currentMarkdown}\n\`\`\`\n\n`;
    messages.push({
      role: "user",
      content: contextPrefix + request.userMessage,
    });

    return messages;
  }

  private buildHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (this.config.apiKey) {
      headers["Authorization"] = `Bearer ${this.config.apiKey}`;
    }
    return headers;
  }
}

/**
 * Extract markdown code block from AI response.
 * Looks for ```markdown ... ``` fenced blocks.
 */
function extractMarkdown(content: string): string | undefined {
  const match = content.match(/```markdown\n([\s\S]*?)```/);
  return match?.[1]?.trim();
}

/**
 * Trim conversation history to fit within a character budget.
 * Keeps the most recent messages, dropping oldest first.
 */
function trimHistory(
  history: ConversationMessage[],
  maxChars: number,
): ConversationMessage[] {
  let totalChars = 0;
  const result: ConversationMessage[] = [];

  // Iterate from newest to oldest
  for (let i = history.length - 1; i >= 0; i--) {
    const msgChars = history[i].content.length;
    if (totalChars + msgChars > maxChars) break;
    totalChars += msgChars;
    result.unshift(history[i]);
  }

  return result;
}
