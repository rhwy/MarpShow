/**
 * API Routes for theme management.
 * GET  /api/themes       — List all themes (built-in + custom)
 * POST /api/themes       — Create a new custom theme
 */

import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { createLogger } from "@/infrastructure/logging";
import { slugifyDeterministic } from "@/core/domain";

const logger = createLogger("API:Themes");

const STORAGE_PATH = process.env.STORAGE_PATH ?? "/data/presentations";
const THEMES_DIR = path.join(STORAGE_PATH, "themes");

/** Marp built-in themes that are always available */
const BUILTIN_THEMES = [
  { id: "default", name: "default", description: "Marp built-in: clean, minimal theme", builtin: true },
  { id: "gaia", name: "gaia", description: "Marp built-in: modern, colorful gradient theme", builtin: true },
  { id: "uncover", name: "uncover", description: "Marp built-in: dark, presentation-focused theme", builtin: true },
];

export interface ThemeInfo {
  id: string;
  name: string;
  description: string;
  builtin: boolean;
  css?: string;
}

async function getCustomThemes(): Promise<ThemeInfo[]> {
  try {
    await fs.mkdir(THEMES_DIR, { recursive: true });
    const files = await fs.readdir(THEMES_DIR);
    const themes: ThemeInfo[] = [];

    for (const file of files) {
      if (!file.endsWith(".css")) continue;
      const css = await fs.readFile(path.join(THEMES_DIR, file), "utf-8");
      const nameMatch = css.match(/@theme\s+(\S+)/);
      const descMatch = css.match(/@description\s+(.+)/);
      const themeName = nameMatch?.[1] ?? file.replace(".css", "");

      themes.push({
        id: themeName,
        name: themeName,
        description: descMatch?.[1]?.trim() ?? "Custom theme",
        builtin: false,
      });
    }

    return themes;
  } catch {
    return [];
  }
}

export async function GET() {
  logger.info("GET /api/themes");
  try {
    const custom = await getCustomThemes();
    return NextResponse.json([...BUILTIN_THEMES, ...custom]);
  } catch (err) {
    logger.error("Failed to list themes", err);
    return NextResponse.json(BUILTIN_THEMES);
  }
}

export async function POST(request: NextRequest) {
  logger.info("POST /api/themes");
  try {
    const body = await request.json();
    const { name, css } = body;

    if (!name || !css) {
      return NextResponse.json(
        { error: "Name and CSS are required" },
        { status: 400 },
      );
    }

    // Slugify the name for filename safety
    const slug = slugifyDeterministic(name);
    if (!slug) {
      return NextResponse.json(
        { error: "Invalid theme name" },
        { status: 400 },
      );
    }

    // Ensure CSS has the @theme directive
    let themeCss = css;
    if (!themeCss.includes("@theme")) {
      themeCss = `/*\n * @theme ${slug}\n */\n\n${themeCss}`;
    }

    await fs.mkdir(THEMES_DIR, { recursive: true });
    await fs.writeFile(path.join(THEMES_DIR, `${slug}.css`), themeCss, "utf-8");

    logger.info("Theme created", { name: slug });
    return NextResponse.json(
      { id: slug, name: slug, description: "Custom theme", builtin: false },
      { status: 201 },
    );
  } catch (err) {
    logger.error("Failed to create theme", err);
    return NextResponse.json(
      { error: "Failed to create theme" },
      { status: 500 },
    );
  }
}
