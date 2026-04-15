"use client";

import { useState, useRef, useCallback, useEffect } from "react";

export interface ResizablePanelsProps {
  /** Left panel content */
  left: React.ReactNode;
  /** Right panel content */
  right: React.ReactNode;
  /** Initial left panel width as percentage (0-100). Default: 50 */
  initialLeftPercent?: number;
  /** Minimum left panel width as percentage. Default: 20 */
  minLeftPercent?: number;
  /** Maximum left panel width as percentage. Default: 80 */
  maxLeftPercent?: number;
  /** Additional CSS class for the container */
  className?: string;
}

/**
 * ResizablePanels — two horizontal panels with a draggable divider.
 *
 * Drag the divider to resize. Double-click to reset to initial size.
 */
export function ResizablePanels({
  left,
  right,
  initialLeftPercent = 50,
  minLeftPercent = 20,
  maxLeftPercent = 80,
  className = "",
}: ResizablePanelsProps) {
  const [leftPercent, setLeftPercent] = useState(initialLeftPercent);
  const containerRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      draggingRef.current = true;
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    },
    [],
  );

  const handleDoubleClick = useCallback(() => {
    setLeftPercent(initialLeftPercent);
  }, [initialLeftPercent]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!draggingRef.current || !containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percent = (x / rect.width) * 100;
      const clamped = Math.min(maxLeftPercent, Math.max(minLeftPercent, percent));
      setLeftPercent(clamped);
    };

    const handleMouseUp = () => {
      if (draggingRef.current) {
        draggingRef.current = false;
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
      }
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [minLeftPercent, maxLeftPercent]);

  return (
    <div
      ref={containerRef}
      className={`flex h-full overflow-hidden ${className}`}
      data-testid="resizable-panels"
    >
      {/* Left panel */}
      <div
        className="flex flex-col h-full overflow-hidden"
        style={{ width: `${leftPercent}%`, minWidth: 0 }}
      >
        {left}
      </div>

      {/* Divider */}
      <div
        className="flex-shrink-0 flex items-center justify-center cursor-col-resize group"
        style={{
          width: 6,
          backgroundColor: "var(--surface-primary)",
          borderLeft: "1px solid var(--border-subtle)",
          borderRight: "1px solid var(--border-subtle)",
        }}
        onMouseDown={handleMouseDown}
        onDoubleClick={handleDoubleClick}
        data-testid="panel-divider"
      >
        <div
          className="w-0.5 h-8 rounded-full transition-colors group-hover:bg-[var(--accent-primary)]"
          style={{ backgroundColor: "var(--fg-muted)" }}
        />
      </div>

      {/* Right panel */}
      <div
        className="flex flex-col h-full overflow-hidden"
        style={{ width: `${100 - leftPercent}%`, minWidth: 0 }}
      >
        {right}
      </div>
    </div>
  );
}
