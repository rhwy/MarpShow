/**
 * API Routes for presentations collection.
 * GET  /api/presentations       — List all presentations (summaries)
 * POST /api/presentations       — Create a new presentation
 */

import { NextRequest, NextResponse } from "next/server";
import { getPresentationRepository } from "@/infrastructure/storage";
import { createPresentation, slugify } from "@/core/domain";
import { createLogger } from "@/infrastructure/logging";

const logger = createLogger("API:Presentations");

export async function GET() {
  logger.info("GET /api/presentations");

  try {
    const repo = getPresentationRepository();
    const presentations = await repo.list();
    return NextResponse.json(presentations);
  } catch (err) {
    logger.error("Failed to list presentations", err);
    return NextResponse.json(
      { error: "Failed to list presentations" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  logger.info("POST /api/presentations");

  try {
    const body = await request.json();
    const { title, description, author } = body;

    if (!title || typeof title !== "string") {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 },
      );
    }

    const id = slugify(title);
    const presentation = createPresentation(
      id,
      title,
      description ?? "",
      author ?? "",
    );

    const repo = getPresentationRepository();
    const created = await repo.create(presentation);

    logger.info("Presentation created via API", { id });
    return NextResponse.json(created.metadata, { status: 201 });
  } catch (err) {
    logger.error("Failed to create presentation", err);
    return NextResponse.json(
      { error: "Failed to create presentation" },
      { status: 500 },
    );
  }
}
