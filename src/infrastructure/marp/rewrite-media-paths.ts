/**
 * Rewrite relative media paths in rendered HTML to point to the API endpoint.
 *
 * Converts:
 *   src="./photo.png"        → src="/api/presentations/{id}/media/photo.png"
 *   src="photo.png"          → src="/api/presentations/{id}/media/photo.png"
 *   url('./bg.jpg')          → url('/api/presentations/{id}/media/bg.jpg')
 *   url(./bg.jpg)            → url('/api/presentations/{id}/media/bg.jpg')
 *
 * Leaves absolute URLs (http://, https://, data:, //) untouched.
 */
export function rewriteMediaPaths(html: string, presentationId: string): string {
  const base = `/api/presentations/${presentationId}/media`;

  // Rewrite src="./file" and src="file" (but not absolute URLs)
  let result = html.replace(
    /(\bsrc=["'])(\.\/)?((?!https?:\/\/|data:|\/\/|\/)[^"']+)(["'])/g,
    (_match, prefix, _dotSlash, filePath, suffix) => {
      return `${prefix}${base}/${filePath}${suffix}`;
    },
  );

  // Rewrite url('./file') and url(./file) in CSS (but not absolute URLs)
  result = result.replace(
    /url\((['"]?)(\.\/)?((?!https?:\/\/|data:|\/\/|\/)[^)'"]+)\1\)/g,
    (_match, quote, _dotSlash, filePath) => {
      return `url(${quote}${base}/${filePath}${quote})`;
    },
  );

  return result;
}
