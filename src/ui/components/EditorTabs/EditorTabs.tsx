"use client";

import { FileText, Palette, Braces, Settings, Image, Eye, BookOpen } from "lucide-react";

export type EditorTabId = "markdown" | "css" | "theme" | "javascript" | "media" | "config" | "docs";

export interface EditorTab {
  id: EditorTabId;
  label: string;
  icon: React.ElementType;
  /** Secondary tabs appear dimmer — reference/read-only tabs */
  secondary?: boolean;
}

const TABS: EditorTab[] = [
  { id: "markdown", label: "Markdown", icon: FileText },
  { id: "css", label: "CSS", icon: Palette },
  { id: "theme", label: "Theme", icon: Eye, secondary: true },
  { id: "javascript", label: "JS", icon: Braces },
  { id: "media", label: "Media", icon: Image },
  { id: "config", label: "Config", icon: Settings },
  { id: "docs", label: "Docs", icon: BookOpen, secondary: true },
];

export interface EditorTabsProps {
  activeTab: EditorTabId;
  onTabChange: (tab: EditorTabId) => void;
}

/**
 * EditorTabs — tab bar for editor panels.
 *
 * Primary tabs: full opacity when inactive.
 * Secondary tabs: dimmer text/icon to indicate reference-only panels.
 */
export function EditorTabs({ activeTab, onTabChange }: EditorTabsProps) {
  return (
    <div
      className="flex items-end"
      style={{
        height: 36,
        backgroundColor: "var(--surface-primary)",
        borderBottom: "1px solid var(--border-subtle)",
        paddingLeft: 12,
      }}
      role="tablist"
      data-testid="editor-tabs"
    >
      {TABS.map(({ id, label, icon: Icon, secondary }) => {
        const isActive = id === activeTab;
        const dimFactor = secondary && !isActive ? 0.5 : 1;
        return (
          <button
            key={id}
            role="tab"
            aria-selected={isActive}
            onClick={() => onTabChange(id)}
            className="flex items-center gap-1.5 px-3.5 transition-colors"
            style={{
              height: 32,
              fontFamily: "var(--font-body)",
              fontSize: 12,
              fontWeight: isActive ? 500 : 400,
              color: isActive
                ? "var(--fg-primary)"
                : "var(--fg-muted)",
              opacity: dimFactor,
              borderBottom: isActive
                ? "2px solid var(--accent-primary)"
                : "2px solid transparent",
            }}
          >
            <Icon
              size={13}
              style={{
                color: isActive
                  ? "var(--accent-primary)"
                  : "var(--fg-muted)",
              }}
            />
            {label}
          </button>
        );
      })}
    </div>
  );
}
