/**
 * API Routes for a single presentation.
 * GET    /api/presentations/:id  — Get full presentation
 * PUT    /api/presentations/:id  — Update presentation content
 * PATCH  /api/presentations/:id  — Update presentation metadata
 * DELETE /api/presentations/:id  — Delete presentation
 */

import { NextRequest, NextResponse } from "next/server";
import { getPresentationRepository } from "@/infrastructure/storage";
import { createLogger } from "@/infrastructure/logging";

const logger = createLogger("API:Presentation");

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  logger.info("GET /api/presentations/:id", { id });

  try {
    const repo = getPresentationRepository();
    const presentation = await repo.getById(id);

    if (!presentation) {
      return NextResponse.json(
        { error: "Presentation not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(presentation);
  } catch (err) {
    logger.error("Failed to get presentation", { id, err });
    return NextResponse.json(
      { error: "Failed to get presentation" },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  logger.info("PUT /api/presentations/:id", { id });

  try {
    const body = await request.json();
    const { markdown, css, js } = body;

    const repo = getPresentationRepository();
    const updated = await repo.updateContent(id, { markdown, css, js });

    if (!updated) {
      return NextResponse.json(
        { error: "Presentation not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(updated);
  } catch (err) {
    logger.error("Failed to update presentation content", { id, err });
    return NextResponse.json(
      { error: "Failed to update presentation" },
      { status: 500 },
    );
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  logger.info("PATCH /api/presentations/:id", { id });

  try {
    const body = await request.json();
    const { title, description, theme, plugins } = body;

    const repo = getPresentationRepository();
    const updated = await repo.updateMetadata(id, {
      title,
      description,
      theme,
      plugins,
    });

    if (!updated) {
      return NextResponse.json(
        { error: "Presentation not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(updated.metadata);
  } catch (err) {
    logger.error("Failed to update presentation metadata", { id, err });
    return NextResponse.json(
      { error: "Failed to update metadata" },
      { status: 500 },
    );
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  logger.info("DELETE /api/presentations/:id", { id });

  try {
    const repo = getPresentationRepository();
    const deleted = await repo.delete(id);

    if (!deleted) {
      return NextResponse.json(
        { error: "Presentation not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    logger.error("Failed to delete presentation", { id, err });
    return NextResponse.json(
      { error: "Failed to delete presentation" },
      { status: 500 },
    );
  }
}
