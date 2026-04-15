/**
 * Serve a media file from a presentation's folder.
 * GET /api/presentations/:id/media/:filename
 */

import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { createLogger } from "@/infrastructure/logging";

const logger = createLogger("API:MediaFile");
const STORAGE_PATH = process.env.STORAGE_PATH ?? "/data/presentations";

const MIME_TYPES: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".ogg": "video/ogg",
  ".pdf": "application/pdf",
  ".ico": "image/x-icon",
};

interface RouteParams {
  params: Promise<{ id: string; filename: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { id, filename } = await params;
  logger.debug("Serving media file", { id, filename });

  try {
    const filePath = path.join(STORAGE_PATH, id, filename);
    const data = await fs.readFile(filePath);
    const ext = path.extname(filename).toLowerCase();
    const contentType = MIME_TYPES[ext] ?? "application/octet-stream";

    return new NextResponse(data, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }
}
