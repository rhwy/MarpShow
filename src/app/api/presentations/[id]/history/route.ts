/**
 * API Route for presentation version history.
 * GET  /api/presentations/:id/history — Get version snapshots
 * POST /api/presentations/:id/history — Create a new version snapshot
 */

import { NextRequest, NextResponse } from "next/server";
import { getPresentationRepository } from "@/infrastructure/storage";
import { createVersionSnapshot } from "@/core/domain";
import { createLogger } from "@/infrastructure/logging";

const logger = createLogger("API:History");

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  logger.info("GET /api/presentations/:id/history", { id });

  try {
    const repo = getPresentationRepository();
    const history = await repo.getHistory(id);

    if (history === null) {
      return NextResponse.json(
        { error: "Presentation not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(history);
  } catch (err) {
    logger.error("Failed to get history", { id, err });
    return NextResponse.json(
      { error: "Failed to get history" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  logger.info("POST /api/presentations/:id/history", { id });

  try {
    const body = await request.json();
    const { title } = body;

    if (!title || typeof title !== "string") {
      return NextResponse.json(
        { error: "Version title is required" },
        { status: 400 },
      );
    }

    const repo = getPresentationRepository();

    // Get current presentation content for the snapshot
    const presentation = await repo.getById(id);
    if (!presentation) {
      return NextResponse.json(
        { error: "Presentation not found" },
        { status: 404 },
      );
    }

    // Determine next sequential ID
    const history = await repo.getHistory(id);
    const nextId = (history?.length ?? 0) + 1;

    const snapshot = createVersionSnapshot(
      nextId,
      title.trim(),
      presentation.markdown,
      presentation.css,
      presentation.js,
    );

    const updated = await repo.addVersionSnapshot(id, snapshot);

    return NextResponse.json(snapshot, { status: 201 });
  } catch (err) {
    logger.error("Failed to create version snapshot", { id, err });
    return NextResponse.json(
      { error: "Failed to create version" },
      { status: 500 },
    );
  }
}
