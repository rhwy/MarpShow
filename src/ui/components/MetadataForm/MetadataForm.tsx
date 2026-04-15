"use client";

import { useState, useEffect } from "react";

export interface MetadataFormValues {
  title: string;
  description: string;
  author: string;
}

export interface MetadataFormProps {
  values: MetadataFormValues;
  onSave: (values: MetadataFormValues) => void;
  saving?: boolean;
}

/**
 * MetadataForm — inline form for editing presentation metadata.
 *
 * Displayed in the editor's Config tab. Shows title, subtitle, and author.
 * Theme is set in the markdown frontmatter, not here.
 */
export function MetadataForm({ values, onSave, saving = false }: MetadataFormProps) {
  const [title, setTitle] = useState(values.title || "");
  const [description, setDescription] = useState(values.description || "");
  const [author, setAuthor] = useState(values.author || "");

  // Sync when external values change (e.g. after API load)
  useEffect(() => {
    setTitle(values.title || "");
    setDescription(values.description || "");
    setAuthor(values.author || "");
  }, [values]);

  const hasChanges =
    title !== (values.title || "") ||
    description !== (values.description || "") ||
    author !== (values.author || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSave({
      title: title.trim(),
      description: description.trim(),
      author: author.trim(),
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-5 p-6 h-full overflow-auto"
      style={{ backgroundColor: "var(--surface-primary)" }}
      data-testid="metadata-form"
    >
      <h3
        className="text-base font-semibold"
        style={{
          fontFamily: "var(--font-heading)",
          color: "var(--fg-primary)",
        }}
      >
        Presentation Settings
      </h3>

      <FormField label="Title" required>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          data-testid="meta-title"
        />
      </FormField>

      <FormField label="Subtitle">
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          data-testid="meta-description"
        />
      </FormField>

      <FormField label="Author">
        <input
          type="text"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          data-testid="meta-author"
        />
      </FormField>

      <p
        className="text-xs"
        style={{
          fontFamily: "var(--font-body)",
          color: "var(--fg-muted)",
        }}
      >
        To change the theme, set <code style={{ color: "var(--accent-primary)" }}>theme: theme-name</code> in the markdown frontmatter. Available themes are listed in Settings.
      </p>

      <div className="pt-2">
        <button
          type="submit"
          disabled={!title.trim() || !hasChanges || saving}
          className="px-5 py-2 rounded-lg text-sm font-medium transition-opacity"
          style={{
            background:
              "linear-gradient(90deg, var(--accent-primary), var(--accent-secondary))",
            color: "#FFF",
            opacity: !title.trim() || !hasChanges || saving ? 0.5 : 1,
          }}
          data-testid="meta-save-btn"
        >
          {saving ? "Saving..." : "Save"}
        </button>
      </div>
    </form>
  );
}

function FormField({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactElement<React.InputHTMLAttributes<HTMLInputElement>>;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        className="text-sm font-medium"
        style={{
          fontFamily: "var(--font-body)",
          color: "var(--fg-secondary)",
        }}
      >
        {label}
        {required && " *"}
      </label>
      <div
        className="[&>input]:w-full [&>input]:px-3 [&>input]:py-2 [&>input]:rounded-lg [&>input]:text-sm [&>input]:outline-none"
      >
        <style>{`
          [data-testid="metadata-form"] input {
            background-color: var(--surface-card);
            border: 1px solid var(--border-subtle);
            color: var(--fg-primary);
            font-family: var(--font-body);
          }
          [data-testid="metadata-form"] input:focus {
            border-color: var(--accent-primary);
          }
        `}</style>
        {children}
      </div>
    </div>
  );
}
