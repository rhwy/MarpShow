"use client";

import { useState, useEffect } from "react";
import { CodeEditor } from "@/ui/components/CodeEditor";
import { createLogger } from "@/infrastructure/logging";

const logger = createLogger("ThemeViewer");

export interface ThemeViewerProps {
  /** Current markdown content to extract theme name from frontmatter */
  markdown: string;
}

/**
 * ThemeViewer — read-only display of the active theme's CSS.
 *
 * Parses the `theme:` directive from the Marp frontmatter,
 * fetches the CSS from the themes API, and shows it in a
 * read-only CodeMirror editor for reference.
 */
export function ThemeViewer({ markdown }: ThemeViewerProps) {
  const [themeName, setThemeName] = useState("default");
  const [themeCss, setThemeCss] = useState("");
  const [loading, setLoading] = useState(false);

  // Extract theme name from frontmatter
  useEffect(() => {
    const match = markdown.match(/^---[\s\S]*?theme:\s*(\S+)[\s\S]*?---/m);
    const name = match?.[1] ?? "default";
    if (name !== themeName) {
      setThemeName(name);
    }
  }, [markdown, themeName]);

  // Load theme CSS when theme name changes
  useEffect(() => {
    async function loadTheme() {
      setLoading(true);
      try {
        const res = await fetch(`/api/themes/${themeName}`);
        if (res.ok) {
          const data = await res.json();
          setThemeCss(data.css || `/* Built-in Marp theme: ${themeName} */\n/* This theme is provided by Marp Core. */\n/* Reference: theme: ${themeName} */`);
        } else {
          setThemeCss(`/* Theme "${themeName}" not found */\n/* Check the theme name in your frontmatter. */\n/* Available built-in themes: default, gaia, uncover */`);
        }
      } catch (err) {
        logger.error("Failed to load theme CSS", { themeName, err });
        setThemeCss(`/* Failed to load theme "${themeName}" */`);
      } finally {
        setLoading(false);
      }
    }
    loadTheme();
  }, [themeName]);

  return (
    <div
      className="flex flex-col h-full"
      style={{ backgroundColor: "var(--surface-primary)" }}
      data-testid="theme-viewer"
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 flex-shrink-0"
        style={{
          height: 32,
          borderBottom: "1px solid var(--border-subtle)",
        }}
      >
        <span
          className="text-xs"
          style={{ fontFamily: "var(--font-body)", color: "var(--fg-muted)" }}
        >
          Active theme:
        </span>
        <code
          className="text-xs px-2 py-0.5 rounded"
          style={{
            fontFamily: "var(--font-mono)",
            color: "var(--accent-primary)",
            backgroundColor: "var(--surface-elevated)",
          }}
        >
          {loading ? "loading..." : themeName}
        </code>
      </div>

      {/* Read-only CSS editor */}
      <CodeEditor
        value={themeCss}
        language="css"
      />
    </div>
  );
}
