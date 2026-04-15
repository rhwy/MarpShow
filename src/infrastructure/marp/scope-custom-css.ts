/**
 * Scope custom CSS to work within Marp's DOM structure.
 *
 * Marp renders slides inside: div.marpit > svg > foreignObject > section
 * When users write `section { color: red; }`, they expect it to work,
 * but it won't because Marp's own selectors are more specific.
 *
 * This utility rewrites `section` selectors to use the full Marp path,
 * so user CSS has enough specificity to override Marp defaults.
 */

const MARP_SECTION = "div.marpit > svg > foreignObject > section";

/**
 * Rewrite CSS selectors so `section` references match Marp's specificity.
 *
 * Rules:
 * - `section` → full Marp section selector
 * - `section.myclass` → full selector with class
 * - `section h1` → full selector descendant
 * - `section:nth-of-type(2)` → full selector with pseudo
 * - Leaves non-section selectors untouched
 * - Leaves @rules (media, keyframes, etc.) untouched
 */
export function scopeCustomCss(css: string): string {
  if (!css.trim()) return css;

  // Replace section selectors with Marp-specific ones
  // Match `section` at the start of a selector or after a comma
  return css.replace(
    /(^|,\s*|\}\s*)section(?=[\s.:#\[{,>+~]|$)/gm,
    `$1${MARP_SECTION}`,
  );
}
