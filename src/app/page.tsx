"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search } from "lucide-react";
import { TopBar } from "@/ui/components/TopBar";
import { PresentationCard } from "@/ui/components/PresentationCard";
import { ConfirmDialog } from "@/ui/components/ConfirmDialog";
import {
  CreatePresentationDialog,
  type CreatePresentationData,
} from "@/ui/components/CreatePresentationDialog";
import type { PresentationSummary } from "@/core/domain";
import { createLogger } from "@/infrastructure/logging";

const logger = createLogger("HomePage");

export default function HomePage() {
  const router = useRouter();
  const [presentations, setPresentations] = useState<PresentationSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<PresentationSummary | null>(
    null,
  );
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [filterQuery, setFilterQuery] = useState("");
  const [filterField, setFilterField] = useState<"title" | "subtitle" | "author">("title");
  const [creating, setCreating] = useState(false);

  // Fetch presentations on mount
  const loadPresentations = useCallback(async () => {
    logger.info("Loading presentations");
    try {
      const res = await fetch("/api/presentations");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setPresentations(data);
      logger.info(`Loaded ${data.length} presentations`);
    } catch (err) {
      logger.error("Failed to load presentations", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPresentations();
  }, [loadPresentations]);

  // Client-side filtering
  const filteredPresentations = useMemo(() => {
    if (!filterQuery.trim()) return presentations;
    const q = filterQuery.toLowerCase();
    return presentations.filter((p) => {
      switch (filterField) {
        case "title":
          return p.title.toLowerCase().includes(q);
        case "subtitle":
          return p.description.toLowerCase().includes(q);
        case "author":
          return (p.author || "").toLowerCase().includes(q);
      }
    });
  }, [presentations, filterQuery, filterField]);

  // Create new presentation → redirect to editor
  const handleCreate = async (data: CreatePresentationData) => {
    logger.info("Creating new presentation", { title: data.title });
    setCreating(true);
    try {
      const res = await fetch("/api/presentations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const created = await res.json();
      logger.info("Presentation created, redirecting to editor", {
        id: created.id,
      });
      setShowCreateDialog(false);
      router.push(`/editor/${created.id}`);
    } catch (err) {
      logger.error("Failed to create presentation", err);
    } finally {
      setCreating(false);
    }
  };

  // Delete presentation
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    logger.info("Deleting presentation", { id: deleteTarget.id });
    try {
      const res = await fetch(`/api/presentations/${deleteTarget.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setDeleteTarget(null);
      await loadPresentations();
      logger.info("Presentation deleted", { id: deleteTarget.id });
    } catch (err) {
      logger.error("Failed to delete presentation", err);
    }
  };

  return (
    <div
      className="flex flex-col min-h-screen"
      style={{ backgroundColor: "var(--surface-primary)" }}
    >
      <TopBar />

      <main className="flex-1 flex flex-col gap-8 px-12 py-8">
        {/* New Presentation button */}
        <button
          onClick={() => setShowCreateDialog(true)}
          className="flex items-center justify-center gap-2.5 w-full rounded-xl font-semibold transition-opacity hover:opacity-90"
          style={{
            height: 56,
            background:
              "linear-gradient(90deg, var(--accent-primary), var(--accent-secondary))",
            fontFamily: "var(--font-heading)",
            fontSize: 16,
            color: "var(--fg-primary)",
          }}
          data-testid="new-presentation-btn"
        >
          <Plus size={22} />
          New Presentation
        </button>

        {/* Filter bar */}
        {!loading && presentations.length > 0 && (
          <div className="flex items-center gap-2" data-testid="filter-bar">
            <div className="relative flex-1">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2"
                style={{ color: "var(--fg-muted)" }}
              />
              <input
                type="text"
                value={filterQuery}
                onChange={(e) => setFilterQuery(e.target.value)}
                placeholder={`Filter by ${filterField}...`}
                className="w-full pl-9 pr-3 py-2 rounded-lg text-sm outline-none"
                style={{
                  backgroundColor: "var(--surface-card)",
                  border: "1px solid var(--border-subtle)",
                  color: "var(--fg-primary)",
                  fontFamily: "var(--font-body)",
                }}
                data-testid="filter-input"
              />
            </div>
            <select
              value={filterField}
              onChange={(e) => setFilterField(e.target.value as "title" | "subtitle" | "author")}
              className="px-3 py-2 rounded-lg text-sm outline-none cursor-pointer"
              style={{
                backgroundColor: "var(--surface-card)",
                border: "1px solid var(--border-subtle)",
                color: "var(--fg-secondary)",
                fontFamily: "var(--font-body)",
              }}
              data-testid="filter-field-select"
            >
              <option value="title">Title</option>
              <option value="subtitle">Subtitle</option>
              <option value="author">Author</option>
            </select>
          </div>
        )}

        {/* Card list */}
        {loading ? (
          <p style={{ color: "var(--fg-muted)" }}>Loading presentations...</p>
        ) : presentations.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <p style={{ color: "var(--fg-muted)" }}>
              No presentations yet. Create one to get started!
            </p>
          </div>
        ) : (
          <div
            className="flex flex-col gap-2"
            data-testid="card-grid"
          >
            {filteredPresentations.map((p) => (
              <PresentationCard
                key={p.id}
                presentation={p}
                onEdit={(id) => router.push(`/editor/${id}`)}
                onDelete={(id) => {
                  const target = presentations.find((pr) => pr.id === id);
                  if (target) setDeleteTarget(target);
                }}
                onPresent={(id) => router.push(`/present/${id}`)}
                onDetails={(id) => router.push(`/details/${id}`)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Create presentation dialog */}
      <CreatePresentationDialog
        open={showCreateDialog}
        onCancel={() => setShowCreateDialog(false)}
        onCreate={handleCreate}
        loading={creating}
      />

      {/* Delete confirmation dialog */}
      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Presentation"
        message={`Are you sure you want to delete "${deleteTarget?.title}"? This action cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        destructive
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
