/**
 * MarpRenderer port — contract for rendering Marp markdown to HTML.
 *
 * Implementations live in infrastructure/ and can be swapped
 * (e.g., server-side Marp Core, browser-side, remote service).
 */

export interface RenderResult {
  /** Full HTML document string with embedded styles and scripts */
  html: string;
  /** Number of slides detected */
  slideCount: number;
  /** CSS extracted from the rendering */
  css: string;
}

export interface MarpRenderer {
  /**
   * Render Marp markdown to HTML slides.
   * @param markdown - Marp-flavored markdown source
   * @param css - Optional custom CSS to inject
   * @param js - Optional custom JavaScript to inject
   */
  render(markdown: string, css?: string, js?: string): Promise<RenderResult>;
}
