/**
 * API Route for presentation conversation persistence.
 * GET  /api/presentations/:id/conversation — Get conversation messages
 * PUT  /api/presentations/:id/conversation — Save conversation messages
 */

import { NextRequest, NextResponse } from "next/server";
import { getPresentationRepository } from "@/infrastructure/storage";
import { createLogger } from "@/infrastructure/logging";

const logger = createLogger("API:Conversation");

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  logger.info("GET /api/presentations/:id/conversation", { id });

  try {
    const repo = getPresentationRepository();
    const presentation = await repo.getById(id);

    if (!presentation) {
      return NextResponse.json(
        { error: "Presentation not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(presentation.conversation);
  } catch (err) {
    logger.error("Failed to get conversation", { id, err });
    return NextResponse.json(
      { error: "Failed to get conversation" },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  logger.info("PUT /api/presentations/:id/conversation", { id });

  try {
    const messages = await request.json();

    if (!Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Messages must be an array" },
        { status: 400 },
      );
    }

    const repo = getPresentationRepository();
    const saved = await repo.saveConversation(id, messages);

    if (!saved) {
      return NextResponse.json(
        { error: "Presentation not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    logger.error("Failed to save conversation", { id, err });
    return NextResponse.json(
      { error: "Failed to save conversation" },
      { status: 500 },
    );
  }
}
