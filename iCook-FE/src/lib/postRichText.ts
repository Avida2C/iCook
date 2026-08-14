const ALLOWED_TAGS = new Set([
  "B",
  "STRONG",
  "I",
  "EM",
  "U",
  "BR",
  "P",
  "DIV",
  "SPAN",
  "A",
  "IMG",
  "H1",
  "H2",
  "H3",
  "SMALL",
]);

function decodeEntities(text: string): string {
  return text
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'");
}

/** Strip tags for previews, search, and share text. */
export function plainTextFromHtml(html: string): string {
  return decodeEntities(
    html
      .replace(/<br\s*\/?>/gi, " ")
      .replace(/<\/(?:p|div|h1|h2|h3|small)>/gi, " ")
      .replace(/<[^>]+>/g, " "),
  )
    .replace(/\s+/g, " ")
    .trim();
}

export function postBodyHasContent(html: string): boolean {
  if (/<img\b/i.test(html)) return true;
  return plainTextFromHtml(html).length > 0;
}

function safeHref(raw: string): string | null {
  const href = raw.trim();
  if (/^(https?:|mailto:)/i.test(href)) return href;
  if (href.startsWith("/") && !href.startsWith("//")) return href;
  return null;
}

function safeImageSrc(raw: string): string | null {
  const src = raw.trim();
  if (/^data:image\/(jpeg|jpg|png|webp);base64,/i.test(src)) return src;
  if (/^https?:\/\//i.test(src)) return src;
  return null;
}

function safeColor(raw: string): string | null {
  const value = raw.trim();
  if (/^#([0-9a-f]{3,8})$/i.test(value)) return value;
  if (/^rgba?\(/i.test(value)) return value;
  return null;
}

function allowedStyle(style: string): string {
  const parts: string[] = [];
  const color = style.match(/(?:^|;)\s*color\s*:\s*([^;]+)/i);
  if (color) {
    const value = safeColor(color[1]);
    if (value) parts.push(`color: ${value}`);
  }
  const align = style.match(/(?:^|;)\s*text-align\s*:\s*(left|center|right|justify)/i);
  if (align) parts.push(`text-align: ${align[1].toLowerCase()}`);
  return parts.join("; ");
}

function cleanNode(node: Node) {
  if (node.nodeType === Node.COMMENT_NODE) {
    node.parentNode?.removeChild(node);
    return;
  }
  if (node.nodeType !== Node.ELEMENT_NODE) return;

  const el = node as HTMLElement;
  const tag = el.tagName;

  if (tag === "FONT") {
    const color =
      safeColor(el.getAttribute("color") ?? "") ??
      safeColor(
        (el.getAttribute("style") ?? "").match(/(?:^|;)\s*color\s*:\s*([^;]+)/i)?.[1] ??
          "",
      );
    const span = el.ownerDocument.createElement("span");
    if (color) span.setAttribute("style", `color: ${color}`);
    const parent = el.parentNode;
    if (parent) {
      while (el.firstChild) span.appendChild(el.firstChild);
      parent.replaceChild(span, el);
      cleanNode(span);
    }
    return;
  }

  if (!ALLOWED_TAGS.has(tag)) {
    const parent = el.parentNode;
    if (parent) {
      while (el.firstChild) parent.insertBefore(el.firstChild, el);
      parent.removeChild(el);
    }
    return;
  }

  const allowed = new Set<string>();
  if (tag === "A") allowed.add("href");
  if (tag === "IMG") {
    allowed.add("src");
    allowed.add("alt");
  }
  if (
    tag === "SPAN" ||
    tag === "P" ||
    tag === "DIV" ||
    tag === "H1" ||
    tag === "H2" ||
    tag === "H3" ||
    tag === "SMALL"
  ) {
    allowed.add("style");
    allowed.add("class");
  }

  for (const attr of [...el.attributes]) {
    if (!allowed.has(attr.name.toLowerCase())) {
      el.removeAttribute(attr.name);
    }
  }

  if (tag === "A") {
    const href = el.getAttribute("href");
    const safe = href ? safeHref(href) : null;
    if (safe) el.setAttribute("href", safe);
    else el.removeAttribute("href");
    el.setAttribute("rel", "noopener noreferrer");
    el.setAttribute("target", "_blank");
  }

  if (tag === "IMG") {
    const src = el.getAttribute("src");
    const safe = src ? safeImageSrc(src) : null;
    if (safe) {
      el.setAttribute("src", safe);
      el.setAttribute("alt", el.getAttribute("alt") ?? "");
    } else {
      el.remove();
      return;
    }
  }

  const style = el.getAttribute("style");
  if (style) {
    const next = allowedStyle(style);
    if (next) el.setAttribute("style", next);
    else el.removeAttribute("style");
  }

  const className = el.getAttribute("class");
  if (className) {
    const next = className
      .split(/\s+/)
      .filter(
        (token) =>
          token === "post-small" ||
          token === "post-tiny" ||
          token === "post-color-ink" ||
          token === "post-color-brand" ||
          token === "post-color-muted",
      )
      .join(" ");
    if (next) el.setAttribute("class", next);
    else el.removeAttribute("class");
  }

  for (const child of [...el.childNodes]) cleanNode(child);
}

export function sanitizePostHtml(html: string): string {
  if (typeof document === "undefined") return html;
  const template = document.createElement("template");
  template.innerHTML = html;
  for (const child of [...template.content.childNodes]) cleanNode(child);
  return template.innerHTML;
}
