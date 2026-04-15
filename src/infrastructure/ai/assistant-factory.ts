/**
 * Factory for creating the AIAssistant.
 *
 * Reads configuration from settings.json first (UI-configurable),
 * then falls back to environment variables.
 * Recreates the instance when config changes (no singleton cache).
 */

import { promises as fs } from "fs";
import path from "path";
import type { AIAssistant, AIAssistantConfig } from "@/core/ports";
import type { AppSettings } from "@/core/domain";
import { OpenAICompatibleAssistant } from "./openai-compatible-assistant";
import { DEFAULT_SYSTEM_PROMPT } from "./system-prompt";
import { createLogger } from "@/infrastructure/logging";

const logger = createLogger("AIAssistantFactory");

const STORAGE_PATH = process.env.STORAGE_PATH ?? "/data/presentations";
const SETTINGS_FILE = path.join(STORAGE_PATH, "settings.json");

async function loadSettingsAI(): Promise<{
  apiUrl?: string;
  model?: string;
  apiKey?: string;
} | null> {
  try {
    const content = await fs.readFile(SETTINGS_FILE, "utf-8");
    const settings = JSON.parse(content) as AppSettings;
    return settings.ai ?? null;
  } catch {
    return null;
  }
}

export async function getAIAssistantConfig(): Promise<AIAssistantConfig> {
  const savedAI = await loadSettingsAI();

  return {
    apiUrl:
      savedAI?.apiUrl || process.env.AI_API_URL || "http://localhost:11434/v1",
    model: savedAI?.model || process.env.AI_MODEL || "gemma4",
    apiKey: savedAI?.apiKey || process.env.AI_API_KEY || undefined,
    systemPrompt: process.env.AI_SYSTEM_PROMPT || DEFAULT_SYSTEM_PROMPT,
  };
}

export async function getAIAssistant(): Promise<AIAssistant> {
  const config = await getAIAssistantConfig();
  logger.info("Creating AI assistant", {
    apiUrl: config.apiUrl,
    model: config.model,
    hasApiKey: !!config.apiKey,
  });
  // Always create fresh — config may have changed in settings UI
  return new OpenAICompatibleAssistant(config);
}
