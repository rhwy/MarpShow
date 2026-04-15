/**
 * Application settings domain model.
 *
 * Settings are global (not per-presentation) and stored on the filesystem.
 */

export interface ThemeConfig {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  /** CSS gradient or color for the preview card */
  readonly previewGradient: string;
}

export interface PluginConfig {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly icon: string;
  readonly enabled: boolean;
}

export interface EditorPreferences {
  readonly fontSize: number;
  readonly tabSize: number;
  readonly autoSave: boolean;
  readonly lineNumbers: boolean;
}

export interface AIProviderConfig {
  /** OpenAI-compatible API base URL (mandatory) */
  readonly apiUrl: string;
  /** Model name (mandatory) */
  readonly model: string;
  /** API key / token (optional — not needed for local Ollama) */
  readonly apiKey: string;
}

export interface AppSettings {
  readonly activeTheme: string;
  readonly plugins: PluginConfig[];
  readonly editor: EditorPreferences;
  readonly ai: AIProviderConfig;
}

/**
 * Available themes (static catalog).
 */
export const AVAILABLE_THEMES: ThemeConfig[] = [
  {
    id: "default",
    name: "Default Dark",
    description: "Deep space aesthetic with neon accents",
    previewGradient: "linear-gradient(135deg, #1a1a2e, #16213e)",
  },
  {
    id: "gaia",
    name: "Minimal Light",
    description: "Clean white canvas for professional slides",
    previewGradient: "linear-gradient(135deg, #c9d6df, #e2e2e2)",
  },
  {
    id: "uncover",
    name: "Neon Glow",
    description: "Vibrant neon colors on dark backgrounds",
    previewGradient: "linear-gradient(135deg, #1a1a2e, #4a1a6b)",
  },
  {
    id: "corporate-blue",
    name: "Corporate Blue",
    description: "Professional blue for business decks",
    previewGradient: "linear-gradient(135deg, #0c2340, #1a4a7a)",
  },
  {
    id: "nature-green",
    name: "Nature Green",
    description: "Organic greens for eco-conscious talks",
    previewGradient: "linear-gradient(135deg, #1a3a2a, #2a6a3a)",
  },
  {
    id: "retro-amber",
    name: "Retro Amber",
    description: "Warm tones with a vintage vibe",
    previewGradient: "linear-gradient(135deg, #3a2a0a, #8a6a1a)",
  },
];

/**
 * Default plugins catalog.
 */
export const DEFAULT_PLUGINS: PluginConfig[] = [
  {
    id: "katex",
    name: "Math Equations (KaTeX)",
    description: "Render LaTeX math expressions in slides",
    icon: "sigma",
    enabled: true,
  },
  {
    id: "mermaid",
    name: "Mermaid Diagrams",
    description: "Create flowcharts and diagrams from text",
    icon: "git-branch",
    enabled: true,
  },
  {
    id: "syntax-highlighting",
    name: "Code Syntax Highlighting",
    description: "Add language-specific code highlighting",
    icon: "code",
    enabled: false,
  },
  {
    id: "speaker-notes",
    name: "Speaker Notes",
    description: "Add private notes visible only to the presenter",
    icon: "mic",
    enabled: false,
  },
];

/**
 * Default application settings.
 */
export function createDefaultSettings(): AppSettings {
  return {
    activeTheme: "default",
    plugins: DEFAULT_PLUGINS,
    editor: {
      fontSize: 14,
      tabSize: 2,
      autoSave: true,
      lineNumbers: true,
    },
    ai: {
      apiUrl: "http://localhost:11434/v1",
      model: "gemma4",
      apiKey: "",
    },
  };
}
