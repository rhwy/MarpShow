export type {
  PresentationId,
  VersionSnapshot,
  ConversationRole,
  ConversationMessage,
  PresentationMetadata,
  Presentation,
  PresentationSummary,
} from "./presentation";

export {
  createPresentation,
  createVersionSnapshot,
  countSlides,
  toSummary,
} from "./presentation";

export { slugify, slugifyDeterministic } from "./slugify";

export type {
  ThemeConfig,
  PluginConfig,
  EditorPreferences,
  AIProviderConfig,
  AppSettings,
} from "./settings";
export {
  AVAILABLE_THEMES,
  DEFAULT_PLUGINS,
  createDefaultSettings,
} from "./settings";
