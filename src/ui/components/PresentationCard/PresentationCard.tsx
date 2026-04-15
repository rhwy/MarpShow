"use client";

import { Pencil, Trash2, Play, ExternalLink } from "lucide-react";
import type { PresentationSummary } from "@/core/domain";

export interface PresentationCardProps {
  presentation: PresentationSummary;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onPresent?: (id: string) => void;
  onDetails?: (id: string) => void;
}

/**
 * PresentationCard — compact card for the Home page grid.
 *
 * Thin color strip (20px) on the left. Title, description, date,
 * and action icons in a horizontal layout.
 */
export function PresentationCard({
  presentation,
  onEdit,
  onDelete,
  onPresent,
  onDetails,
}: PresentationCardProps) {
  const { id, title, description, updatedAt, slideCount } = presentation;

  const formattedDate = new Date(updatedAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  return (
    <article
      className="flex overflow-hidden rounded-lg"
      style={{
        backgroundColor: "var(--surface-card)",
        border: "1px solid var(--border-subtle)",
      }}
      data-testid="presentation-card"
    >
      {/* Thin color strip */}
      <div
        className="flex-shrink-0"
        style={{
          width: 20,
          background: thumbnailGradient(id),
        }}
      />

      {/* Content */}
      <div
        className="flex items-center gap-3 flex-1 min-w-0"
        style={{ padding: "10px 14px" }}
      >
        {/* Title + description */}
        <div className="flex-1 min-w-0">
          <h3
            className="text-sm font-semibold truncate cursor-pointer hover:underline"
            style={{
              fontFamily: "var(--font-heading)",
              color: "var(--fg-primary)",
            }}
            onClick={() => onEdit?.(id)}
            data-testid="card-title"
          >
            {title}
          </h3>
          {description && (
            <p
              className="text-xs truncate mt-0.5"
              style={{
                fontFamily: "var(--font-body)",
                color: "var(--fg-secondary)",
              }}
            >
              {description}
            </p>
          )}
        </div>

        {/* Metadata */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <span
            className="text-[10px] px-1.5 py-0.5 rounded"
            style={{
              backgroundColor: "var(--surface-elevated)",
              color: "var(--fg-muted)",
              fontFamily: "var(--font-mono)",
            }}
          >
            {slideCount} slides
          </span>
          <span
            className="text-[10px]"
            style={{
              fontFamily: "var(--font-caption)",
              color: "var(--fg-muted)",
            }}
          >
            {formattedDate}
          </span>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <ActionButton icon={Pencil} label={`Edit ${title}`} onClick={() => onEdit?.(id)} />
          <ActionButton icon={Play} label={`Present ${title}`} onClick={() => onPresent?.(id)} />
          <ActionButton icon={ExternalLink} label={`Details for ${title}`} onClick={() => onDetails?.(id)} />
          <ActionButton icon={Trash2} label={`Delete ${title}`} onClick={() => onDelete?.(id)} />
        </div>
      </div>
    </article>
  );
}

function ActionButton({
  icon: Icon,
  label,
  onClick,
}: {
  icon: React.ElementType;
  label: string;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className="flex items-center justify-center transition-colors hover:opacity-80"
      style={{ color: "var(--fg-muted)" }}
    >
      <Icon size={14} />
    </button>
  );
}

function thumbnailGradient(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue1 = Math.abs(hash % 360);
  const hue2 = (hue1 + 40) % 360;
  return `linear-gradient(180deg, hsl(${hue1}, 30%, 15%), hsl(${hue2}, 40%, 20%))`;
}
