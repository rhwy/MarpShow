"use client";

import type { VersionSnapshot } from "@/core/domain";

export interface HistoryTimelineProps {
  entries: VersionSnapshot[];
}

/**
 * HistoryTimeline — vertical timeline of version snapshots.
 *
 * Shows version ID, title, and timestamp. Most recent first.
 */
export function HistoryTimeline({ entries }: HistoryTimelineProps) {
  const sorted = [...entries].reverse();

  return (
    <div
      className="flex-1 overflow-auto p-4"
      style={{ backgroundColor: "var(--surface-primary)" }}
      data-testid="history-timeline"
    >
      {sorted.length === 0 ? (
        <p
          className="text-sm text-center py-8"
          style={{ color: "var(--fg-muted)" }}
        >
          No versions saved yet.
        </p>
      ) : (
        <div className="flex flex-col gap-1">
          {sorted.map((entry, i) => (
            <div key={entry.id} className="flex gap-3" data-testid="history-entry">
              {/* Timeline dot and line */}
              <div className="flex flex-col items-center pt-1.5">
                <div
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: "var(--accent-primary)" }}
                />
                {i < sorted.length - 1 && (
                  <div
                    className="w-px flex-1 mt-1"
                    style={{ backgroundColor: "var(--border-subtle)" }}
                  />
                )}
              </div>

              {/* Entry content */}
              <div className="flex flex-col gap-1 pb-4 min-w-0">
                <div className="flex items-center gap-2">
                  <span
                    className="text-[10px] px-1.5 py-0.5 rounded"
                    style={{
                      backgroundColor: "var(--surface-elevated)",
                      color: "var(--accent-primary)",
                      fontFamily: "var(--font-mono)",
                    }}
                  >
                    v{entry.id}
                  </span>
                  <span
                    className="text-sm font-medium"
                    style={{
                      fontFamily: "var(--font-body)",
                      color: "var(--fg-primary)",
                    }}
                  >
                    {entry.title}
                  </span>
                </div>
                <span
                  className="text-[10px]"
                  style={{
                    fontFamily: "var(--font-caption)",
                    color: "var(--fg-muted)",
                  }}
                >
                  {formatTimestamp(entry.timestamp)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function formatTimestamp(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
