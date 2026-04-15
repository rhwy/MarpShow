"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Upload, Trash2, Copy, Image, Pencil, X } from "lucide-react";
import { createLogger } from "@/infrastructure/logging";

const logger = createLogger("MediaPanel");

export interface MediaFile {
  name: string;
  path: string;
  markdownRef: string;
}

export interface MediaPanelProps {
  presentationId: string;
}

/**
 * MediaPanel — manage media files for a presentation.
 *
 * Supports drag & drop upload, file listing with thumbnails,
 * copy markdown reference, rename, large preview popup, and delete.
 */
export function MediaPanel({ presentationId }: MediaPanelProps) {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [copiedName, setCopiedName] = useState<string | null>(null);
  const [previewFile, setPreviewFile] = useState<MediaFile | null>(null);
  const [renamingFile, setRenamingFile] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");

  const loadFiles = useCallback(async () => {
    try {
      const res = await fetch(`/api/presentations/${presentationId}/media`);
      if (res.ok) {
        const data = await res.json();
        setFiles(data);
      }
    } catch (err) {
      logger.error("Failed to load media files", err);
    }
  }, [presentationId]);

  useEffect(() => {
    loadFiles();
  }, [loadFiles]);

  const uploadFiles = async (fileList: FileList | File[]) => {
    setUploading(true);
    try {
      const formData = new FormData();
      for (const file of fileList) {
        formData.append("files", file);
      }
      const res = await fetch(`/api/presentations/${presentationId}/media`, {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        logger.info("Files uploaded successfully");
        await loadFiles();
      }
    } catch (err) {
      logger.error("Failed to upload files", err);
    } finally {
      setUploading(false);
    }
  };

  const deleteFile = async (fileName: string) => {
    try {
      const res = await fetch(
        `/api/presentations/${presentationId}/media?file=${encodeURIComponent(fileName)}`,
        { method: "DELETE" },
      );
      if (res.ok) {
        logger.info("File deleted", { name: fileName });
        await loadFiles();
      }
    } catch (err) {
      logger.error("Failed to delete file", err);
    }
  };

  const renameFile = async (oldName: string, newName: string) => {
    try {
      const res = await fetch(`/api/presentations/${presentationId}/media`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ oldName, newName }),
      });
      if (res.ok) {
        logger.info("File renamed", { from: oldName, to: newName });
        setRenamingFile(null);
        await loadFiles();
      }
    } catch (err) {
      logger.error("Failed to rename file", err);
    }
  };

  const copyMarkdownRef = (file: MediaFile) => {
    navigator.clipboard.writeText(file.markdownRef);
    setCopiedName(file.name);
    setTimeout(() => setCopiedName(null), 2000);
  };

  const startRename = (file: MediaFile) => {
    setRenamingFile(file.name);
    setRenameValue(file.name);
  };

  const submitRename = (oldName: string) => {
    if (renameValue.trim() && renameValue !== oldName) {
      renameFile(oldName, renameValue.trim());
    } else {
      setRenamingFile(null);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => setDragging(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files.length > 0) uploadFiles(e.dataTransfer.files);
  };

  const isImage = (name: string) =>
    /\.(png|jpe?g|gif|svg|webp|ico)$/i.test(name);

  return (
    <div
      className="flex flex-col h-full overflow-auto p-6 gap-5"
      style={{ backgroundColor: "var(--surface-primary)" }}
      data-testid="media-panel"
    >
      <h3
        className="text-base font-semibold"
        style={{ fontFamily: "var(--font-heading)", color: "var(--fg-primary)" }}
      >
        Media Files
      </h3>

      <p
        className="text-xs"
        style={{ fontFamily: "var(--font-body)", color: "var(--fg-muted)" }}
      >
        Upload images and media to use in your slides. Reference them with{" "}
        <code
          className="px-1 py-0.5 rounded text-[11px]"
          style={{
            backgroundColor: "var(--surface-card)",
            color: "var(--accent-primary)",
            fontFamily: "var(--font-mono)",
          }}
        >
          ![alt](./filename.png)
        </code>
      </p>

      {/* Drop zone */}
      <div
        className="flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed transition-colors cursor-pointer"
        style={{
          minHeight: 120,
          borderColor: dragging ? "var(--accent-primary)" : "var(--border-subtle)",
          backgroundColor: dragging ? "var(--accent-glow)" : "transparent",
        }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        data-testid="media-dropzone"
      >
        <Upload
          size={24}
          style={{ color: dragging ? "var(--accent-primary)" : "var(--fg-muted)" }}
        />
        <span className="text-sm" style={{ fontFamily: "var(--font-body)", color: "var(--fg-muted)" }}>
          {uploading ? "Uploading..." : "Drop files here or click to browse"}
        </span>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,video/*,.pdf,.svg"
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.length) {
              uploadFiles(e.target.files);
              e.target.value = "";
            }
          }}
          data-testid="media-file-input"
        />
      </div>

      {/* File list */}
      {files.length === 0 ? (
        <p className="text-sm text-center py-4" style={{ color: "var(--fg-muted)" }}>
          No media files yet.
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {files.map((file) => (
            <div
              key={file.name}
              className="flex items-center gap-3 px-3 py-2 rounded-lg"
              style={{ backgroundColor: "var(--surface-card)" }}
              data-testid="media-file-item"
            >
              {/* Thumbnail — click to preview */}
              <button
                onClick={() => isImage(file.name) && setPreviewFile(file)}
                className="flex-shrink-0 flex items-center justify-center rounded overflow-hidden"
                style={{
                  width: 40,
                  height: 40,
                  backgroundColor: "var(--surface-elevated)",
                  cursor: isImage(file.name) ? "pointer" : "default",
                }}
                aria-label={`Preview ${file.name}`}
                data-testid="media-thumbnail"
              >
                {isImage(file.name) ? (
                  <img src={file.path} alt={file.name} className="w-full h-full object-cover" />
                ) : (
                  <Image size={18} style={{ color: "var(--fg-muted)" }} />
                )}
              </button>

              {/* File name — inline rename */}
              {renamingFile === file.name ? (
                <input
                  type="text"
                  value={renameValue}
                  onChange={(e) => setRenameValue(e.target.value)}
                  onBlur={() => submitRename(file.name)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") submitRename(file.name);
                    if (e.key === "Escape") setRenamingFile(null);
                  }}
                  autoFocus
                  className="flex-1 text-sm px-2 py-1 rounded outline-none"
                  style={{
                    backgroundColor: "var(--surface-primary)",
                    border: "1px solid var(--accent-primary)",
                    color: "var(--fg-primary)",
                    fontFamily: "var(--font-mono)",
                    fontSize: 12,
                  }}
                  data-testid="media-rename-input"
                />
              ) : (
                <span
                  className="flex-1 text-sm truncate"
                  style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--fg-primary)" }}
                >
                  {file.name}
                </span>
              )}

              {/* Rename */}
              <button
                onClick={() => startRename(file)}
                className="flex items-center justify-center p-1 rounded"
                style={{ color: "var(--fg-muted)" }}
                aria-label={`Rename ${file.name}`}
                title="Rename"
              >
                <Pencil size={14} />
              </button>

              {/* Copy markdown ref */}
              <button
                onClick={() => copyMarkdownRef(file)}
                className="flex items-center justify-center p-1 rounded"
                style={{ color: copiedName === file.name ? "var(--accent-primary)" : "var(--fg-muted)" }}
                aria-label={`Copy markdown reference for ${file.name}`}
                title="Copy markdown reference"
              >
                <Copy size={14} />
              </button>

              {/* Delete */}
              <button
                onClick={() => deleteFile(file.name)}
                className="flex items-center justify-center p-1 rounded"
                style={{ color: "var(--fg-muted)" }}
                aria-label={`Delete ${file.name}`}
                title="Delete file"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Large preview popup */}
      {previewFile && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.75)" }}
          onClick={() => setPreviewFile(null)}
          data-testid="media-preview-overlay"
        >
          <div
            className="relative max-w-4xl max-h-[85vh] rounded-xl overflow-hidden"
            style={{
              backgroundColor: "var(--surface-elevated)",
              border: "1px solid var(--border-subtle)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setPreviewFile(null)}
              className="absolute top-3 right-3 z-10 flex items-center justify-center w-8 h-8 rounded-full"
              style={{ backgroundColor: "rgba(0,0,0,0.5)", color: "#FFF" }}
              aria-label="Close preview"
            >
              <X size={16} />
            </button>

            {/* Image */}
            <img
              src={previewFile.path}
              alt={previewFile.name}
              className="max-w-full max-h-[80vh] object-contain"
              style={{ display: "block" }}
            />

            {/* File name footer */}
            <div className="px-4 py-3 flex items-center justify-between">
              <span
                className="text-sm"
                style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--fg-secondary)" }}
              >
                {previewFile.name}
              </span>
              <button
                onClick={() => copyMarkdownRef(previewFile)}
                className="text-xs px-3 py-1 rounded-lg"
                style={{
                  backgroundColor: "var(--surface-hover)",
                  color: "var(--fg-primary)",
                  fontFamily: "var(--font-body)",
                }}
              >
                {copiedName === previewFile.name ? "Copied!" : "Copy markdown ref"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
