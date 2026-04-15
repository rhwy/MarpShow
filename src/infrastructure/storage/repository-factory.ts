/**
 * Factory for creating the PresentationRepository singleton.
 * Uses the STORAGE_PATH environment variable.
 */

import { FilesystemPresentationRepository } from "./filesystem-presentation-repository";
import type { PresentationRepository } from "@/core/ports";

let instance: PresentationRepository | null = null;

export function getPresentationRepository(): PresentationRepository {
  if (!instance) {
    const storagePath = process.env.STORAGE_PATH ?? "/data/presentations";
    instance = new FilesystemPresentationRepository(storagePath);
  }
  return instance;
}
