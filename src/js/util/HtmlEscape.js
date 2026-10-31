const HTML_ESCAPES = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;'
};

/**
 * Escapes text for interpolation into an HTML template string.
 *
 * @param {string} text
 * @return {string}
 */
export function escapeHtml(text) {
  return `${text}`.replace(/[&<>"']/g, character => HTML_ESCAPES[character]);
}
