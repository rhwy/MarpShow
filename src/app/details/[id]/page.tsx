"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, FileDown, FileText, FileSpreadsheet, PenTool } from "lucide-react";
import Link from "next/link";
import { exportPdf } from "@/ui/utils/export-pdf";
import { exportPptx } from "@/ui/utils/export-pptx";
import { exportMarkdown } from "@/ui/utils/export-markdown";
import { TopBar } from "@/ui/components/TopBar";
import { MarkdownViewer } from "@/ui/components/MarkdownViewer";
import { HistoryTimeline } from "@/ui/components/HistoryTimeline";
import { ChatBubble } from "@/ui/components/ChatBubble";
import type { Presentation } from "@/core/domain";
import { countSlides } from "@/core/domain";
import { createLogger } from "@/infrastructure/logging";

const logger = createLogger("DetailsPage");

export default function DetailsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params.id;

  const [presentation, setPresentation] = useState<Presentation | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      logger.info("Loading presentation details", { id });
      try {
        const res = await fetch(`/api/presentations/${id}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: Presentation = await res.json();
        setPresentation(data);
      } catch (err) {
        logger.error("Failed to load presentation", { id, err });
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen" style={{ backgroundColor: "var(--surface-primary)" }}>
        <TopBar />
        <div className="flex-1 flex items-center justify-center">
          <p style={{ color: "var(--fg-muted)" }}>Loading details...</p>
        </div>
      </div>
    );
  }

  if (!presentation) {
    return (
      <div className="flex flex-col min-h-screen" style={{ backgroundColor: "var(--surface-primary)" }}>
        <TopBar />
        <div className="flex-1 flex items-center justify-center">
          <p style={{ color: "var(--fg-muted)" }}>Presentation not found.</p>
        </div>
      </div>
    );
  }

  const slideCount = countSlides(presentation.markdown);

  return (
    <div
      className="flex flex-col h-screen overflow-hidden"
      style={{ backgroundColor: "var(--surface-primary)" }}
    >
      <TopBar />

      {/* Action bar */}
      <div
        className="flex items-center justify-between px-6 flex-shrink-0"
        style={{
          height: 52,
          backgroundColor: "var(--surface-card)",
          borderBottom: "1px solid var(--border-subtle)",
        }}
        data-testid="details-action-bar"
      >
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="flex items-center justify-center"
            style={{ color: "var(--fg-secondary)" }}
            aria-label="Go back"
          >
            <ArrowLeft size={18} />
          </button>
          <h1
            className="text-base font-semibold"
            style={{
              fontFamily: "var(--font-heading)",
              color: "var(--fg-primary)",
            }}
          >
            {presentation.metadata.title}
          </h1>
          <span
            className="text-xs px-2 py-0.5 rounded-full"
            style={{
              backgroundColor: "var(--surface-elevated)",
              color: "var(--fg-secondary)",
              fontFamily: "var(--font-mono)",
            }}
          >
            {slideCount} slides
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={`/editor/${id}`}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
            style={{
              background:
                "linear-gradient(90deg, var(--accent-primary), var(--accent-secondary))",
              color: "#FFF",
              fontFamily: "var(--font-body)",
              textDecoration: "none",
            }}
            data-testid="details-to-editor-link"
          >
            <PenTool size={14} />
            Edit
          </Link>
          <ExportButton
            icon={FileDown}
            label="PDF"
            onClick={() => exportPdf(id, presentation.metadata.title)}
          />
          <ExportButton
            icon={FileSpreadsheet}
            label="PPTX"
            onClick={() => exportPptx(presentation.markdown, presentation.metadata.title)}
          />
          <ExportButton
            icon={FileText}
            label="Markdown"
            onClick={() => exportMarkdown(presentation.markdown, presentation.metadata.title)}
          />
        </div>
      </div>

      {/* 3-column layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left — Markdown source */}
        <div
          className="flex flex-col h-full"
          style={{
            width: "33.33%",
            borderRight: "1px solid var(--border-subtle)",
          }}
        >
          <ColumnHeader title="Markdown Source" />
          <MarkdownViewer source={presentation.markdown} />
        </div>

        {/* Center — Change history */}
        <div
          className="flex flex-col h-full"
          style={{
            width: "33.33%",
            borderRight: "1px solid var(--border-subtle)",
          }}
        >
          <ColumnHeader title="Change History" />
          <HistoryTimeline entries={presentation.history} />
        </div>

        {/* Right — AI Conversation Log */}
        <div
          className="flex flex-col h-full"
          style={{ width: "33.34%" }}
        >
          <ColumnHeader title="AI Conversation Log" />
          <div
            className="flex-1 overflow-auto p-4 flex flex-col gap-2.5"
            data-testid="conversation-log"
          >
            {presentation.conversation.length === 0 ? (
              <p
                className="text-sm text-center py-8"
                style={{ color: "var(--fg-muted)" }}
              >
                No conversations yet.
              </p>
            ) : (
              presentation.conversation.map((msg) => (
                <ChatBubble
                  key={msg.id}
                  role={msg.role}
                  content={msg.content}
                  timestamp={new Date(msg.timestamp).toLocaleString("en-US", {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ColumnHeader({ title }: { title: string }) {
  return (
    <div
      className="flex items-center px-4 flex-shrink-0"
      style={{
        height: 36,
        borderBottom: "1px solid var(--border-subtle)",
      }}
    >
      <span
        className="text-xs font-medium"
        style={{
          fontFamily: "var(--font-body)",
          color: "var(--fg-secondary)",
        }}
      >
        {title}
      </span>
    </div>
  );
}

function ExportButton({
  icon: Icon,
  label,
  onClick,
}: {
  icon: React.ElementType;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
      style={{
        backgroundColor: "var(--surface-elevated)",
        color: "var(--fg-primary)",
        fontFamily: "var(--font-body)",
      }}
      data-testid={`export-${label.toLowerCase()}-btn`}
    >
      <Icon size={14} />
      {label}
    </button>
  );
}
