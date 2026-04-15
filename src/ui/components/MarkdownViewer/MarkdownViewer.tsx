"use client";

export interface MarkdownViewerProps {
  /** Raw markdown source to display */
  source: string;
}

/**
 * MarkdownViewer — read-only, line-numbered, monospace display of markdown.
 *
 * Used on the Details page to show the full Marp source.
 */
export function MarkdownViewer({ source }: MarkdownViewerProps) {
  const lines = source.split("\n");

  return (
    <div
      className="flex-1 overflow-auto font-mono text-xs leading-relaxed p-4"
      style={{ backgroundColor: "var(--surface-primary)" }}
      data-testid="markdown-viewer"
    >
      {lines.map((line, i) => (
        <div key={i} className="flex gap-3" style={{ minHeight: "1.6em" }}>
          <span
            className="select-none text-right flex-shrink-0"
            style={{
              width: 28,
              color: "var(--fg-muted)",
              fontFamily: "var(--font-mono)",
            }}
          >
            {i + 1}
          </span>
          <span
            style={{
              color: getLineColor(line),
              fontFamily: "var(--font-mono)",
            }}
          >
            {line || "\u00A0"}
          </span>
        </div>
      ))}
    </div>
  );
}

/**
 * Simple syntax coloring based on line content.
 */
function getLineColor(line: string): string {
  const trimmed = line.trim();
  if (trimmed === "---") return "var(--fg-muted)";
  if (trimmed.startsWith("#")) return "var(--accent-secondary)";
  if (trimmed.startsWith("marp:") || trimmed.startsWith("theme:") || trimmed.startsWith("paginate:"))
    return "var(--accent-primary)";
  if (trimmed.startsWith("-") || trimmed.startsWith("*")) return "var(--fg-primary)";
  return "var(--fg-primary)";
}
