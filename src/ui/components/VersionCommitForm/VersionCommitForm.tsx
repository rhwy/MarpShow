"use client";

import { useState } from "react";
import { Save } from "lucide-react";

export interface VersionCommitFormProps {
  onCommit: (title: string) => void;
  saving?: boolean;
  lastVersion?: { id: number; title: string; timestamp: string } | null;
}

/**
 * VersionCommitForm — compact form to save a named version snapshot.
 * Displayed under the preview panel in the editor.
 */
export function VersionCommitForm({
  onCommit,
  saving = false,
  lastVersion,
}: VersionCommitFormProps) {
  const [title, setTitle] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || saving) return;
    onCommit(title.trim());
    setTitle("");
  };

  return (
    <div
      className="flex flex-col gap-2 px-3 py-2 flex-shrink-0"
      style={{
        borderTop: "1px solid var(--border-subtle)",
        backgroundColor: "var(--surface-card)",
      }}
      data-testid="version-commit-form"
    >
      {/* Last version info */}
      {lastVersion && (
        <div className="flex items-center gap-2">
          <span
            className="text-[10px] px-1.5 py-0.5 rounded"
            style={{
              backgroundColor: "var(--surface-elevated)",
              color: "var(--accent-primary)",
              fontFamily: "var(--font-mono)",
            }}
          >
            v{lastVersion.id}
          </span>
          <span
            className="text-[10px] truncate"
            style={{
              fontFamily: "var(--font-caption)",
              color: "var(--fg-muted)",
            }}
          >
            {lastVersion.title} — {new Date(lastVersion.timestamp).toLocaleString("en-US", {
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
      )}

      {/* Commit form */}
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Version title (e.g. Added intro slides)"
          disabled={saving}
          className="flex-1 text-xs px-2.5 py-1.5 rounded-lg outline-none"
          style={{
            backgroundColor: "var(--surface-primary)",
            border: "1px solid var(--border-subtle)",
            color: "var(--fg-primary)",
            fontFamily: "var(--font-body)",
          }}
          data-testid="version-title-input"
        />
        <button
          type="submit"
          disabled={!title.trim() || saving}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-opacity"
          style={{
            background:
              "linear-gradient(90deg, var(--accent-primary), var(--accent-secondary))",
            color: "#FFF",
            opacity: !title.trim() || saving ? 0.5 : 1,
          }}
          data-testid="version-save-btn"
        >
          <Save size={12} />
          {saving ? "Saving..." : "Save Version"}
        </button>
      </form>
    </div>
  );
}
