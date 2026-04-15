/**
 * API Route for rendering a presentation's Marp markdown to HTML.
 * POST /api/presentations/:id/render
 *
 * Can also accept raw markdown in the request body for live preview.
 * Rewrites relative media paths (./file.png) to the API media endpoint.
 * Injects custom CSS and JS from the presentation.
 */

import { NextRequest, NextResponse } from "next/server";
import { getPresentationRepository } from "@/infrastructure/storage";
import { MarpCoreRenderer } from "@/infrastructure/marp";
import { rewriteMediaPaths } from "@/infrastructure/marp/rewrite-media-paths";
import { createLogger } from "@/infrastructure/logging";

const logger = createLogger("API:Render");
const renderer = new MarpCoreRenderer();

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  logger.info("POST /api/presentations/:id/render", { id });

  try {
    let markdown: string;
    let css: string | undefined;
    let js: string | undefined;

    // Check if request body has custom content (for live preview)
    const contentType = request.headers.get("content-type") ?? "";
    if (contentType.includes("application/json")) {
      const body = await request.json();
      markdown = body.markdown;
      css = body.css;
      js = body.js;
    } else {
      // Load from storage
      const repo = getPresentationRepository();
      const presentation = await repo.getById(id);

      if (!presentation) {
        return NextResponse.json(
          { error: "Presentation not found" },
          { status: 404 },
        );
      }

      markdown = presentation.markdown;
      css = presentation.css || undefined;
      js = presentation.js || undefined;
    }

    if (!markdown) {
      return NextResponse.json(
        { error: "No markdown content to render" },
        { status: 400 },
      );
    }

    const result = await renderer.render(markdown, css, js);

    // Rewrite relative media paths to the API endpoint
    const rewrittenHtml = rewriteMediaPaths(result.html, id);

    return NextResponse.json({
      ...result,
      html: rewrittenHtml,
    });
  } catch (err) {
    logger.error("Rendering failed", { id, err });
    return NextResponse.json(
      { error: "Rendering failed" },
      { status: 500 },
    );
  }
}
