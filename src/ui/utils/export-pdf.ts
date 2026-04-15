/**
 * Export a presentation as PDF using browser print dialog.
 *
 * Opens the rendered Marp HTML in a new window, then triggers
 * window.print() which lets the user "Save as PDF".
 * Works completely offline — no external service needed.
 */

import { createLogger } from "@/infrastructure/logging";

const logger = createLogger("ExportPDF");

export async function exportPdf(
  presentationId: string,
  title: string,
): Promise<void> {
  logger.info("Starting PDF export", { presentationId });

  try {
    // Render the presentation
    const res = await fetch(`/api/presentations/${presentationId}/render`, {
      method: "POST",
    });
    if (!res.ok) throw new Error(`Render failed: HTTP ${res.status}`);
    const { html } = await res.json();

    // Open in a new window for printing
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      throw new Error("Popup blocked — please allow popups for this site");
    }

    // Inject print-optimized CSS
    const printHtml = html.replace(
      "</head>",
      `<style>
        @media print {
          @page { size: 1280px 720px; margin: 0; }
          body { margin: 0; }
        }
      </style>
      <title>${title}</title>
      </head>`,
    );

    printWindow.document.write(printHtml);
    printWindow.document.close();

    // Wait for content to load, then print
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
      }, 500);
    };

    logger.info("PDF export window opened", { presentationId });
  } catch (err) {
    logger.error("PDF export failed", { presentationId, err });
    throw err;
  }
}
