/**
 * Text and HTML processing utilities for product descriptions and formatting
 */

/**
 * Strips HTML tags and decodes basic entities for clean plain text display (e.g. metadata, search)
 */
export function stripHtml(html: string = ""): string {
  if (!html) return "";
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Checks if a string contains HTML tags
 */
export function isHtmlContent(str: string = ""): boolean {
  if (!str) return false;
  return /<[a-z][\s\S]*>/i.test(str);
}

/**
 * Normalizes description content into clean HTML.
 * If the content already contains HTML tags, returns as is.
 * If it's legacy plain text (e.g. bullet points with -, *, •, or newlines), converts to formatted HTML.
 */
export function formatDescriptionHtml(raw: string = ""): string {
  if (!raw) return "";
  if (isHtmlContent(raw)) {
    return raw;
  }

  // Convert plain text to formatted HTML
  const lines = raw.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (lines.length === 0) return "";

  let inList = false;
  let html = "";

  for (const line of lines) {
    const isBullet = line.startsWith("•") || line.startsWith("-") || line.startsWith("*");
    if (isBullet) {
      if (!inList) {
        html += "<ul>";
        inList = true;
      }
      const itemText = line.replace(/^[•\-\*]\s*/, "");
      html += `<li>${itemText}</li>`;
    } else {
      if (inList) {
        html += "</ul>";
        inList = false;
      }
      html += `<p>${line}</p>`;
    }
  }

  if (inList) {
    html += "</ul>";
  }

  return html;
}
