"use client";

import { useState } from "react";

export interface CreatePresentationData {
  title: string;
  description: string;
  author: string;
}

export interface CreatePresentationDialogProps {
  open: boolean;
  onCancel: () => void;
  onCreate: (data: CreatePresentationData) => void;
  loading?: boolean;
}

/**
 * CreatePresentationDialog — modal for creating a new presentation
 * with title, subtitle (description), and author fields.
 */
export function CreatePresentationDialog({
  open,
  onCancel,
  onCreate,
  loading = false,
}: CreatePresentationDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [author, setAuthor] = useState("");

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onCreate({ title: title.trim(), description: description.trim(), author: author.trim() });
  };

  const handleCancel = () => {
    setTitle("");
    setDescription("");
    setAuthor("");
    onCancel();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.6)" }}
      onClick={handleCancel}
      data-testid="create-dialog-overlay"
    >
      <div
        className="rounded-xl p-6 w-full max-w-lg"
        style={{
          backgroundColor: "var(--surface-elevated)",
          border: "1px solid var(--border-subtle)",
        }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-dialog-title"
      >
        <h2
          id="create-dialog-title"
          className="text-xl font-semibold mb-5"
          style={{
            fontFamily: "var(--font-heading)",
            color: "var(--fg-primary)",
          }}
        >
          New Presentation
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Title */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="pres-title"
              className="text-sm font-medium"
              style={{
                fontFamily: "var(--font-body)",
                color: "var(--fg-secondary)",
              }}
            >
              Title *
            </label>
            <input
              id="pres-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Q1 Revenue Report"
              autoFocus
              required
              className="px-3 py-2 rounded-lg text-sm outline-none transition-colors"
              style={{
                backgroundColor: "var(--surface-primary)",
                border: "1px solid var(--border-subtle)",
                color: "var(--fg-primary)",
                fontFamily: "var(--font-body)",
              }}
              data-testid="title-input"
            />
          </div>

          {/* Subtitle / Description */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="pres-description"
              className="text-sm font-medium"
              style={{
                fontFamily: "var(--font-body)",
                color: "var(--fg-secondary)",
              }}
            >
              Subtitle
            </label>
            <input
              id="pres-description"
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Quarterly financial overview"
              className="px-3 py-2 rounded-lg text-sm outline-none transition-colors"
              style={{
                backgroundColor: "var(--surface-primary)",
                border: "1px solid var(--border-subtle)",
                color: "var(--fg-primary)",
                fontFamily: "var(--font-body)",
              }}
              data-testid="description-input"
            />
          </div>

          {/* Author */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="pres-author"
              className="text-sm font-medium"
              style={{
                fontFamily: "var(--font-body)",
                color: "var(--fg-secondary)",
              }}
            >
              Author
            </label>
            <input
              id="pres-author"
              type="text"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="e.g. Jane Smith"
              className="px-3 py-2 rounded-lg text-sm outline-none transition-colors"
              style={{
                backgroundColor: "var(--surface-primary)",
                border: "1px solid var(--border-subtle)",
                color: "var(--fg-primary)",
                fontFamily: "var(--font-body)",
              }}
              data-testid="author-input"
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 mt-2">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 rounded-lg text-sm font-medium"
              style={{
                backgroundColor: "var(--surface-hover)",
                color: "var(--fg-primary)",
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!title.trim() || loading}
              className="px-5 py-2 rounded-lg text-sm font-medium transition-opacity"
              style={{
                background:
                  "linear-gradient(90deg, var(--accent-primary), var(--accent-secondary))",
                color: "#FFF",
                opacity: !title.trim() || loading ? 0.5 : 1,
              }}
              data-testid="create-submit-btn"
            >
              {loading ? "Creating..." : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
