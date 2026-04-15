"use client";

import { useState } from "react";
import { Play } from "lucide-react";
import { SlideRenderer } from "@/ui/components/SlideRenderer";

export interface PreviewPanelProps {
  /** Rendered HTML from Marp */
  html: string;
  /** Presentation ID for the Present button link */
  presentationId: string;
  /** Called when Present button is clicked */
  onPresent?: () => void;
  /** Current slide index from the editor cursor position */
  currentSlide?: number;
}

/**
 * PreviewPanel — live preview of Marp slides with header, navigation dots,
 * slide counter, and Present button.
 */
export function PreviewPanel({
  html,
  presentationId,
  onPresent,
  currentSlide: externalSlide,
}: PreviewPanelProps) {
  const [slideCount, setSlideCount] = useState(0);
  const [internalSlide, setInternalSlide] = useState(0);

  // Use external slide index (from editor cursor) if provided, otherwise internal
  const currentSlide = externalSlide ?? internalSlide;
  const setCurrentSlide = setInternalSlide;

  return (
    <div
      className="flex flex-col h-full"
      style={{ backgroundColor: "#111111" }}
      data-testid="preview-panel"
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-3"
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
          Preview
        </span>

        <div className="flex items-center gap-2">
          <span
            className="text-[11px]"
            style={{
              fontFamily: "var(--font-mono)",
              color: "var(--fg-muted)",
            }}
          >
            {currentSlide + 1} / {slideCount || 1}
          </span>
          <button
            onClick={onPresent}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium"
            style={{
              background:
                "linear-gradient(90deg, var(--accent-primary), var(--accent-secondary))",
              color: "#FFF",
              fontFamily: "var(--font-body)",
            }}
            data-testid="present-button"
          >
            <Play size={11} />
            Present
          </button>
        </div>
      </div>

      {/* Slide preview area */}
      <div className="flex-1 flex flex-col justify-center p-6">
        <div
          className="relative rounded-lg overflow-hidden"
          style={{
            aspectRatio: "16 / 9",
            boxShadow: "0 12px 24px rgba(0, 0, 0, 0.7)",
            backgroundColor: "#0F0F1A",
          }}
        >
          <SlideRenderer
            html={html}
            currentSlide={currentSlide}
            onSlideCount={setSlideCount}
          />
        </div>

        {/* Navigation dots */}
        <div className="flex items-center justify-center gap-1.5 pt-2">
          {Array.from({ length: slideCount || 1 }).map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentSlide(i)}
              aria-label={`Go to slide ${i + 1}`}
              className="rounded-full transition-all"
              style={{
                width: i === currentSlide ? 8 : 6,
                height: i === currentSlide ? 8 : 6,
                backgroundColor:
                  i === currentSlide
                    ? "var(--accent-primary)"
                    : "var(--fg-muted)",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
