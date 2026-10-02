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
 * If it's legacy plain text (e.g. bullet points with -, *, •, or newlines, or numbered lists), converts to formatted HTML.
 */
export function formatDescriptionHtml(raw: string = ""): string {
  if (!raw) return "";
  if (isHtmlContent(raw)) {
    return raw;
  }

  // Escape HTML characters in plain text
  const escapeHtml = (str: string) =>
    str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

  // Convert plain text to formatted HTML
  const rawLines = raw.split(/\r?\n/);
  let inBulletList = false;
  let inNumberList = false;
  let html = "";

  const closeLists = () => {
    if (inBulletList) {
      html += "</ul>";
      inBulletList = false;
    }
    if (inNumberList) {
      html += "</ol>";
      inNumberList = false;
    }
  };

  for (const rawLine of rawLines) {
    const line = rawLine.trim();
    if (!line) {
      closeLists();
      continue;
    }

    const isBullet =
      /^[•\-\*]\s+/.test(line) ||
      line.startsWith("•") ||
      line.startsWith("- ") ||
      line.startsWith("* ");
    const isNumbered = /^\d+[\.\)]\s+/.test(line);

    if (isBullet) {
      if (inNumberList) {
        html += "</ol>";
        inNumberList = false;
      }
      if (!inBulletList) {
        html += "<ul>";
        inBulletList = true;
      }
      const itemText = escapeHtml(line.replace(/^[•\-\*]\s*/, ""));
      html += `<li>${itemText}</li>`;
    } else if (isNumbered) {
      if (inBulletList) {
        html += "</ul>";
        inBulletList = false;
      }
      if (!inNumberList) {
        html += "<ol>";
        inNumberList = true;
      }
      const itemText = escapeHtml(line.replace(/^\d+[\.\)]\s*/, ""));
      html += `<li>${itemText}</li>`;
    } else {
      closeLists();
      html += `<p>${escapeHtml(line)}</p>`;
    }
  }

  closeLists();
  return html;
}

