/**
 * Export a presentation as PPTX.
 *
 * Converts Marp markdown slides into a PowerPoint file.
 * Loads the pptxgenjs browser bundle at runtime to avoid SSR issues.
 */

import { createLogger } from "@/infrastructure/logging";

const logger = createLogger("ExportPPTX");

interface SlideContent {
  title: string;
  body: string[];
}

// Cache the loaded library
let PptxGenJSClass: unknown = null;

async function loadPptxGenJS(): Promise<unknown> {
  if (PptxGenJSClass) return PptxGenJSClass;

  // Load the browser bundle via script tag
  return new Promise((resolve, reject) => {
    if ((window as unknown as Record<string, unknown>).PptxGenJS) {
      PptxGenJSClass = (window as unknown as Record<string, unknown>).PptxGenJS;
      resolve(PptxGenJSClass);
      return;
    }

    const script = document.createElement("script");
    script.src = "/pptxgen.bundle.js";
    script.onload = () => {
      PptxGenJSClass = (window as unknown as Record<string, unknown>).PptxGenJS;
      if (PptxGenJSClass) {
        resolve(PptxGenJSClass);
      } else {
        reject(new Error("PptxGenJS not found after loading bundle"));
      }
    };
    script.onerror = () => reject(new Error("Failed to load pptxgenjs bundle"));
    document.head.appendChild(script);
  });
}

export async function exportPptx(
  markdown: string,
  title: string,
): Promise<void> {
  logger.info("Starting PPTX export", { title });

  if (typeof window === "undefined") {
    throw new Error("PPTX export is only available in the browser");
  }

  try {
    const PptxGenJS = (await loadPptxGenJS()) as new () => {
      title: string;
      layout: string;
      addSlide: () => {
        background: { color: string };
        addText: (text: unknown, opts: unknown) => void;
      };
      writeFile: (opts: { fileName: string }) => Promise<void>;
    };

    const slides = parseSlides(markdown);
    const pptx = new PptxGenJS();

    pptx.title = title;
    pptx.layout = "LAYOUT_WIDE";

    for (const slide of slides) {
      const pptxSlide = pptx.addSlide();
      pptxSlide.background = { color: "0A0A0A" };

      if (slide.title) {
        pptxSlide.addText(slide.title, {
          x: 0.8,
          y: 0.5,
          w: "85%",
          fontSize: 28,
          fontFace: "Arial",
          color: "FFFFFF",
          bold: true,
        });
      }

      if (slide.body.length > 0) {
        const bodyText = slide.body.map((line: string) => ({
          text: line.replace(/^[-*]\s+/, ""),
          options: {
            fontSize: 16,
            fontFace: "Arial",
            color: "A1A1AA",
            bullet: line.startsWith("- ") || line.startsWith("* "),
            breakLine: true,
          },
        }));

        pptxSlide.addText(bodyText, {
          x: 0.8,
          y: slide.title ? 1.5 : 0.5,
          w: "85%",
          h: "70%",
          valign: "top",
        });
      }
    }

    await pptx.writeFile({ fileName: `${title}.pptx` });
    logger.info("PPTX export complete", { title, slides: slides.length });
  } catch (err) {
    logger.error("PPTX export failed", { title, err });
    alert("PPTX export failed. Check the console for details.");
    throw err;
  }
}

function parseSlides(markdown: string): SlideContent[] {
  const frontmatterEnd = markdown.indexOf("---", markdown.indexOf("---") + 3);
  const content =
    frontmatterEnd >= 0 ? markdown.slice(frontmatterEnd + 3) : markdown;

  const rawSlides = content.split(/\n---\s*\n/);

  return rawSlides
    .map((raw) => {
      const lines = raw.trim().split("\n").filter(Boolean);
      let slideTitle = "";
      const body: string[] = [];

      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith("#")) {
          slideTitle = trimmed.replace(/^#+\s*/, "");
        } else if (trimmed.startsWith("![")) {
          body.push(`[Image: ${trimmed.match(/!\[(.*?)\]/)?.[1] || "image"}]`);
        } else if (trimmed.startsWith("<!--") || trimmed.startsWith("```")) {
          // Skip
        } else {
          body.push(trimmed);
        }
      }

      return { title: slideTitle, body };
    })
    .filter((s) => s.title || s.body.length > 0);
}
