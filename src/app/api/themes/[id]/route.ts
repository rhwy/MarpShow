/**
 * API Routes for a single theme.
 * GET    /api/themes/:id  — Get theme CSS content
 * PUT    /api/themes/:id  — Update theme CSS
 * DELETE /api/themes/:id  — Delete custom theme
 */

import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { createLogger } from "@/infrastructure/logging";

const logger = createLogger("API:Theme");

const STORAGE_PATH = process.env.STORAGE_PATH ?? "/data/presentations";
const THEMES_DIR = path.join(STORAGE_PATH, "themes");
const BUILTIN_IDS = new Set(["default", "gaia", "uncover"]);

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  logger.info("GET /api/themes/:id", { id });

  if (BUILTIN_IDS.has(id)) {
    return NextResponse.json({
      id,
      name: id,
      builtin: true,
      css: `/* Built-in Marp theme: ${id} */\n/* This theme is provided by Marp Core and cannot be edited. */\n/* Reference it in your markdown frontmatter: theme: ${id} */`,
    });
  }

  try {
    const filePath = path.join(THEMES_DIR, `${id}.css`);
    const css = await fs.readFile(filePath, "utf-8");
    return NextResponse.json({ id, name: id, builtin: false, css });
  } catch {
    return NextResponse.json(
      { error: "Theme not found" },
      { status: 404 },
    );
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  logger.info("PUT /api/themes/:id", { id });

  if (BUILTIN_IDS.has(id)) {
    return NextResponse.json(
      { error: "Cannot edit built-in themes" },
      { status: 400 },
    );
  }

  try {
    const body = await request.json();
    const { css } = body;

    if (!css) {
      return NextResponse.json(
        { error: "CSS content required" },
        { status: 400 },
      );
    }

    // Ensure @theme directive matches the ID
    let themeCss = css;
    if (!themeCss.includes(`@theme ${id}`)) {
      // Replace or add @theme directive
      themeCss = themeCss.replace(/@theme\s+\S+/, `@theme ${id}`);
      if (!themeCss.includes("@theme")) {
        themeCss = `/*\n * @theme ${id}\n */\n\n${themeCss}`;
      }
    }

    await fs.mkdir(THEMES_DIR, { recursive: true });
    await fs.writeFile(path.join(THEMES_DIR, `${id}.css`), themeCss, "utf-8");

    logger.info("Theme updated", { id });
    return NextResponse.json({ id, name: id, builtin: false, css: themeCss });
  } catch (err) {
    logger.error("Failed to update theme", { id, err });
    return NextResponse.json(
      { error: "Failed to update theme" },
      { status: 500 },
    );
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  logger.info("DELETE /api/themes/:id", { id });

  if (BUILTIN_IDS.has(id)) {
    return NextResponse.json(
      { error: "Cannot delete built-in themes" },
      { status: 400 },
    );
  }

  try {
    await fs.unlink(path.join(THEMES_DIR, `${id}.css`));
    logger.info("Theme deleted", { id });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Theme not found" },
      { status: 404 },
    );
  }
}
