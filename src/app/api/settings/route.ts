/**
 * API Route for application settings.
 * GET  /api/settings — Get current settings
 * PUT  /api/settings — Save settings
 */

import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { createDefaultSettings } from "@/core/domain";
import type { AppSettings } from "@/core/domain";
import { createLogger } from "@/infrastructure/logging";

const logger = createLogger("API:Settings");

const STORAGE_PATH = process.env.STORAGE_PATH ?? "/data/presentations";
const SETTINGS_FILE = path.join(STORAGE_PATH, "settings.json");

async function loadSettings(): Promise<AppSettings> {
  try {
    const content = await fs.readFile(SETTINGS_FILE, "utf-8");
    return JSON.parse(content) as AppSettings;
  } catch {
    return createDefaultSettings();
  }
}

async function saveSettings(settings: AppSettings): Promise<void> {
  await fs.mkdir(path.dirname(SETTINGS_FILE), { recursive: true });
  await fs.writeFile(SETTINGS_FILE, JSON.stringify(settings, null, 2), "utf-8");
}

export async function GET() {
  logger.info("GET /api/settings");
  try {
    const settings = await loadSettings();
    return NextResponse.json(settings);
  } catch (err) {
    logger.error("Failed to load settings", err);
    return NextResponse.json(createDefaultSettings());
  }
}

export async function PUT(request: NextRequest) {
  logger.info("PUT /api/settings");
  try {
    const settings = (await request.json()) as AppSettings;
    await saveSettings(settings);
    logger.info("Settings saved");
    return NextResponse.json(settings);
  } catch (err) {
    logger.error("Failed to save settings", err);
    return NextResponse.json(
      { error: "Failed to save settings" },
      { status: 500 },
    );
  }
}
