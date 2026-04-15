/**
 * API Route for AI assistant chat.
 * POST /api/presentations/:id/chat
 *
 * Accepts: { message: string, history: ConversationMessage[], markdown: string }
 * Returns: Server-Sent Events stream of AI response tokens.
 *
 * The final SSE event is [DONE] with the full response data including
 * any extracted markdown update.
 */

import { NextRequest } from "next/server";
import { getAIAssistant } from "@/infrastructure/ai";
import { createLogger } from "@/infrastructure/logging";

const logger = createLogger("API:Chat");

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  logger.info("POST /api/presentations/:id/chat", { id });

  try {
    const body = await request.json();
    const { message, history, markdown } = body;

    if (!message || typeof message !== "string") {
      return new Response(
        JSON.stringify({ error: "Message is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    const assistant = await getAIAssistant();

    // Use streaming to send tokens as SSE
    const encoder = new TextEncoder();
    let fullContent = "";

    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const token of assistant.chatStream({
            userMessage: message,
            currentMarkdown: markdown ?? "",
            history: history ?? [],
          })) {
            fullContent += token;
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ token })}\n\n`),
            );
          }

          // Send final event with full content and extracted markdown
          const updatedMarkdown = extractMarkdown(fullContent);
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                done: true,
                content: fullContent,
                updatedMarkdown: updatedMarkdown ?? null,
              })}\n\n`,
            ),
          );

          logger.info("Chat stream complete", {
            id,
            contentLength: fullContent.length,
            hasMarkdownUpdate: !!updatedMarkdown,
          });
        } catch (err) {
          logger.error("Chat stream error", { id, err });
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                error: "AI response failed. Check that your AI provider is running.",
              })}\n\n`,
            ),
          );
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (err) {
    logger.error("Chat request failed", { id, err });
    return new Response(
      JSON.stringify({ error: "Chat request failed" }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
}

function extractMarkdown(content: string): string | undefined {
  const match = content.match(/```markdown\n([\s\S]*?)```/);
  return match?.[1]?.trim();
}
