"use client";

import { useRef, useEffect, useCallback } from "react";
import { EditorView, basicSetup } from "codemirror";
import { EditorState } from "@codemirror/state";
import {
  unifiedMergeView,
  acceptChunk,
  rejectChunk,
  getChunks,
} from "@codemirror/merge";
import { markdown } from "@codemirror/lang-markdown";
import { oneDark } from "@codemirror/theme-one-dark";
import { Check, X } from "lucide-react";

export interface DiffEditorProps {
  /** The original document (before AI changes) */
  originalDoc: string;
  /** The modified document (AI's proposed changes) */
  modifiedDoc: string;
  /** Called when all chunks are resolved or user clicks Accept All / Reject All */
  onResolved: (finalContent: string) => void;
}

/**
 * DiffEditor — inline diff view with per-chunk Accept/Reject buttons.
 *
 * Uses @codemirror/merge UnifiedMergeView to show AI-proposed changes
 * as an inline diff against the original document. Each changed chunk
 * has built-in Accept/Reject buttons.
 */
export function DiffEditor({
  originalDoc,
  modifiedDoc,
  onResolved,
}: DiffEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);

  // Create the unified merge view
  useEffect(() => {
    if (!containerRef.current) return;

    if (viewRef.current) {
      viewRef.current.destroy();
    }

    const state = EditorState.create({
      doc: modifiedDoc,
      extensions: [
        basicSetup,
        oneDark,
        markdown(),
        unifiedMergeView({
          original: originalDoc,
          mergeControls: true,
          highlightChanges: true,
        }),
        EditorView.theme({
          "&": {
            height: "100%",
            fontSize: "13px",
          },
          ".cm-scroller": {
            fontFamily: "var(--font-mono)",
            overflow: "auto",
          },
          // Style the merge view chunks
          ".cm-mergeView .cm-changedLine": {
            backgroundColor: "rgba(168, 85, 247, 0.08) !important",
          },
          ".cm-mergeView .cm-deletedChunk": {
            backgroundColor: "rgba(239, 68, 68, 0.12) !important",
          },
          ".cm-mergeView .cm-insertedLine": {
            backgroundColor: "rgba(34, 197, 94, 0.12) !important",
          },
          // Style the accept/reject buttons
          "button[name=accept]": {
            backgroundColor: "rgba(34, 197, 94, 0.3)",
            color: "#22c55e",
            border: "none",
            borderRadius: "3px",
            padding: "1px 6px",
            cursor: "pointer",
            fontSize: "11px",
            marginRight: "4px",
          },
          "button[name=reject]": {
            backgroundColor: "rgba(239, 68, 68, 0.3)",
            color: "#ef4444",
            border: "none",
            borderRadius: "3px",
            padding: "1px 6px",
            cursor: "pointer",
            fontSize: "11px",
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
  }, [originalDoc, modifiedDoc]);

  const handleAcceptAll = useCallback(() => {
    const view = viewRef.current;
    if (!view) return;

    // Accept all chunks by iterating from end to start
    const chunks = getChunks(view.state);
    if (chunks) {
      // Accept from last to first to preserve positions
      for (let i = chunks.chunks.length - 1; i >= 0; i--) {
        acceptChunk(view, chunks.chunks[i].fromB);
      }
    }

    onResolved(view.state.doc.toString());
  }, [onResolved]);

  const handleRejectAll = useCallback(() => {
    const view = viewRef.current;
    if (!view) return;

    // Reject all chunks
    const chunks = getChunks(view.state);
    if (chunks) {
      for (let i = chunks.chunks.length - 1; i >= 0; i--) {
        rejectChunk(view, chunks.chunks[i].fromB);
      }
    }

    onResolved(view.state.doc.toString());
  }, [onResolved]);

  const handleDone = useCallback(() => {
    const view = viewRef.current;
    if (!view) return;
    onResolved(view.state.doc.toString());
  }, [onResolved]);

  return (
    <div className="flex flex-col h-full" data-testid="diff-editor">
      {/* Action bar */}
      <div
        className="flex items-center justify-between px-3 flex-shrink-0"
        style={{
          height: 36,
          backgroundColor: "var(--surface-primary)",
          borderBottom: "1px solid var(--border-subtle)",
        }}
      >
        <span
          className="text-xs font-medium"
          style={{
            fontFamily: "var(--font-body)",
            color: "var(--accent-primary)",
          }}
        >
          Reviewing AI changes
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={handleAcceptAll}
            className="flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium transition-colors"
            style={{
              backgroundColor: "rgba(34, 197, 94, 0.15)",
              color: "#22c55e",
            }}
            data-testid="accept-all-btn"
          >
            <Check size={12} />
            Accept All
          </button>
          <button
            onClick={handleRejectAll}
            className="flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium transition-colors"
            style={{
              backgroundColor: "rgba(239, 68, 68, 0.15)",
              color: "#ef4444",
            }}
            data-testid="reject-all-btn"
          >
            <X size={12} />
            Reject All
          </button>
          <button
            onClick={handleDone}
            className="flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium transition-colors"
            style={{
              backgroundColor: "var(--surface-hover)",
              color: "var(--fg-primary)",
            }}
            data-testid="done-review-btn"
          >
            Done
          </button>
        </div>
      </div>

      {/* Merge editor */}
      <div
        ref={containerRef}
        className="flex-1 overflow-hidden"
        style={{ backgroundColor: "var(--surface-primary)" }}
      />
    </div>
  );
}
