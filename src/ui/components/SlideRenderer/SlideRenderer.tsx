"use client";

import { useRef, useEffect } from "react";

export interface SlideRendererProps {
  /** Full HTML document string to render in the iframe */
  html: string;
  /** Current slide index (0-based) to scroll to */
  currentSlide?: number;
  /** Callback when slide count is determined from the rendered content */
  onSlideCount?: (count: number) => void;
  /** Additional CSS class for the container */
  className?: string;
}

/**
 * SlideRenderer — renders Marp HTML output in a sandboxed iframe.
 *
 * The component injects the HTML into an iframe and can scroll to
 * a specific slide by index. It uses srcdoc for safe rendering.
 */
export function SlideRenderer({
  html,
  currentSlide = 0,
  onSlideCount,
  className = "",
}: SlideRendererProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Scroll to the current slide when it changes
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const handleLoad = () => {
      const doc = iframe.contentDocument;
      if (!doc) return;

      // Count slides (Marp uses <section> elements)
      const sections = doc.querySelectorAll("section");
      if (onSlideCount) {
        onSlideCount(sections.length);
      }

      // Scroll to the target slide
      if (sections[currentSlide]) {
        sections[currentSlide].scrollIntoView({ behavior: "instant" });
      }
    };

    iframe.addEventListener("load", handleLoad);
    return () => iframe.removeEventListener("load", handleLoad);
  }, [html, currentSlide, onSlideCount]);

  // When currentSlide changes (but html hasn't), scroll within existing iframe
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe?.contentDocument) return;

    const sections = iframe.contentDocument.querySelectorAll("section");
    if (sections[currentSlide]) {
      sections[currentSlide].scrollIntoView({ behavior: "smooth" });
    }
  }, [currentSlide]);

  return (
    <div
      className={`relative w-full h-full ${className}`}
      data-testid="slide-renderer"
    >
      <iframe
        ref={iframeRef}
        srcDoc={html}
        title="Slide Preview"
        sandbox="allow-scripts allow-same-origin"
        className="w-full h-full border-0"
        style={{ backgroundColor: "var(--surface-primary)" }}
      />
    </div>
  );
}
