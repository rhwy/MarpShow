/**
 * Marp Core adapter — renders Marp markdown to HTML using @marp-team/marp-core.
 */

import { promises as fs } from "fs";
import path from "path";
import Marp from "@marp-team/marp-core";
import type { MarpRenderer, RenderResult } from "@/core/ports";
import { scopeCustomCss } from "./scope-custom-css";
import { createLogger } from "@/infrastructure/logging";

const logger = createLogger("MarpCoreRenderer");

/**
 * Marp renders slides inside: div.marpit > svg > foreignObject > section
 * All our CSS overrides must use this full selector path to beat Marp's specificity.
 */
const SECTION = "div.marpit > svg > foreignObject > section";

const THEMES_DIR = path.join(
  process.env.STORAGE_PATH ?? "/data/presentations",
  "themes",
);

export class MarpCoreRenderer implements MarpRenderer {
  /**
   * Load custom theme CSS files from the themes directory
   * and register them with Marp's themeSet.
   */
  private async loadCustomThemes(marp: Marp): Promise<void> {
    try {
      const files = await fs.readdir(THEMES_DIR);
      for (const file of files) {
        if (!file.endsWith(".css")) continue;
        try {
          const css = await fs.readFile(path.join(THEMES_DIR, file), "utf-8");
          marp.themeSet.add(css);
          logger.debug("Loaded custom theme", { file });
        } catch (err) {
          logger.warn("Failed to load theme file", { file, err });
        }
      }
    } catch {
      // Themes dir doesn't exist yet — that's fine
    }
  }

  async render(
    markdown: string,
    customCss?: string,
    customJs?: string,
  ): Promise<RenderResult> {
    logger.info("Rendering Marp markdown", {
      length: markdown.length,
      hasCustomCss: !!customCss,
      hasCustomJs: !!customJs,
    });

    try {
      const marp = new Marp({
        html: true,
        math: false,
      });

      // Load and register custom themes from the themes folder
      await this.loadCustomThemes(marp);

      const { html, css } = marp.render(markdown);

      // Count slides by counting <section> tags in the output
      const slideCount = (html.match(/<section[\s>]/g) || []).length;

      // Combine Marp CSS with custom CSS (scoped to Marp's selector specificity)
      const scopedCustomCss = customCss
        ? scopeCustomCss(customCss)
        : undefined;
      const combinedCss = scopedCustomCss
        ? `${css}\n${scopedCustomCss}`
        : css;

      // Build a complete HTML document with styles and scripts embedded
      const fullHtml = buildSlideDocument(html, combinedCss, customJs);

      logger.info("Marp rendering complete", { slideCount });

      return {
        html: fullHtml,
        slideCount,
        css: combinedCss,
      };
    } catch (err) {
      logger.error("Marp rendering failed", err);
      throw new Error(`Marp rendering failed: ${err}`);
    }
  }
}

/**
 * Build a complete HTML document for slide display.
 */
function buildSlideDocument(
  bodyHtml: string,
  css: string,
  js?: string,
): string {
  const scriptTag = js
    ? `\n<script>\n${js}\n</script>`
    : "";

  // Strip CDN @import and @charset directives for offline support
  const offlineCss = css
    .replace(/@charset\s+"[^"]*";\s*/g, "")
    .replace(/@import\s+url\([^)]*\)\s*;?\s*/g, "")
    .replace(/@import\s+"[^"]*"\s*;?\s*/g, "");

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
/* Local font-face declarations (offline-safe) */
@font-face {
  font-family: 'Lato';
  font-weight: 400;
  font-style: normal;
  src: url('/fonts/lato-latin-400-normal.woff2') format('woff2');
  font-display: swap;
}
@font-face {
  font-family: 'Lato';
  font-weight: 900;
  font-style: normal;
  src: url('/fonts/lato-latin-900-normal.woff2') format('woff2');
  font-display: swap;
}
@font-face {
  font-family: 'Roboto Mono';
  font-weight: 400;
  font-style: normal;
  src: url('/fonts/roboto-mono-latin-400-normal.woff2') format('woff2');
  font-display: swap;
}
@font-face {
  font-family: 'Roboto Mono';
  font-weight: 700;
  font-style: normal;
  src: url('/fonts/roboto-mono-latin-700-normal.woff2') format('woff2');
  font-display: swap;
}

${offlineCss}

/* MarkShow overrides — using Marp's full selector specificity */
body {
  margin: 0;
  padding: 0;
  background: #0A0A0A;
}

/* Auto-fit images: fill remaining vertical space in each slide */
${SECTION} {
  display: flex !important;
  flex-direction: column !important;
}
${SECTION} > :is(h1, h2, h3, h4, h5, h6, marp-h1, marp-h2, marp-h3, marp-h4, marp-h5, marp-h6, p, ul, ol, blockquote, pre, marp-pre, table, header, footer) {
  flex-shrink: 0;
}
${SECTION} > p:has(> img) {
  flex: 1 1 0;
  min-height: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}
${SECTION} img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  display: block;
  margin: 0 auto;
}

/* Mermaid diagrams — proportional fit */
.mermaid-container {
  flex: 1 1 0;
  min-height: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}
.mermaid-container svg {
  max-width: 100% !important;
  max-height: 100% !important;
  height: auto !important;
}

/* Chart.js canvases — proportional fit */
${SECTION} canvas {
  max-width: 100%;
  max-height: 100%;
}
</style>
</head>
<body>
${bodyHtml}

<!-- Mermaid.js diagram rendering -->
<script src="/mermaid.min.js"></script>
<script>
(function() {
  // Initialize Mermaid with dark theme
  if (typeof mermaid !== 'undefined') {
    mermaid.initialize({
      startOnLoad: false,
      theme: 'dark',
      securityLevel: 'loose',
      flowchart: { useMaxWidth: true },
      sequence: { useMaxWidth: true },
    });

    // Find all mermaid code blocks and render them
    document.querySelectorAll('pre code.language-mermaid, pre code[class*="mermaid"]').forEach(function(block, i) {
      var pre = block.parentElement;
      var container = document.createElement('div');
      container.className = 'mermaid-container';
      container.id = 'mermaid-' + i;
      container.textContent = block.textContent;
      pre.replaceWith(container);
    });

    // Also handle bare <pre class="mermaid"> blocks
    document.querySelectorAll('pre.mermaid').forEach(function(pre, i) {
      var container = document.createElement('div');
      container.className = 'mermaid-container';
      container.id = 'mermaid-bare-' + i;
      container.textContent = pre.textContent;
      pre.replaceWith(container);
    });

    mermaid.run({ querySelector: '.mermaid-container' });
  }
})();
</script>

<!-- Chart.js rendering -->
<script src="/chart.umd.min.js"></script>
<script>
(function() {
  if (typeof Chart === 'undefined') return;

  // Find chart code blocks: \`\`\`chart
  document.querySelectorAll('pre code.language-chart, pre code[class*="chart"]').forEach(function(block, i) {
    var pre = block.parentElement;
    try {
      var config = JSON.parse(block.textContent);

      // Set defaults for dark theme
      if (!config.options) config.options = {};
      if (!config.options.plugins) config.options.plugins = {};
      if (!config.options.plugins.legend) config.options.plugins.legend = {};
      if (!config.options.plugins.legend.labels) config.options.plugins.legend.labels = {};
      config.options.plugins.legend.labels.color = config.options.plugins.legend.labels.color || '#A1A1AA';
      config.options.responsive = true;
      config.options.maintainAspectRatio = true;

      // Style scales for dark theme
      if (config.options.scales) {
        Object.values(config.options.scales).forEach(function(scale) {
          if (!scale.ticks) scale.ticks = {};
          scale.ticks.color = scale.ticks.color || '#A1A1AA';
          if (!scale.grid) scale.grid = {};
          scale.grid.color = scale.grid.color || '#1A1A1A';
        });
      }

      var wrapper = document.createElement('div');
      wrapper.style.cssText = 'width:100%;max-height:100%;display:flex;align-items:center;justify-content:center;';
      var canvas = document.createElement('canvas');
      canvas.id = 'chart-' + i;
      wrapper.appendChild(canvas);
      pre.replaceWith(wrapper);

      new Chart(canvas, config);
    } catch(e) {
      console.error('Chart.js error:', e);
    }
  });
})();
</script>
${scriptTag}
</body>
</html>`;
}
