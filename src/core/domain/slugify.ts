/**
 * Slugify a string for use as a URL-safe folder/ID.
 *
 * - Lowercases, replaces spaces and special chars with hyphens
 * - Removes consecutive hyphens and leading/trailing hyphens
 * - Appends a short random suffix to avoid collisions
 */
export function slugify(text: string): string {
  const base = text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove diacritics
    .replace(/[^a-z0-9\s-]/g, "")   // Remove special chars
    .replace(/[\s_]+/g, "-")         // Spaces/underscores → hyphens
    .replace(/-+/g, "-")             // Collapse multiple hyphens
    .replace(/^-|-$/g, "");          // Trim leading/trailing hyphens

  // Append short random suffix for uniqueness
  const suffix = Math.random().toString(36).substring(2, 6);

  return base ? `${base}-${suffix}` : suffix;
}

/**
 * Slugify without random suffix — for deterministic use cases.
 */
export function slugifyDeterministic(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "") || "untitled";
}
