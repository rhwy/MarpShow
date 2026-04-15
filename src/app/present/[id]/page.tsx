"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  Maximize,
  Grid3X3,
  Settings,
} from "lucide-react";
import { SlideRenderer } from "@/ui/components/SlideRenderer";
import { createLogger } from "@/infrastructure/logging";

const logger = createLogger("PresentPage");

export default function PresentPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params.id;

  const [html, setHtml] = useState<string>("");
  const [slideCount, setSlideCount] = useState(0);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);

  // Fetch and render the presentation
  useEffect(() => {
    async function loadPresentation() {
      logger.info("Loading presentation for display", { id });
      try {
        const res = await fetch(`/api/presentations/${id}/render`, {
          method: "POST",
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setHtml(data.html);
        setSlideCount(data.slideCount);
        logger.info("Presentation loaded", { id, slideCount: data.slideCount });
      } catch (err) {
        logger.error("Failed to load presentation", { id, err });
      } finally {
        setLoading(false);
      }
    }
    loadPresentation();
  }, [id]);

  // Navigation helpers
  const goNext = useCallback(() => {
    setCurrentSlide((prev) => Math.min(prev + 1, slideCount - 1));
  }, [slideCount]);

  const goPrev = useCallback(() => {
    setCurrentSlide((prev) => Math.max(prev - 1, 0));
  }, []);

  const goBack = useCallback(() => {
    router.back();
  }, [router]);

  const toggleFullscreen = useCallback(() => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      document.documentElement.requestFullscreen();
    }
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowRight":
        case " ":
          e.preventDefault();
          goNext();
          break;
        case "ArrowLeft":
          e.preventDefault();
          goPrev();
          break;
        case "Escape":
          e.preventDefault();
          if (document.fullscreenElement) {
            document.exitFullscreen();
          } else {
            goBack();
          }
          break;
        case "f":
        case "F":
          e.preventDefault();
          toggleFullscreen();
          break;
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [goNext, goPrev, goBack, toggleFullscreen]);

  if (loading) {
    return (
      <div
        className="flex items-center justify-center min-h-screen"
        style={{ backgroundColor: "var(--surface-primary)" }}
      >
        <p style={{ color: "var(--fg-muted)" }}>Loading presentation...</p>
      </div>
    );
  }

  return (
    <div
      className="relative min-h-screen flex flex-col"
      style={{ backgroundColor: "var(--surface-primary)" }}
    >
      {/* Floating top control bar */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 flex items-center justify-between px-4 rounded-xl"
        style={{
          backgroundColor: "rgba(10, 10, 10, 0.8)",
          backdropFilter: "blur(16px)",
          height: 44,
          width: 600,
          maxWidth: "90vw",
        }}
      >
        {/* Left controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={goBack}
            className="flex items-center justify-center"
            style={{ color: "var(--fg-secondary)" }}
            aria-label="Go back"
          >
            <ArrowLeft size={18} />
          </button>
          <span
            className="text-sm"
            style={{
              fontFamily: "var(--font-mono)",
              color: "var(--fg-secondary)",
            }}
          >
            {currentSlide + 1} / {slideCount}
          </span>
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-4">
          <button
            onClick={toggleFullscreen}
            className="flex items-center justify-center"
            style={{ color: "var(--fg-secondary)" }}
            aria-label="Toggle fullscreen"
          >
            <Maximize size={18} />
          </button>
          <button
            className="flex items-center justify-center"
            style={{ color: "var(--fg-secondary)" }}
            aria-label="Grid view"
          >
            <Grid3X3 size={18} />
          </button>
          <button
            className="flex items-center justify-center"
            style={{ color: "var(--fg-secondary)" }}
            aria-label="Settings"
          >
            <Settings size={18} />
          </button>
        </div>
      </div>

      {/* Slide area */}
      <div className="flex-1 flex items-center justify-center px-16 py-20">
        <div
          className="relative w-full rounded-xl overflow-hidden"
          style={{
            maxWidth: "90%",
            aspectRatio: "16 / 9",
            boxShadow: "0 12px 24px rgba(0, 0, 0, 0.7)",
          }}
        >
          <SlideRenderer
            html={html}
            currentSlide={currentSlide}
            onSlideCount={setSlideCount}
          />
        </div>
      </div>

      {/* Left navigation arrow */}
      <button
        onClick={goPrev}
        disabled={currentSlide === 0}
        className="absolute left-5 top-1/2 -translate-y-1/2 flex items-center justify-center rounded-full transition-opacity"
        style={{
          width: 40,
          height: 40,
          backgroundColor: "rgba(255, 255, 255, 0.1)",
          color: "var(--fg-secondary)",
          opacity: currentSlide === 0 ? 0.3 : 1,
        }}
        aria-label="Previous slide"
      >
        <ChevronLeft size={20} />
      </button>

      {/* Right navigation arrow */}
      <button
        onClick={goNext}
        disabled={currentSlide >= slideCount - 1}
        className="absolute right-5 top-1/2 -translate-y-1/2 flex items-center justify-center rounded-full transition-opacity"
        style={{
          width: 40,
          height: 40,
          backgroundColor: "rgba(255, 255, 255, 0.1)",
          color: "var(--fg-secondary)",
          opacity: currentSlide >= slideCount - 1 ? 0.3 : 1,
        }}
        aria-label="Next slide"
      >
        <ChevronRight size={20} />
      </button>
    </div>
  );
}
