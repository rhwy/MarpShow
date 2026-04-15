/**
 * AIAssistant port — contract for AI-powered slide editing assistance.
 *
 * Implementations use an OpenAI-compatible chat completions API.
 * The assistant receives the current presentation context (markdown,
 * conversation history) and returns suggestions or modified content.
 */

import type { ConversationMessage } from "@/core/domain";

export interface AIAssistantConfig {
  /** Base URL of the OpenAI-compatible API (e.g. http://localhost:11434/v1) */
  apiUrl: string;
  /** Model name (e.g. gemma4, claude-sonnet-4-20250514, gpt-4o) */
  model: string;
  /** API key (optional for local providers like Ollama) */
  apiKey?: string;
  /** System prompt that sets the assistant's behavior */
  systemPrompt: string;
}

export interface ChatRequest {
  /** User's new message */
  userMessage: string;
  /** Current Marp markdown for context */
  currentMarkdown: string;
  /** Conversation history */
  history: ConversationMessage[];
}

export interface ChatResponse {
  /** The assistant's reply text */
  content: string;
  /** Optional: updated markdown if the assistant modified it */
  updatedMarkdown?: string;
}

export interface AIAssistant {
  /**
   * Send a message and get a complete response.
   */
  chat(request: ChatRequest): Promise<ChatResponse>;

  /**
   * Send a message and stream the response token by token.
   * Yields partial content strings.
   */
  chatStream(request: ChatRequest): AsyncIterable<string>;
}
