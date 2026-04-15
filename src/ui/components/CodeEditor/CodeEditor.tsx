"use client";

import { useRef, useEffect, useCallback } from "react";
import { EditorView, basicSetup } from "codemirror";
import { EditorState } from "@codemirror/state";
import { markdown } from "@codemirror/lang-markdown";
import { css } from "@codemirror/lang-css";
import { javascript } from "@codemirror/lang-javascript";
import { oneDark } from "@codemirror/theme-one-dark";
import { ViewUpdate } from "@codemirror/view";

export type EditorLanguage = "markdown" | "css" | "javascript";

export interface CodeEditorProps {
  /** The source code to display */
  value: string;
  /** Language for syntax highlighting */
  language: EditorLanguage;
  /** Called when the content changes (debounced externally if needed) */
  onChange?: (value: string) => void;
  /** Called when the cursor moves to a different slide (0-based index) */
  onCursorSlide?: (slideIndex: number) => void;
  /** Additional CSS class for the container */
  className?: string;
}

function getLanguageExtension(lang: EditorLanguage) {
  switch (lang) {
    case "markdown":
      return markdown();
    case "css":
      return css();
    case "javascript":
      return javascript();
  }
}

/**
 * CodeEditor — CodeMirror 6 wrapper with dark theme and syntax highlighting.
 *
 * Supports markdown, CSS, and JavaScript languages.
 * Isolated, props-driven, no internal state management of the source value.
 */
export function CodeEditor({
  value,
  language,
  onChange,
  onCursorSlide,
  className = "",
}: CodeEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const onChangeRef = useRef(onChange);
  const onCursorSlideRef = useRef(onCursorSlide);
  const lastSlideRef = useRef(-1);

  // Keep refs up to date without recreating the editor
  useEffect(() => {
    onCursorSlideRef.current = onCursorSlide;
  }, [onCursorSlide]);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  const createUpdateListener = useCallback(() => {
    return EditorView.updateListener.of((update: ViewUpdate) => {
      if (update.docChanged) {
        onChangeRef.current?.(update.state.doc.toString());
      }

      // Track which slide the cursor is in (for markdown sync)
      if (update.selectionSet || update.docChanged) {
        const pos = update.state.selection.main.head;
        const doc = update.state.doc.toString();
        const textBeforeCursor = doc.slice(0, pos);

        // Count slide separators (--- on its own line) before cursor
        // Skip frontmatter (first --- pair)
        const frontmatterEnd = doc.indexOf("---", doc.indexOf("---") + 3);
        const contentBeforeCursor =
          frontmatterEnd >= 0 && pos > frontmatterEnd
            ? textBeforeCursor.slice(frontmatterEnd + 3)
            : textBeforeCursor;

        const separators = (contentBeforeCursor.match(/\n---\s*\n/g) || [])
          .length;
        const slideIndex = Math.max(0, separators);

        if (slideIndex !== lastSlideRef.current) {
          lastSlideRef.current = slideIndex;
          onCursorSlideRef.current?.(slideIndex);
        }
      }
    });
  }, []);

  // Create or recreate editor when language changes
  useEffect(() => {
    if (!containerRef.current) return;

    // Destroy previous editor
    if (viewRef.current) {
      viewRef.current.destroy();
    }

    const state = EditorState.create({
      doc: value,
      extensions: [
        basicSetup,
        oneDark,
        getLanguageExtension(language),
        createUpdateListener(),
        EditorView.theme({
          "&": {
            height: "100%",
            fontSize: "13px",
          },
          ".cm-scroller": {
            fontFamily: "var(--font-mono)",
            overflow: "auto",
          },
          ".cm-content": {
            caretColor: "var(--accent-primary)",
          },
          "&.cm-focused .cm-cursor": {
            borderLeftColor: "var(--accent-primary)",
          },
        }),
      ],
    });

    viewRef.current = new EditorView({
      state,
      parent: containerRef.current,
    });

    return () => {
      viewRef.current?.destroy();
      viewRef.current = null;
    };
    // Intentionally not including `value` — we only recreate on language change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language, createUpdateListener]);

  // Update content when value changes externally (e.g., API load)
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;

    const currentContent = view.state.doc.toString();
    if (currentContent !== value) {
      view.dispatch({
        changes: {
          from: 0,
          to: currentContent.length,
          insert: value,
        },
      });
    }
  }, [value]);

  return (
    <div
      ref={containerRef}
      className={`flex-1 overflow-hidden ${className}`}
      data-testid="code-editor"
      style={{ backgroundColor: "var(--surface-primary)" }}
    />
  );
}
