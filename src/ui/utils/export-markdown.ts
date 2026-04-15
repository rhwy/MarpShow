/**
 * Export a presentation as a Markdown file download.
 */

import { createLogger } from "@/infrastructure/logging";

const logger = createLogger("ExportMarkdown");

export function exportMarkdown(markdown: string, title: string): void {
  logger.info("Starting Markdown export", { title });

  const blob = new Blob([markdown], { type: "text/markdown" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${title}.md`;
  a.click();
  URL.revokeObjectURL(url);

  logger.info("Markdown export complete", { title });
}
