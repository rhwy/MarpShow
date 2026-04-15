"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Palette,
  Puzzle,
  Code,
  Download,
  Info,
  Sigma,
  GitBranch,
  Mic,
  Plus,
  Pencil,
  Trash2,
  Lock,
  Bot,
} from "lucide-react";
import { TopBar } from "@/ui/components/TopBar";
import { CodeEditor } from "@/ui/components/CodeEditor";
import {
  createDefaultSettings,
} from "@/core/domain";
import type { AppSettings, PluginConfig } from "@/core/domain";
import { createLogger } from "@/infrastructure/logging";

const logger = createLogger("SettingsPage");

const ICON_MAP: Record<string, React.ElementType> = {
  sigma: Sigma,
  "git-branch": GitBranch,
  code: Code,
  mic: Mic,
};

const NAV_SECTIONS = [
  { id: "themes", label: "Themes", icon: Palette },
  { id: "plugins", label: "Plugins", icon: Puzzle },
  { id: "editor", label: "Editor", icon: Code },
  { id: "ai", label: "AI Provider", icon: Bot },
  { id: "export", label: "Export", icon: Download },
  { id: "about", label: "About", icon: Info },
];

interface ThemeInfo {
  id: string;
  name: string;
  description: string;
  builtin: boolean;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<AppSettings>(createDefaultSettings());
  const [activeSection, setActiveSection] = useState("themes");
  const [saving, setSaving] = useState(false);
  const [themes, setThemes] = useState<ThemeInfo[]>([]);
  const [editingTheme, setEditingTheme] = useState<string | null>(null);
  const [themeCss, setThemeCss] = useState("");
  const [newThemeName, setNewThemeName] = useState("");
  const [showNewTheme, setShowNewTheme] = useState(false);

  // Load themes from API
  const loadThemes = useCallback(async () => {
    try {
      const res = await fetch("/api/themes");
      if (res.ok) setThemes(await res.json());
    } catch (err) {
      logger.error("Failed to load themes", err);
    }
  }, []);

  // Load settings on mount
  useEffect(() => {
    loadThemes();
    async function load() {
      try {
        const res = await fetch("/api/settings");
        if (res.ok) {
          const data = await res.json();
          setSettings(data);
        }
      } catch (err) {
        logger.error("Failed to load settings", err);
      }
    }
    load();
  }, []);

  // Save settings
  const save = useCallback(async (newSettings: AppSettings) => {
    setSettings(newSettings);
    setSaving(true);
    try {
      await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newSettings),
      });
      logger.info("Settings saved");
    } catch (err) {
      logger.error("Failed to save settings", err);
    } finally {
      setSaving(false);
    }
  }, []);

  const togglePlugin = (pluginId: string) => {
    const newPlugins = settings.plugins.map((p) =>
      p.id === pluginId ? { ...p, enabled: !p.enabled } : p,
    );
    save({ ...settings, plugins: newPlugins });
  };

  const setTheme = (themeId: string) => {
    save({ ...settings, activeTheme: themeId });
  };

  const updateEditor = (key: string, value: number | boolean) => {
    save({
      ...settings,
      editor: { ...settings.editor, [key]: value },
    });
  };

  const updateAI = (key: string, value: string) => {
    save({
      ...settings,
      ai: { ...settings.ai, [key]: value },
    });
  };

  // Theme CRUD
  const openThemeEditor = async (themeId: string) => {
    try {
      const res = await fetch(`/api/themes/${themeId}`);
      if (res.ok) {
        const data = await res.json();
        setEditingTheme(themeId);
        setThemeCss(data.css);
      }
    } catch (err) {
      logger.error("Failed to load theme CSS", err);
    }
  };

  const saveThemeCss = async () => {
    if (!editingTheme) return;
    try {
      await fetch(`/api/themes/${editingTheme}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ css: themeCss }),
      });
      logger.info("Theme CSS saved", { theme: editingTheme });
    } catch (err) {
      logger.error("Failed to save theme", err);
    }
  };

  const createTheme = async () => {
    if (!newThemeName.trim()) return;
    const defaultCss = `/*\n * @theme ${newThemeName.toLowerCase().replace(/[^a-z0-9-]/g, "-")}\n */\n\nsection {\n  background: #1a1a2e;\n  color: #eee;\n  font-family: Arial, sans-serif;\n  width: 1280px;\n  height: 720px;\n}\n`;
    try {
      await fetch("/api/themes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newThemeName, css: defaultCss }),
      });
      setNewThemeName("");
      setShowNewTheme(false);
      await loadThemes();
    } catch (err) {
      logger.error("Failed to create theme", err);
    }
  };

  const deleteTheme = async (themeId: string) => {
    try {
      await fetch(`/api/themes/${themeId}`, { method: "DELETE" });
      if (editingTheme === themeId) {
        setEditingTheme(null);
        setThemeCss("");
      }
      await loadThemes();
    } catch (err) {
      logger.error("Failed to delete theme", err);
    }
  };

  return (
    <div
      className="flex flex-col h-screen overflow-hidden"
      style={{ backgroundColor: "var(--surface-primary)" }}
    >
      <TopBar />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <nav
          className="flex flex-col gap-1 py-6 px-4 flex-shrink-0"
          style={{
            width: 240,
            borderRight: "1px solid var(--border-subtle)",
          }}
          data-testid="settings-sidebar"
        >
          <span
            className="text-sm font-semibold mb-2 px-3"
            style={{
              fontFamily: "var(--font-heading)",
              color: "var(--fg-muted)",
            }}
          >
            Settings
          </span>
          {NAV_SECTIONS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => {
                setActiveSection(id);
                document
                  .getElementById(`section-${id}`)
                  ?.scrollIntoView({ behavior: "smooth" });
              }}
              className="flex items-center gap-3 px-3 rounded-lg transition-colors text-left"
              style={{
                height: 40,
                fontFamily: "var(--font-body)",
                fontSize: 14,
                backgroundColor:
                  activeSection === id
                    ? "var(--surface-elevated)"
                    : "transparent",
                color:
                  activeSection === id
                    ? "var(--fg-primary)"
                    : "var(--fg-secondary)",
              }}
            >
              <Icon
                size={18}
                style={{
                  color:
                    activeSection === id
                      ? "var(--accent-primary)"
                      : "var(--fg-muted)",
                }}
              />
              {label}
            </button>
          ))}
        </nav>

        {/* Content */}
        <div
          className="flex-1 overflow-y-auto"
          style={{ padding: "32px 48px" }}
        >
          <div className="flex flex-col gap-10 max-w-4xl">
            {/* Themes */}
            <section id="section-themes">
              <SectionHeader
                title="Available Themes"
                description="These themes are available in the system. Reference any theme by name in your presentation frontmatter: theme: theme-name. Built-in themes come with Marp; custom themes are editable CSS files."
              />

              {/* Theme list */}
              <div className="flex flex-col gap-2 mb-4" data-testid="theme-grid">
                {themes.map((theme) => (
                  <div
                    key={theme.id}
                    className="flex items-center gap-3 px-4 rounded-lg"
                    style={{
                      height: 52,
                      backgroundColor: "var(--surface-card)",
                    }}
                    data-testid="theme-card"
                  >
                    {theme.builtin ? (
                      <Lock
                        size={16}
                        style={{ color: "var(--fg-muted)", flexShrink: 0 }}
                      />
                    ) : (
                      <Palette
                        size={16}
                        style={{ color: "var(--accent-primary)", flexShrink: 0 }}
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <code
                        className="text-sm font-medium"
                        style={{
                          fontFamily: "var(--font-mono)",
                          color: "var(--fg-primary)",
                        }}
                      >
                        {theme.name}
                      </code>
                      <p
                        className="text-xs truncate"
                        style={{
                          fontFamily: "var(--font-body)",
                          color: "var(--fg-muted)",
                        }}
                      >
                        {theme.description}
                      </p>
                    </div>
                    {!theme.builtin && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openThemeEditor(theme.id)}
                          className="p-1.5 rounded"
                          style={{ color: "var(--fg-muted)" }}
                          title="Edit theme CSS"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => deleteTheme(theme.id)}
                          className="p-1.5 rounded"
                          style={{ color: "var(--fg-muted)" }}
                          title="Delete theme"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    )}
                    {theme.builtin && (
                      <span
                        className="text-[10px] px-2 py-0.5 rounded-full"
                        style={{
                          backgroundColor: "var(--surface-elevated)",
                          color: "var(--fg-muted)",
                        }}
                      >
                        built-in
                      </span>
                    )}
                  </div>
                ))}
              </div>

              {/* New theme button/form */}
              {showNewTheme ? (
                <div
                  className="flex items-center gap-2 px-4 py-3 rounded-lg"
                  style={{ backgroundColor: "var(--surface-card)" }}
                >
                  <input
                    type="text"
                    value={newThemeName}
                    onChange={(e) => setNewThemeName(e.target.value)}
                    placeholder="theme-name (slug format)"
                    autoFocus
                    className="flex-1 px-3 py-1.5 rounded-lg text-sm outline-none"
                    style={{
                      backgroundColor: "var(--surface-primary)",
                      border: "1px solid var(--border-subtle)",
                      color: "var(--fg-primary)",
                      fontFamily: "var(--font-mono)",
                    }}
                    onKeyDown={(e) => e.key === "Enter" && createTheme()}
                    data-testid="new-theme-input"
                  />
                  <button
                    onClick={createTheme}
                    disabled={!newThemeName.trim()}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium"
                    style={{
                      background: "linear-gradient(90deg, var(--accent-primary), var(--accent-secondary))",
                      color: "#FFF",
                      opacity: !newThemeName.trim() ? 0.5 : 1,
                    }}
                  >
                    Create
                  </button>
                  <button
                    onClick={() => { setShowNewTheme(false); setNewThemeName(""); }}
                    className="px-3 py-1.5 rounded-lg text-xs"
                    style={{ color: "var(--fg-muted)" }}
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowNewTheme(true)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm w-full transition-colors"
                  style={{
                    border: "1px dashed var(--border-subtle)",
                    color: "var(--fg-muted)",
                    fontFamily: "var(--font-body)",
                  }}
                  data-testid="new-theme-btn"
                >
                  <Plus size={16} />
                  Create custom theme
                </button>
              )}

              {/* Theme CSS editor */}
              {editingTheme && (
                <div className="mt-4">
                  <div
                    className="flex items-center justify-between px-3 py-2 rounded-t-lg"
                    style={{
                      backgroundColor: "var(--surface-card)",
                      borderBottom: "1px solid var(--border-subtle)",
                    }}
                  >
                    <code
                      className="text-sm"
                      style={{
                        fontFamily: "var(--font-mono)",
                        color: "var(--accent-primary)",
                      }}
                    >
                      {editingTheme}.css
                    </code>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={async () => {
                          await saveThemeCss();
                          setEditingTheme(null);
                          setThemeCss("");
                        }}
                        className="px-3 py-1 rounded text-xs font-medium"
                        style={{
                          background: "linear-gradient(90deg, var(--accent-primary), var(--accent-secondary))",
                          color: "#FFF",
                        }}
                      >
                        Save & Close
                      </button>
                      <button
                        onClick={() => { setEditingTheme(null); setThemeCss(""); }}
                        className="px-3 py-1 rounded text-xs"
                        style={{ color: "var(--fg-muted)" }}
                      >
                        Discard
                      </button>
                    </div>
                  </div>
                  <div
                    style={{ height: 400 }}
                    className="rounded-b-lg overflow-auto"
                  >
                    <CodeEditor
                      value={themeCss}
                      language="css"
                      onChange={setThemeCss}
                    />
                  </div>
                </div>
              )}
            </section>

            {/* Plugins */}
            <section id="section-plugins">
              <SectionHeader
                title="Plugins"
                description="Enable or disable plugins to extend your presentation capabilities."
              />
              <div className="flex flex-col gap-2" data-testid="plugin-list">
                {settings.plugins.map((plugin) => (
                  <PluginRow
                    key={plugin.id}
                    plugin={plugin}
                    onToggle={() => togglePlugin(plugin.id)}
                  />
                ))}
              </div>
            </section>

            {/* Editor Preferences */}
            <section id="section-editor">
              <SectionHeader
                title="Editor Preferences"
                description="Customize your editing experience."
              />
              <div className="flex flex-col gap-2" data-testid="editor-prefs">
                <PreferenceRow label="Font Size">
                  <NumberStepper
                    value={settings.editor.fontSize}
                    min={10}
                    max={24}
                    onChange={(v) => updateEditor("fontSize", v)}
                  />
                </PreferenceRow>
                <PreferenceRow label="Tab Size">
                  <NumberStepper
                    value={settings.editor.tabSize}
                    min={1}
                    max={8}
                    onChange={(v) => updateEditor("tabSize", v)}
                  />
                </PreferenceRow>
                <PreferenceRow label="Auto-Save">
                  <Toggle
                    checked={settings.editor.autoSave}
                    onChange={(v) => updateEditor("autoSave", v)}
                  />
                </PreferenceRow>
                <PreferenceRow label="Line Numbers">
                  <Toggle
                    checked={settings.editor.lineNumbers}
                    onChange={(v) => updateEditor("lineNumbers", v)}
                  />
                </PreferenceRow>
              </div>
            </section>

            {/* AI Provider */}
            <section id="section-ai">
              <SectionHeader
                title="AI Provider"
                description="Configure the OpenAI-compatible AI service used by the assistant. Works with Ollama (local), Claude, OpenAI, or any compatible endpoint."
              />
              <div className="flex flex-col gap-2" data-testid="ai-config">
                <AIField
                  label="API URL *"
                  value={settings.ai?.apiUrl ?? "http://localhost:11434/v1"}
                  placeholder="http://localhost:11434/v1"
                  onChange={(v) => updateAI("apiUrl", v)}
                  mono
                />
                <AIField
                  label="Model *"
                  value={settings.ai?.model ?? "gemma4"}
                  placeholder="gemma4"
                  onChange={(v) => updateAI("model", v)}
                  mono
                />
                <AIField
                  label="API Key / Token"
                  value={settings.ai?.apiKey ?? ""}
                  placeholder="Optional — not needed for local Ollama"
                  onChange={(v) => updateAI("apiKey", v)}
                  type="password"
                />
              </div>
              <p
                className="text-xs mt-3"
                style={{ color: "var(--fg-muted)", fontFamily: "var(--font-body)" }}
              >
                Changes are saved automatically. The AI assistant will use the new configuration on the next message.
              </p>
            </section>

            {/* Export */}
            <section id="section-export">
              <SectionHeader
                title="Export"
                description="Configure export settings for your presentations."
              />
              <p
                className="text-sm"
                style={{ color: "var(--fg-muted)" }}
              >
                Export settings coming soon.
              </p>
            </section>

            {/* About */}
            <section id="section-about">
              <SectionHeader title="About" description="" />
              <div
                className="rounded-xl p-6"
                style={{ backgroundColor: "var(--surface-card)" }}
              >
                <h3
                  className="text-lg font-bold"
                  style={{
                    fontFamily: "var(--font-heading)",
                    color: "var(--fg-primary)",
                  }}
                >
                  MarkShow
                </h3>
                <p
                  className="text-sm mt-1"
                  style={{
                    fontFamily: "var(--font-body)",
                    color: "var(--fg-secondary)",
                  }}
                >
                  A markdown-first presentation editor with an AI co-author.
                  Built with Next.js, Marp, and CodeMirror.
                </p>
                <p
                  className="text-xs mt-3"
                  style={{
                    fontFamily: "var(--font-caption)",
                    color: "var(--fg-muted)",
                  }}
                >
                  Version 0.1.0
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

function SectionHeader({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col gap-1 mb-4">
      <h2
        className="text-2xl font-bold"
        style={{
          fontFamily: "var(--font-heading)",
          color: "var(--fg-primary)",
        }}
      >
        {title}
      </h2>
      {description && (
        <p
          className="text-sm"
          style={{
            fontFamily: "var(--font-body)",
            color: "var(--fg-secondary)",
          }}
        >
          {description}
        </p>
      )}
    </div>
  );
}

function PluginRow({
  plugin,
  onToggle,
}: {
  plugin: PluginConfig;
  onToggle: () => void;
}) {
  const Icon = ICON_MAP[plugin.icon] || Code;
  return (
    <div
      className="flex items-center gap-4 px-4 rounded-lg"
      style={{
        height: 56,
        backgroundColor: "var(--surface-card)",
      }}
      data-testid="plugin-row"
    >
      <Icon
        size={20}
        style={{
          color: plugin.enabled
            ? "var(--accent-primary)"
            : "var(--fg-muted)",
        }}
      />
      <div className="flex-1">
        <span
          className="text-sm font-medium"
          style={{
            fontFamily: "var(--font-body)",
            color: "var(--fg-primary)",
          }}
        >
          {plugin.name}
        </span>
        <p
          className="text-xs"
          style={{
            fontFamily: "var(--font-body)",
            color: "var(--fg-muted)",
          }}
        >
          {plugin.description}
        </p>
      </div>
      <Toggle checked={plugin.enabled} onChange={onToggle} />
    </div>
  );
}

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className="flex items-center rounded-full transition-colors flex-shrink-0"
      style={{
        width: 40,
        height: 22,
        padding: "0 3px",
        backgroundColor: checked
          ? "var(--accent-primary)"
          : "var(--surface-elevated)",
        justifyContent: checked ? "flex-end" : "flex-start",
      }}
      role="switch"
      aria-checked={checked}
      data-testid="toggle"
    >
      <div
        className="rounded-full"
        style={{
          width: 16,
          height: 16,
          backgroundColor: "#FFF",
          transition: "transform 0.15s",
        }}
      />
    </button>
  );
}

function NumberStepper({
  value,
  min,
  max,
  onChange,
}: {
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
}) {
  return (
    <div
      className="flex items-center gap-2 px-3 rounded-lg"
      style={{
        height: 30,
        backgroundColor: "var(--surface-elevated)",
      }}
    >
      <button
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        className="text-sm font-bold"
        style={{
          color: value <= min ? "var(--fg-muted)" : "var(--fg-primary)",
        }}
      >
        −
      </button>
      <span
        className="text-sm min-w-[20px] text-center"
        style={{
          fontFamily: "var(--font-mono)",
          color: "var(--fg-primary)",
        }}
        data-testid="stepper-value"
      >
        {value}
      </span>
      <button
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        className="text-sm font-bold"
        style={{
          color: value >= max ? "var(--fg-muted)" : "var(--fg-primary)",
        }}
      >
        +
      </button>
    </div>
  );
}

function PreferenceRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="flex items-center justify-between px-4 rounded-lg"
      style={{
        height: 48,
        backgroundColor: "var(--surface-card)",
      }}
    >
      <span
        className="text-sm font-medium"
        style={{
          fontFamily: "var(--font-body)",
          color: "var(--fg-primary)",
        }}
      >
        {label}
      </span>
      {children}
    </div>
  );
}

function AIField({
  label,
  value,
  placeholder,
  onChange,
  type = "text",
  mono = false,
}: {
  label: string;
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
  type?: string;
  mono?: boolean;
}) {
  return (
    <div
      className="flex items-center justify-between gap-4 px-4 rounded-lg"
      style={{
        minHeight: 48,
        backgroundColor: "var(--surface-card)",
      }}
    >
      <span
        className="text-sm font-medium flex-shrink-0"
        style={{
          fontFamily: "var(--font-body)",
          color: "var(--fg-primary)",
          minWidth: 100,
        }}
      >
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="flex-1 px-3 py-2 rounded-lg text-sm outline-none text-right"
        style={{
          backgroundColor: "var(--surface-elevated)",
          border: "1px solid var(--border-subtle)",
          color: "var(--fg-primary)",
          fontFamily: mono ? "var(--font-mono)" : "var(--font-body)",
        }}
      />
    </div>
  );
}
