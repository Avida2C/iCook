/** Share a post or recipe link via the system share sheet, or copy to clipboard. */
export async function shareContent(opts: {
  title: string;
  text?: string;
  url: string;
}): Promise<"shared" | "copied" | "cancelled"> {
  const { title, text, url } = opts;

  if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
    try {
      await navigator.share({ title, text, url });
      return "shared";
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        return "cancelled";
      }
      // fall through to clipboard
    }
  }

  try {
    await navigator.clipboard.writeText(url);
    return "copied";
  } catch {
    return "cancelled";
  }
}

export function absoluteAppUrl(path: string): string {
  if (typeof window === "undefined") return path;
  return new URL(path, window.location.origin).toString();
}
