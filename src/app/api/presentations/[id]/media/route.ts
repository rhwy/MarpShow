/**
 * API Routes for presentation media files.
 * GET    /api/presentations/:id/media       — List media files
 * POST   /api/presentations/:id/media       — Upload media file(s)
 * DELETE /api/presentations/:id/media?file=  — Delete a media file
 */

import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { createLogger } from "@/infrastructure/logging";

const logger = createLogger("API:Media");

const STORAGE_PATH = process.env.STORAGE_PATH ?? "/data/presentations";
const ALLOWED_EXTENSIONS = new Set([
  ".png", ".jpg", ".jpeg", ".gif", ".svg", ".webp",
  ".mp4", ".webm", ".ogg",
  ".pdf", ".ico",
]);

interface RouteParams {
  params: Promise<{ id: string }>;
}

function mediaDir(id: string): string {
  return path.join(STORAGE_PATH, id);
}

function isMediaFile(filename: string): boolean {
  const ext = path.extname(filename).toLowerCase();
  return ALLOWED_EXTENSIONS.has(ext);
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  logger.info("GET /api/presentations/:id/media", { id });

  try {
    const dir = mediaDir(id);
    const entries = await fs.readdir(dir, { withFileTypes: true });

    const mediaFiles = entries
      .filter((e) => e.isFile() && isMediaFile(e.name))
      .map((e) => ({
        name: e.name,
        path: `/api/presentations/${id}/media/${e.name}`,
        markdownRef: `![${e.name}](./${e.name})`,
      }));

    return NextResponse.json(mediaFiles);
  } catch (err) {
    logger.error("Failed to list media", { id, err });
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  logger.info("POST /api/presentations/:id/media", { id });

  try {
    const formData = await request.formData();
    const files = formData.getAll("files") as File[];

    if (files.length === 0) {
      return NextResponse.json(
        { error: "No files provided" },
        { status: 400 },
      );
    }

    const dir = mediaDir(id);
    await fs.mkdir(dir, { recursive: true });

    const uploaded: string[] = [];

    for (const file of files) {
      const ext = path.extname(file.name).toLowerCase();
      if (!ALLOWED_EXTENSIONS.has(ext)) {
        logger.warn("Skipping file with disallowed extension", {
          name: file.name,
          ext,
        });
        continue;
      }

      // Sanitize filename
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const filePath = path.join(dir, safeName);
      const buffer = Buffer.from(await file.arrayBuffer());
      await fs.writeFile(filePath, buffer);
      uploaded.push(safeName);
      logger.info("Media file uploaded", { id, name: safeName });
    }

    return NextResponse.json({ uploaded }, { status: 201 });
  } catch (err) {
    logger.error("Failed to upload media", { id, err });
    return NextResponse.json(
      { error: "Failed to upload media" },
      { status: 500 },
    );
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  logger.info("PATCH /api/presentations/:id/media", { id });

  try {
    const body = await request.json();
    const { oldName, newName } = body;

    if (!oldName || !newName) {
      return NextResponse.json(
        { error: "oldName and newName are required" },
        { status: 400 },
      );
    }

    const safeName = newName.replace(/[^a-zA-Z0-9._-]/g, "_");
    const ext = path.extname(safeName).toLowerCase();
    if (!ALLOWED_EXTENSIONS.has(ext)) {
      return NextResponse.json(
        { error: "File extension not allowed" },
        { status: 400 },
      );
    }

    const dir = mediaDir(id);
    const oldPath = path.join(dir, oldName);
    const newPath = path.join(dir, safeName);

    await fs.rename(oldPath, newPath);
    logger.info("Media file renamed", { id, from: oldName, to: safeName });

    return NextResponse.json({
      name: safeName,
      path: `/api/presentations/${id}/media/${safeName}`,
      markdownRef: `![${safeName}](./${safeName})`,
    });
  } catch (err) {
    logger.error("Failed to rename media", { id, err });
    return NextResponse.json(
      { error: "Failed to rename file" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const url = new URL(request.url);
  const fileName = url.searchParams.get("file");

  logger.info("DELETE /api/presentations/:id/media", { id, fileName });

  if (!fileName) {
    return NextResponse.json(
      { error: "File name required" },
      { status: 400 },
    );
  }

  try {
    const filePath = path.join(mediaDir(id), fileName);
    await fs.unlink(filePath);
    logger.info("Media file deleted", { id, name: fileName });
    return NextResponse.json({ success: true });
  } catch (err) {
    logger.error("Failed to delete media", { id, fileName, err });
    return NextResponse.json(
      { error: "File not found" },
      { status: 404 },
    );
  }
}
